"use client";

import { useCallback, useRef, useState } from "react";
import {
  buildGeneratedPlan,
  mockActivePlan,
  mockProgress,
  mockTodayWorkout,
} from "./mock-data";
import type {
  ChatMessage,
  PanelTab,
  Plan,
  ProgressStats,
  TodayWorkout,
} from "./types";

type Flow = "idle" | "plan" | "lighter" | "pain";

type PlanDraftAnswers = {
  daysPerWeek?: number;
  minutesPerSession?: number;
  equipment?: string[];
};

type PanelState = {
  tab: PanelTab;
  plan: Plan;
  today: TodayWorkout;
  progress: ProgressStats;
  highlightTab: PanelTab | null;
};

let messageSeq = 0;
function nextId(prefix: string) {
  messageSeq += 1;
  return `${prefix}-${messageSeq}`;
}

export function useChatConversation(userName: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: nextId("msg"),
      role: "assistant",
      text: `Hi ${userName} — ask me anything, or pick a starting point below.`,
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [flow, setFlow] = useState<Flow>("idle");
  const [step, setStep] = useState<string>("idle");
  const planDraftRef = useRef<PlanDraftAnswers>({});
  const [panel, setPanel] = useState<PanelState>({
    tab: "today",
    plan: mockActivePlan,
    today: mockTodayWorkout,
    progress: mockProgress,
    highlightTab: null,
  });

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const appendUser = useCallback((text: string) => {
    setMessages((prev) => [...prev, { id: nextId("msg"), role: "user", text }]);
  }, []);

  const appendAssistant = useCallback(
    (partial: Omit<ChatMessage, "id" | "role">, delay = 650) => {
      setIsTyping(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          { id: nextId("msg"), role: "assistant", ...partial },
        ]);
      }, delay);
    },
    [],
  );

  const highlightPanel = useCallback((tab: PanelTab) => {
    setPanel((prev) => ({ ...prev, tab, highlightTab: tab }));
    setTimeout(() => {
      setPanel((prev) =>
        prev.highlightTab === tab ? { ...prev, highlightTab: null } : prev,
      );
    }, 1600);
  }, []);

  const resolveBlock = useCallback(
    (blockId: string, answer?: string | string[]) => {
      setMessages((prev) =>
        prev.map((m) => {
          if (m.block?.id !== blockId) return m;
          const block = m.block;
          if (answer !== undefined) {
            if (block.type === "choice_chips" && typeof answer === "string") {
              return { ...m, resolved: true, block: { ...block, answer } };
            }
            if (block.type === "multi_select_chips" && Array.isArray(answer)) {
              return { ...m, resolved: true, block: { ...block, answer } };
            }
          }
          return { ...m, resolved: true };
        }),
      );
    },
    [],
  );

  const startSuggestion = useCallback(
    (suggestionId: "plan" | "lighter" | "pain" | "progress") => {
      if (suggestionId === "progress") {
        appendUser("How am I doing this week?");
        appendAssistant({
          text: `You're on a ${mockProgress.streakDays}-day streak and have completed ${mockProgress.weeklyCompleted} of ${mockProgress.weeklyTarget} workouts this week. Keep it up!`,
        });
        highlightPanel("progress");
        return;
      }

      if (suggestionId === "plan") {
        appendUser("Build me a weekly workout plan.");
        setFlow("plan");
        setStep("days");
        appendAssistant({
          text: "I can do that. How many days a week can you realistically train?",
          block: {
            type: "choice_chips",
            id: nextId("block"),
            options: [
              { id: "2", label: "2 days" },
              { id: "3", label: "3 days" },
              { id: "4", label: "4 days" },
              { id: "5", label: "5+ days" },
            ],
          },
        });
        return;
      }

      if (suggestionId === "lighter") {
        appendUser(
          "I'm not feeling energetic today. Give me something lighter at home.",
        );
        setFlow("lighter");
        setStep("time");
        appendAssistant({
          text: "I can adjust today without disrupting your week. How much time feels realistic?",
          block: {
            type: "choice_chips",
            id: nextId("block"),
            options: [
              { id: "10", label: "10 min" },
              { id: "20", label: "20 min" },
              { id: "30", label: "30 min" },
              { id: "unsure", label: "Not sure" },
            ],
          },
        });
        return;
      }

      if (suggestionId === "pain") {
        appendUser("I have back pain. Can you suggest exercises I can do?");
        setFlow("pain");
        setStep("safety");
        appendAssistant({
          text: "I'm sorry you're dealing with that. I can share general, gentle movement ideas, but I can't determine the cause of back pain. If you have severe or worsening pain, pain after a significant injury, weakness or numbness, or pain with chest symptoms, seek urgent medical care instead of exercising.",
          block: {
            type: "safety_notice",
            id: nextId("block"),
            body: "If none of those apply, I can help with gentle movement ideas.",
            acknowledgeLabel: "I understand, continue",
          },
        });
      }
    },
    [appendUser, appendAssistant, highlightPanel],
  );

  const answerChoice = useCallback(
    (blockId: string, optionId: string, optionLabel: string) => {
      resolveBlock(blockId, optionId);
      appendUser(optionLabel);

      if (flow === "plan") {
        if (step === "days") {
          planDraftRef.current.daysPerWeek = Number(optionId);
          setStep("duration");
          appendAssistant({
            text: "Great — about how much time do you have per workout?",
            block: {
              type: "choice_chips",
              id: nextId("block"),
              options: [
                { id: "20", label: "15–30 min" },
                { id: "40", label: "30–45 min" },
                { id: "55", label: "45–60 min" },
              ],
            },
          });
          return;
        }
        if (step === "duration") {
          planDraftRef.current.minutesPerSession = Number(optionId);
          setStep("equipment");
          appendAssistant({
            text: "What equipment can you use most weeks? Pick as many as apply.",
            block: {
              type: "multi_select_chips",
              id: nextId("block"),
              options: [
                { id: "dumbbells", label: "Dumbbells" },
                { id: "bench", label: "Bench" },
                { id: "barbell", label: "Barbell" },
                { id: "bands", label: "Resistance bands" },
                { id: "bodyweight", label: "Bodyweight only" },
                { id: "gym", label: "Full gym" },
              ],
            },
          });
          return;
        }
        if (step === "experience") {
          setStep("limitations");
          appendAssistant({
            text: "Any injuries, pain, or movements you want to avoid? This helps me keep the plan appropriate.",
            block: {
              type: "choice_chips",
              id: nextId("block"),
              options: [
                { id: "none", label: "None" },
                { id: "something", label: "Yes, something to avoid" },
              ],
            },
          });
          return;
        }
        if (step === "limitations") {
          setStep("generating");
          appendAssistant(
            {
              text: "Got it — generating your plan now…",
            },
            500,
          );
          setTimeout(() => {
            const current = planDraftRef.current;
            const plan = buildGeneratedPlan({
              daysPerWeek: current.daysPerWeek ?? 3,
              minutesPerSession: current.minutesPerSession ?? 40,
              equipment: current.equipment ?? ["dumbbells"],
            });
            setStep("preview");
            appendAssistant(
              {
                text: `Here's your ${plan.name.toLowerCase()}. Review it and accept when you're ready.`,
                block: { type: "plan_preview", id: nextId("block"), plan },
              },
              1400,
            );
          }, 500);
          return;
        }
      }

      if (flow === "lighter" && step === "time") {
        setStep("preview");
        appendAssistant({
          text: "Here's the adjustment for today:",
          block: {
            type: "session_mutation",
            id: nextId("block"),
            fromMinutes: mockTodayWorkout.minutes,
            toMinutes: optionId === "unsure" ? 20 : Number(optionId),
            fromEquipment: "Dumbbells",
            toEquipment: "Bodyweight",
            fromIntensity: "Moderate",
            toIntensity: "Light",
          },
        });
        return;
      }

      if (flow === "pain") {
        if (step === "location") {
          setStep("injury");
          appendAssistant({
            text: "Did this start after a fall, accident, or other significant injury?",
            block: {
              type: "choice_chips",
              id: nextId("block"),
              options: [
                { id: "yes", label: "Yes" },
                { id: "no", label: "No" },
              ],
            },
          });
          return;
        }
        if (step === "injury") {
          if (optionId === "yes") {
            setStep("urgent");
            appendAssistant({
              text: "Given that, I don't want to suggest exercises right now.",
              block: { type: "urgent_care", id: nextId("block") },
            });
            setFlow("idle");
            return;
          }
          setStep("worsening");
          appendAssistant({
            text: "Is the pain severe, getting worse, or accompanied by numbness, tingling, or weakness?",
            block: {
              type: "choice_chips",
              id: nextId("block"),
              options: [
                { id: "yes", label: "Yes" },
                { id: "no", label: "No" },
              ],
            },
          });
          return;
        }
        if (step === "worsening") {
          if (optionId === "yes") {
            setStep("urgent");
            appendAssistant({
              text: "Given that, I don't want to suggest exercises right now.",
              block: { type: "urgent_care", id: nextId("block") },
            });
            setFlow("idle");
            return;
          }
          setStep("routine");
          appendAssistant(
            {
              text: "Thanks for clarifying. If gentle movement feels comfortable and you haven't been told to avoid it, here are a few low-intensity ideas. Stop if anything increases pain, causes numbness, or feels wrong.",
              block: {
                type: "gentle_routine",
                id: nextId("block"),
                exercises: [
                  {
                    name: "Cat-cow stretch",
                    detail: "2 min, slow and controlled",
                  },
                  { name: "Knee-to-chest stretch", detail: "30 sec per side" },
                  { name: "Glute bridge", detail: "2 sets of 10, light" },
                ],
              },
            },
            900,
          );
          setFlow("idle");
          highlightPanel("today");
          return;
        }
      }
    },
    [flow, step, appendUser, appendAssistant, resolveBlock, highlightPanel],
  );

  const answerMultiSelect = useCallback(
    (blockId: string, selectedIds: string[], selectedLabels: string[]) => {
      resolveBlock(blockId, selectedIds);
      appendUser(selectedLabels.join(", ") || "No preference");

      if (flow === "plan" && step === "equipment") {
        planDraftRef.current.equipment = selectedIds;
        setStep("experience");
        appendAssistant({
          text: "How would you describe your current training experience?",
          block: {
            type: "choice_chips",
            id: nextId("block"),
            options: [
              { id: "beginner", label: "Beginner" },
              { id: "intermediate", label: "Intermediate" },
              { id: "advanced", label: "Advanced" },
            ],
          },
        });
      }
    },
    [flow, step, appendUser, appendAssistant, resolveBlock],
  );

  const acknowledgeSafety = useCallback(
    (blockId: string) => {
      resolveBlock(blockId);
      appendUser("I understand, continue");
      setStep("location");
      appendAssistant({
        text: "Where is the discomfort most noticeable?",
        block: {
          type: "choice_chips",
          id: nextId("block"),
          options: [
            { id: "upper", label: "Upper back" },
            { id: "mid", label: "Mid back" },
            { id: "lower", label: "Lower back" },
            { id: "unsure", label: "Not sure" },
          ],
        },
      });
    },
    [appendUser, appendAssistant, resolveBlock],
  );

  const acceptPlan = useCallback(
    (blockId: string, plan: Plan) => {
      resolveBlock(blockId);
      const activated: Plan = { ...plan, status: "active" };
      setPanel((prev) => ({
        ...prev,
        plan: activated,
        today: {
          dayLabel: activated.days[0].label,
          focus: activated.days[0].focus,
          minutes: activated.minutesPerSession,
          exercises: activated.days[0].exercises,
        },
      }));
      highlightPanel("plan");
      appendAssistant({
        text: `${activated.name} is now active. I'll remember your equipment and schedule for next time.`,
      });
      setFlow("idle");
      setStep("idle");
    },
    [appendAssistant, highlightPanel, resolveBlock],
  );

  const declinePlan = useCallback(
    (blockId: string) => {
      resolveBlock(blockId);
      appendUser("Let me change something first");
      appendAssistant({
        text: "No problem — tell me what you'd like to change and I'll draft it again.",
      });
      setFlow("idle");
      setStep("idle");
    },
    [appendAssistant, appendUser, resolveBlock],
  );

  const startAdjustedWorkout = useCallback(
    (blockId: string, toMinutes: number) => {
      resolveBlock(blockId);
      appendUser("Start adjusted workout");
      setPanel((prev) => ({
        ...prev,
        today: {
          ...prev.today,
          minutes: toMinutes,
          adjusted: {
            reason: "Lower energy today",
            fromMinutes: mockTodayWorkout.minutes,
            fromEquipment: "Dumbbells",
            toEquipment: "Bodyweight",
          },
        },
      }));
      highlightPanel("today");
      appendAssistant({
        text: "Done — today's session is shortened to bodyweight only. Your weekly plan is unchanged.",
      });
      setFlow("idle");
      setStep("idle");
    },
    [appendAssistant, appendUser, highlightPanel, resolveBlock],
  );

  const keepOriginalWorkout = useCallback(
    (blockId: string) => {
      resolveBlock(blockId);
      appendUser("Keep original");
      appendAssistant({ text: "Sounds good — today stays as planned." });
      setFlow("idle");
      setStep("idle");
    },
    [appendAssistant, appendUser, resolveBlock],
  );

  const syncRealMessage = useCallback(
    (id: string, role: "user" | "assistant", text: string) => {
      setMessages((prev) => {
        const index = prev.findIndex((m) => m.id === id);
        if (index === -1) {
          return [...prev, { id, role, text }];
        }
        if (prev[index].text === text) return prev;
        const next = [...prev];
        next[index] = { ...next[index], text };
        return next;
      });
    },
    [],
  );

  const setPanelTab = useCallback((tab: PanelTab) => {
    setPanel((prev) => ({ ...prev, tab, highlightTab: null }));
  }, []);

  return {
    messages,
    isTyping,
    panel,
    startSuggestion,
    answerChoice,
    answerMultiSelect,
    acknowledgeSafety,
    acceptPlan,
    declinePlan,
    startAdjustedWorkout,
    keepOriginalWorkout,
    syncRealMessage,
    setPanelTab,
  };
}
