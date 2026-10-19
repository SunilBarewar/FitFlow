"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { sessionToDayLog } from "@/features/workout/lib/adapters";
import {
  clearSyncedSession,
  publishSession,
  subscribeToSession,
} from "@/features/workout/lib/session-sync";
import type { WorkoutSession } from "@/features/workout/types";
import { getTodayRef } from "@/lib/date/today";
import type {
  ConversationData,
  StoredMessage,
} from "./lib/get-conversation-data";
import type {
  ChatBlock,
  ChatMessage,
  CoachProgress,
  DayLog,
  ExerciseLogStatus,
  PanelTab,
  Plan,
  TodayWorkout,
} from "./types";

type PanelState = {
  tab: PanelTab;
  plan: Plan | null;
  today: TodayWorkout | null;
  highlightTab: PanelTab | null;
};

type DataWidgetPart = { type: "data-widget"; data: ChatBlock };
type CoachProgressPart = { type: "data-coach-progress"; data: CoachProgress };

function isDataWidgetPart(part: { type: string }): part is DataWidgetPart {
  return part.type === "data-widget";
}

function isCoachProgressPart(part: {
  type: string;
}): part is CoachProgressPart {
  return part.type === "data-coach-progress";
}

function textFromUiMessage(message: UIMessage | undefined): string {
  if (!message) return "";
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("");
}

function coachProgressFromMessages(
  messages: UIMessage[],
): CoachProgress | null {
  const last = messages.at(-1);
  if (!last || last.role !== "assistant") return null;
  const progressParts = last.parts.filter(isCoachProgressPart);
  const latest = progressParts.at(-1);
  return latest?.data ?? null;
}

function todayFromPlan(plan: Plan): TodayWorkout {
  const todayName = getTodayRef().dayLabel;
  const day =
    plan.days.find((item) => item.label === todayName) ?? plan.days[0];
  if (!day) {
    return {
      dayLabel: "Today",
      focus: plan.name,
      minutes: plan.minutesPerSession,
      exercises: [],
    };
  }
  return {
    dayLabel: day.label,
    focus: day.focus,
    minutes: plan.minutesPerSession,
    exercises: day.exercises,
  };
}

/** The coach's day-scoped edit, as the panel understands "today". */
function todayFromSession(
  session: WorkoutSession,
  plan: Plan | null,
): TodayWorkout {
  return {
    dayLabel: session.dayLabel,
    focus: session.focus || plan?.name || "Today's session",
    minutes: session.targetMinutes ?? plan?.minutesPerSession ?? 45,
    exercises: session.exercises,
    adjusted: session.adjustment
      ? {
          reason: session.adjustment.reason,
          fromMinutes:
            session.adjustment.fromMinutes ?? plan?.minutesPerSession ?? 45,
        }
      : undefined,
  };
}

function storedMessagesToUi(messages: StoredMessage[]): UIMessage[] {
  return messages.map((message) => {
    const parts: UIMessage["parts"] = [];
    if (message.text) {
      parts.push({ type: "text", text: message.text });
    }
    if (message.block) {
      parts.push({
        type: "data-widget",
        id: message.block.id,
        data: message.block,
      });
    }
    return {
      id: message.id,
      role: message.role,
      parts,
    };
  });
}

