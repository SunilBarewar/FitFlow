"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  ChatBlock,
  ChatMessage,
  PanelTab,
  Plan,
  ProgressStats,
  TodayWorkout,
} from "./types";

type PanelState = {
  tab: PanelTab;
  plan: Plan | null;
  today: TodayWorkout | null;
  progress: ProgressStats;
  highlightTab: PanelTab | null;
};

const EMPTY_PROGRESS: ProgressStats = {
  streakDays: 0,
  weeklyCompleted: 0,
  weeklyTarget: 0,
  totalWorkouts: 0,
  recentSessions: [],
};

type DataWidgetPart = { type: "data-widget"; data: ChatBlock };

function isDataWidgetPart(part: { type: string }): part is DataWidgetPart {
  return part.type === "data-widget";
}

type StoredMessage = {
  id: string;
  role: "user" | "assistant";
  text?: string;
  block?: ChatBlock;
};

function todayFromPlan(plan: Plan): TodayWorkout {
  const day = plan.days.find((item) => item.exercises.length > 0);
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

export function useChatConversation(userName: string) {
  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/coach/chat" }),
    [],
  );
  const realChat = useChat({ transport });
  const { setMessages } = realChat;

  const [hasPlan, setHasPlan] = useState(false);
  const [startNewChatPending, setStartNewChatPending] = useState(false);
  const [panel, setPanel] = useState<PanelState>({
    tab: "today",
    plan: null,
    today: null,
    progress: EMPTY_PROGRESS,
    highlightTab: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function loadConversation() {
      try {
        const response = await fetch("/api/coach/conversation");
        if (!response.ok || cancelled) return;

        const data = (await response.json()) as {
          hasPlan: boolean;
          activePlan: Plan | null;
          progress: ProgressStats | null;
          messages: StoredMessage[];
        };

        if (cancelled) return;

        setHasPlan(Boolean(data.hasPlan && data.activePlan));

        if (data.hasPlan && data.activePlan) {
          const plan = data.activePlan;
          setPanel((prev) => ({
            ...prev,
            plan,
            today: todayFromPlan(plan),
            progress: {
              ...EMPTY_PROGRESS,
              ...data.progress,
              weeklyTarget: data.progress?.weeklyTarget || plan.daysPerWeek,
            },
          }));
        } else if (data.progress) {
          setPanel((prev) => ({
            ...prev,
            progress: { ...EMPTY_PROGRESS, ...data.progress },
          }));
        }

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
        progress: {
          ...prev.progress,
          weeklyTarget: plan.daysPerWeek,
        },
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

  const startNewChat = useCallback(async () => {
    setStartNewChatPending(true);
    try {
      await fetch("/api/coach/conversation", { method: "DELETE" });
      setMessages([]);
    } catch {
      setMessages([]);
    } finally {
      setStartNewChatPending(false);
    }
  }, [setMessages]);

  return {
    userName,
    hasPlan,
    messages,
    isReady,
    isWaiting,
    error: realChat.error,
    panel,
    startSuggestion,
    sendText,
    selectChoice,
    selectMultiChoice,
    acknowledgeSafety,
    viewPlan,
    startAdjustedWorkout,
    keepOriginalWorkout,
    setPanelTab,
    startNewChat,
    startNewChatPending,
  };
}
