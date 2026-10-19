import type { UIMessageStreamWriter } from "ai";
import type { CoachProgress, CoachProgressStep } from "@/features/chat/types";

type ProgressWriter = Pick<UIMessageStreamWriter, "write">;

export function createCoachProgressWriter(writer: ProgressWriter) {
  let steps: CoachProgressStep[] = [];
  let seq = 0;

  function publish() {
    const data: CoachProgress = { steps: [...steps] };
    writer.write({
      type: "data-coach-progress",
      id: "coach-progress",
      data,
    });
  }

  function completeActive() {
    const active = steps.find((step) => step.status === "active");
    if (active) active.status = "complete";
  }

  return {
    start(label: string) {
      completeActive();
      steps = [
        {
          id: `step-${seq++}`,
          label,
          status: "active",
        },
      ];
      publish();
    },
    advance(label: string) {
      completeActive();
      steps.push({
        id: `step-${seq++}`,
        label,
        status: "active",
      });
      publish();
    },
    completeAll() {
      for (const step of steps) {
        step.status = "complete";
      }
      publish();
    },
  };
}