export function useChatConversation(
  userName: string,
  initialData?: ConversationData,
) {
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/coach/chat",
        // Resolved per request, so a tab left open across midnight still
        // writes day-scoped edits to the right date.
        body: () => {
          const { date, dayLabel } = getTodayRef();
          return { todayDate: date, todayDayLabel: dayLabel };
        },
      }),
    [],
  );

  const initialMessages = useMemo(
    () => (initialData ? storedMessagesToUi(initialData.messages) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const realChat = useChat({ transport, messages: initialMessages });
  const { setMessages } = realChat;
  /** Bumped when history hydration should be ignored (e.g. after starting a new chat). */
  const historyEpoch = useRef(0);
  /** Whether the initial data has already been applied. */
  const initialDataApplied = useRef(Boolean(initialData));

  const initialPlan = initialData?.hasPlan ? initialData.activePlan : null;

  const [hasPlan, setHasPlan] = useState(Boolean(initialData?.hasPlan));
  const [startNewChatPending, setStartNewChatPending] = useState(false);
  // Today's session, exactly as /plan has it. The panel's Today tab and its
  // DayLog are both read off this, so an edit made on either page shows up on
  // the other instead of each surface keeping its own idea of today.
  const [todaySession, setTodaySession] = useState<WorkoutSession | null>(
    initialData?.todaySession ?? null,
  );
  const sessionRef = useRef(todaySession);
  sessionRef.current = todaySession;
  const [panel, setPanel] = useState<PanelState>({
    tab: "today",
    plan: initialPlan,
    today: initialPlan ? todayFromPlan(initialPlan) : null,
    highlightTab: null,
  });

  useEffect(() => {
    if (todaySession) publishSession(todaySession);
  }, [todaySession]);

  useEffect(
    () =>
      subscribeToSession((incoming) => {
        const held = sessionRef.current;
        // Our own publish coming back around — nothing new to apply. A
        // different date is another tab that crossed midnight, not today.
        if (!incoming || incoming === held) return;
        if (held && incoming.date !== held.date) return;
        setTodaySession(incoming);
      }),
    [],
  );

  const refreshSession = useCallback(async () => {
    const { date, dayLabel } = getTodayRef();
    try {
      const response = await fetch(
        `/api/workout/today?date=${date}&dayLabel=${encodeURIComponent(dayLabel)}`,
      );
      if (!response.ok) return;
      const data = (await response.json()) as { session: WorkoutSession };
      setTodaySession(data.session);
    } catch {
      // The panel keeps what it has; a stale card beats an error the user
      // can't act on.
    }
  }, []);

  // Mirrors the home page: re-read only after the tab was genuinely hidden,
  // which covers a session changed on another device or in another tab that
  // the in-page channel never reached.
  const lastSessionRefresh = useRef(0);
  useEffect(() => {
    let tabWasHidden = document.visibilityState === "hidden";

    function onVisibilityChange() {
      if (document.visibilityState === "hidden") {
        tabWasHidden = true;
        return;
      }
      if (!tabWasHidden) return;
      tabWasHidden = false;
      if (Date.now() - lastSessionRefresh.current < 30_000) return;
      lastSessionRefresh.current = Date.now();
      void refreshSession();
    }

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [refreshSession]);

  useEffect(() => {
    // Skip the fetch when server-side data was already provided on mount.
    if (initialDataApplied.current) {
      initialDataApplied.current = false;
      return;
    }

    let cancelled = false;
    const epochAtStart = historyEpoch.current;

    async function loadConversation() {
      try {
        const { date, dayLabel } = getTodayRef();
        const response = await fetch(
          `/api/coach/conversation?date=${date}&dayLabel=${encodeURIComponent(dayLabel)}`,
        );
        if (!response.ok || cancelled) return;

        const data = (await response.json()) as {
          hasPlan: boolean;
          activePlan: Plan | null;
          todaySession: WorkoutSession | null;
          messages: StoredMessage[];
        };

        if (cancelled || epochAtStart !== historyEpoch.current) return;

        setHasPlan(Boolean(data.hasPlan && data.activePlan));
        setTodaySession(data.todaySession ?? null);

        const plan = data.hasPlan ? data.activePlan : null;
        setPanel((prev) => ({
          ...prev,
          plan: plan ?? prev.plan,
          today: plan ? todayFromPlan(plan) : prev.today,
        }));

        if (data.messages.length > 0) {
          setMessages(storedMessagesToUi(data.messages));
        }
      } catch {
        // Chat still works without history; panel stays hidden until a plan exists.
      }
    }

    void loadConversation();

    return () => {
      cancelled = true;
    };
  }, [setMessages]);

  const highlightPanel = useCallback((tab: PanelTab) => {
    setPanel((prev) => ({ ...prev, tab, highlightTab: tab }));
    setTimeout(() => {
      setPanel((prev) =>
        prev.highlightTab === tab ? { ...prev, highlightTab: null } : prev,
      );
    }, 1600);
  }, []);

  // Sync the panel as soon as a plan_created block streams in — the plan is
  // already saved server-side by this point, so there is no explicit accept step.
  const syncedPlanBlockIds = useRef(new Set<string>());
  useEffect(() => {
    for (const message of realChat.messages) {
      const widgetPart = message.parts.find(isDataWidgetPart);
      const block = widgetPart?.data;
      if (!block) continue;

      const isPlanBlock =
        block.type === "plan_created" || block.type === "plan_updated";
      if (!isPlanBlock && block.type !== "session_adjusted") continue;
      if (syncedPlanBlockIds.current.has(block.id)) continue;
      syncedPlanBlockIds.current.add(block.id);

      if (block.type === "session_adjusted") {
        // Today changed, the week didn't — keep the plan, repaint today.
        setTodaySession(block.session);
        highlightPanel("today");
        continue;
      }

      const plan = block.plan;
      setHasPlan(true);
      setPanel((prev) => ({
        ...prev,
        plan,
        today: todayFromPlan(plan),
      }));
      // A new plan re-materializes an untouched session server-side, so the
      // session on screen is about to be the wrong one.
      void refreshSession();
    }
  }, [realChat.messages, highlightPanel, refreshSession]);

  const isReady = realChat.status === "ready";
  const isStreaming = realChat.status === "streaming";
  const isWaiting = realChat.status === "submitted";

  const streamingAssistantText = useMemo(() => {
    if (!isStreaming) return "";
    const last = realChat.messages.at(-1);
    if (last?.role !== "assistant") return "";
    return textFromUiMessage(last).trim();
  }, [isStreaming, realChat.messages]);

  const showCoachActivity =
    isWaiting || (isStreaming && streamingAssistantText.length === 0);

  const coachActivityLabel = useMemo((): string | null => {
    if (!showCoachActivity) return null;
    const fromStream = coachProgressFromMessages(realChat.messages);
    const steps = fromStream?.steps;
    if (steps?.length) {
      const active = steps.find((step) => step.status === "active");
      return active?.label ?? steps.at(-1)?.label ?? "Thinking…";
    }
    return isWaiting ? "Sending…" : "Thinking…";
  }, [isWaiting, realChat.messages, showCoachActivity]);

  const messages: ChatMessage[] = useMemo(() => {
    const lastMessage = realChat.messages.at(-1);
    const streamingAssistantId =
      isStreaming && lastMessage?.role === "assistant" ? lastMessage.id : null;

    return realChat.messages.map((message) => {
      const text = message.parts
        .filter((part) => part.type === "text")
        .map((part) => part.text)
        .join("");
      const widgetPart = message.parts.find(isDataWidgetPart);
      const hideBlockWhileStreaming = message.id === streamingAssistantId;

      return {
        id: message.id,
        role: message.role === "user" ? "user" : "assistant",
        text: text || undefined,
        block: hideBlockWhileStreaming ? undefined : widgetPart?.data,
      };
    });
  }, [realChat.messages, isStreaming]);

  // The session describes today; the plan only describes the week. The plan
  // is the fallback for the window before a session exists.
  const today = useMemo(
    () =>
      todaySession ? todayFromSession(todaySession, panel.plan) : panel.today,
    [todaySession, panel.plan, panel.today],
  );

  const panelView = useMemo(() => ({ ...panel, today }), [panel, today]);

  const todayLog: DayLog | null = useMemo(
    () => (todaySession ? sessionToDayLog(todaySession) : null),
    [todaySession],
  );

  const sendText = useCallback(
    (text: string) => {
      realChat.sendMessage({ text });
    },
    [realChat],
  );

  const startSuggestion = useCallback(
    (text: string) => {
      sendText(text);
    },
    [sendText],
  );

  const selectChoice = useCallback(
    (_optionId: string, label: string) => {
      sendText(label);
    },
    [sendText],
  );

  const selectMultiChoice = useCallback(
    (_ids: string[], labels: string[]) => {
      sendText(labels.join(", ") || "No preference");
    },
    [sendText],
  );

  const acknowledgeSafety = useCallback(() => {
    sendText("I understand, continue");
  }, [sendText]);

  const viewPlan = useCallback(() => {
    highlightPanel("plan");
  }, [highlightPanel]);

  const setExerciseLog = useCallback(
    (exerciseId: string, status: ExerciseLogStatus, note?: string) => {
      const session = sessionRef.current;
      if (!session) return;
      const { date, dayLabel } = session;

      // Optimistic, same as the home page: the tap lands now and the server's
      // version replaces it a moment later.
      setTodaySession({
        ...session,
        exercises: session.exercises.map((exercise) =>
          exercise.id === exerciseId
            ? { ...exercise, status, note: note ?? undefined }
            : exercise,
        ),
      });

      void (async () => {
        try {
          const response = await fetch("/api/coach/today-log", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ date, dayLabel, exerciseId, status, note }),
          });
          if (!response.ok) throw new Error("save failed");
          const data = (await response.json()) as {
            session?: WorkoutSession;
          };
          if (data.session) setTodaySession(data.session);
        } catch {
          setTodaySession(session);
        }
      })();
    },
    [],
  );

  const startAdjustedWorkout = useCallback(
    (toMinutes: number, fromEquipment: string, toEquipment: string) => {
      // Only the fallback view gets this sketch of the change. Once today's
      // session exists it is what the panel renders, and the coach's own
      // adjust_today_session write arrives as a session_adjusted sync.
      setPanel((prev) => ({
        ...prev,
        today: {
          dayLabel: prev.today?.dayLabel ?? "Today",
          focus: prev.today?.focus ?? "Adjusted session",
          minutes: toMinutes,
          exercises: prev.today?.exercises ?? [],
          // The coach writes the real adjustment through adjust_today_session
          // and it arrives as a session_adjusted sync, reason and all. Only
          // describe the change here if no saved one exists.
          adjusted: prev.today?.adjusted ?? {
            reason: "Adjusted for today",
            fromMinutes: prev.today?.minutes ?? toMinutes,
            fromEquipment,
            toEquipment,
          },
        },
      }));
      highlightPanel("today");
      sendText("Start the adjusted workout.");
    },
    [highlightPanel, sendText],
  );

  const keepOriginalWorkout = useCallback(() => {
    sendText("I'll keep the original session.");
  }, [sendText]);

  const setPanelTab = useCallback((tab: PanelTab) => {
    setPanel((prev) => ({ ...prev, tab, highlightTab: null }));
  }, []);

  const persistBlockSelection = useCallback(
    (blockId: string, selection: string[] | string) => {
      setMessages((prev) =>
        prev.map((message) => {
          const widgetPart = message.parts.find(isDataWidgetPart);
          const block = widgetPart?.data;
          if (!block || block.id !== blockId) return message;

          return {
            ...message,
            parts: message.parts.map((part) => {
              if (!isDataWidgetPart(part) || part.data.id !== blockId) {
                return part;
              }
              return {
                ...part,
                data: { ...part.data, selected: selection },
              };
            }),
          };
        }),
      );

      void fetch("/api/coach/messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blockId, selection }),
      });
    },
    [setMessages],
  );

  const startNewChat = useCallback(async (): Promise<boolean> => {
    setStartNewChatPending(true);
    historyEpoch.current += 1;
    realChat.stop();
    realChat.clearError();
    try {
      const response = await fetch("/api/coach/conversation", {
        method: "DELETE",
      });
      if (!response.ok) return false;
      setMessages([]);
      syncedPlanBlockIds.current.clear();
      setHasPlan(false);
      setTodaySession(null);
      clearSyncedSession();
      setPanel({ tab: "today", plan: null, today: null, highlightTab: null });
      return true;
    } catch {
      return false;
    } finally {
      setStartNewChatPending(false);
    }
  }, [realChat, setMessages]);

  return {
    userName,
    hasPlan,
    messages,
    isReady,
    isWaiting,
    showCoachActivity,
    coachActivityLabel,
    error: realChat.error,
    panel: panelView,
    todayLog,
    setExerciseLog,
    startSuggestion,
    sendText,
    selectChoice,
    selectMultiChoice,
    acknowledgeSafety,
    viewPlan,
    startAdjustedWorkout,
    keepOriginalWorkout,
    setPanelTab,
    persistBlockSelection,
    startNewChat,
    startNewChatPending,
  };
}
