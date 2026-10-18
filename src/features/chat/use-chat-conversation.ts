"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ConversationData, StoredMessage } from "./lib/get-conversation-data";
import type {
  ChatBlock,
  ChatMessage,
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

function isDataWidgetPart(part: { type: string }): part is DataWidgetPart {
  return part.type === "data-widget";
}

/** The client's notion of "today" — a (date, weekday) pair sent to the
 * server with every log write/read so stats are computed against exactly
 * what the UI itself treats as today. */
function getTodayRef(): { date: string; dayLabel: string } {
  const now = new Date();
  return {
    date: now.toISOString().slice(0, 10),
    dayLabel: now.toLocaleDateString("en-US", { weekday: "long" }),
  };
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

export function useChatConversation(userName: string, initialData?: ConversationData) {
  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/coach/chat" }),
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
  const [todayLog, setDayLog] = useState<DayLog | null>(initialData?.todayLog ?? null);
  const [panel, setPanel] = useState<PanelState>({
    tab: "today",
    plan: initialPlan,
    today: initialPlan ? todayFromPlan(initialPlan) : null,
    highlightTab: null,
  });

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
          todayLog: DayLog | null;
          messages: StoredMessage[];
        };

        if (cancelled || epochAtStart !== historyEpoch.current) return;

        setHasPlan(Boolean(data.hasPlan && data.activePlan));
        setDayLog(data.todayLog ?? null);

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

  // Sync the panel as soon as a plan_created block streams in — the plan is
  // already saved server-side by this point, so there is no explicit accept step.
  const syncedPlanBlockIds = useRef(new Set<string>());
  useEffect(() => {
    for (const message of realChat.messages) {
      const widgetPart = message.parts.find(isDataWidgetPart);
      const block = widgetPart?.data;
      if (!block || block.type !== "plan_created") continue;
      if (syncedPlanBlockIds.current.has(block.id)) continue;
      syncedPlanBlockIds.current.add(block.id);

      const plan = block.plan;
      setHasPlan(true);
      setPanel((prev) => ({
        ...prev,
        plan,
        today: todayFromPlan(plan),
      }));
    }
  }, [realChat.messages]);

  const messages: ChatMessage[] = useMemo(
    () =>
      realChat.messages.map((message) => {
        const text = message.parts
          .filter((part) => part.type === "text")
          .map((part) => part.text)
          .join("");
        const widgetPart = message.parts.find(isDataWidgetPart);

        return {
          id: message.id,
          role: message.role === "user" ? "user" : "assistant",
          text: text || undefined,
          block: widgetPart?.data,
        };
      }),
    [realChat.messages],
  );

  const isReady = realChat.status === "ready";
  const isWaiting = realChat.status === "submitted";

  const highlightPanel = useCallback((tab: PanelTab) => {
    setPanel((prev) => ({ ...prev, tab, highlightTab: tab }));
    setTimeout(() => {
      setPanel((prev) =>
        prev.highlightTab === tab ? { ...prev, highlightTab: null } : prev,
      );
    }, 1600);
  }, []);

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
      const dayLabel = panel.today?.dayLabel;
      if (!dayLabel) return;
      const { date } = getTodayRef();

      setDayLog((prev) => {
        const sameDay = prev?.date === date && prev?.dayLabel === dayLabel;
        const entries = sameDay ? [...prev.entries] : [];
        const index = entries.findIndex(
          (entry) => entry.exerciseId === exerciseId,
        );
        const nextEntry = { exerciseId, status, note };
        if (index >= 0) {
          entries[index] = nextEntry;
        } else {
          entries.push(nextEntry);
        }
        return { date, dayLabel, entries };
      });

      void fetch("/api/coach/today-log", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, dayLabel, exerciseId, status, note }),
      });
    },
    [panel.today?.dayLabel],
  );

  const startAdjustedWorkout = useCallback(
    (toMinutes: number, fromEquipment: string, toEquipment: string) => {
      setPanel((prev) => ({
        ...prev,
        today: {
          dayLabel: prev.today?.dayLabel ?? "Today",
          focus: prev.today?.focus ?? "Adjusted session",
          minutes: toMinutes,
          exercises: prev.today?.exercises ?? [],
          adjusted: {
            reason: "Lower energy today",
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
      void fetch("/api/coach/messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blockId, selection }),
      });
    },
    [],
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
      setDayLog(null);
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
    error: realChat.error,
    panel,
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
