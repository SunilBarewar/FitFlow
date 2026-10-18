import { randomUUID } from "node:crypto";
import type { ChatBlock } from "@/features/chat/types";
import { WidgetSchema } from "./widget-schema";

export function toChatWidgetFromInput(input: unknown): ChatBlock | null {
  const widgetValue =
    input !== null && typeof input === "object" && "widget" in input
      ? (input as { widget: unknown }).widget
      : undefined;
  const result = WidgetSchema.safeParse(widgetValue);
  if (!result.success) return null;

  const widget = result.data;
  const id = randomUUID();

  switch (widget.type) {
    case "choice_chips":
      return { type: "choice_chips", id, options: widget.options };
    case "multi_select_chips":
      return { type: "multi_select_chips", id, options: widget.options };
    case "safety_notice":
      return {
        type: "safety_notice",
        id,
        body: widget.body,
        acknowledgeLabel: widget.acknowledgeLabel,
      };
    case "session_mutation":
      return {
        type: "session_mutation",
        id,
        fromMinutes: widget.fromMinutes,
        toMinutes: widget.toMinutes,
        fromEquipment: widget.fromEquipment,
        toEquipment: widget.toEquipment,
        fromIntensity: widget.fromIntensity,
        toIntensity: widget.toIntensity,
      };
    case "gentle_routine":
      return { type: "gentle_routine", id, exercises: widget.exercises };
    case "urgent_care":
      return { type: "urgent_care", id };
    case "plan_preview":
      return {
        type: "plan_preview",
        id,
        plan: {
          id: randomUUID(),
          name: widget.name,
          version: 1,
          status: "draft",
          daysPerWeek: widget.daysPerWeek,
          minutesPerSession: widget.minutesPerSession,
          days: widget.days.map((day) => ({
            id: randomUUID(),
            label: day.label,
            focus: day.focus,
            exercises: day.exercises.map((exercise) => ({
              id: exercise.exerciseId,
              name: exercise.name,
              sets: exercise.sets,
              reps: exercise.reps,
              equipment: exercise.equipment,
            })),
          })),
        },
      };
    default:
      return null;
  }
}
