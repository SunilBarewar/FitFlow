import { randomUUID } from "node:crypto";
import type { ChatBlock } from "@/features/chat/types";
import { getExerciseById } from "@/lib/exercises/exercise-catalog";
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
    case "experience":
      return { type: "experience", id };
    case "muscle_focus":
      return { type: "muscle_focus", id };
    case "equipment_access":
      return { type: "equipment_access", id };
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
        type: "plan_created",
        id,
        plan: {
          id: randomUUID(),
          name: widget.name,
          version: 1,
          status: "active",
          daysPerWeek: widget.daysPerWeek,
          minutesPerSession: widget.minutesPerSession,
          days: widget.days.map((day) => ({
            id: randomUUID(),
            label: day.label,
            focus: day.focus,
            exercises: day.exercises.map((exercise) => {
              const catalogExercise = getExerciseById(exercise.exerciseId);
              return {
                id: exercise.exerciseId,
                name: exercise.name,
                sets: exercise.sets,
                reps: exercise.reps,
                equipment: exercise.equipment,
                instructions: catalogExercise?.instructions,
                muscles: catalogExercise?.primaryMuscles,
                images: catalogExercise?.images,
              };
            }),
          })),
        },
      };
    default:
      return null;
  }
}
