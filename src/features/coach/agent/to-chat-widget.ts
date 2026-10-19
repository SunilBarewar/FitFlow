import { randomUUID } from "node:crypto";
import type { ChatBlock, Plan } from "@/features/chat/types";
import { getExerciseById } from "@/lib/exercises/exercise-catalog";
import { WidgetSchema } from "./widget-schema";

type RawExercise = { exerciseId: string; name: string; sets: number; reps: string; equipment: string };
type RawDay = { label: string; focus: string; exercises: RawExercise[] };

export function buildPlan(
  name: string,
  daysPerWeek: number,
  minutesPerSession: number,
  days: RawDay[],
): Plan {
  return {
    id: randomUUID(),
    name,
    version: 1,
    status: "active",
    daysPerWeek,
    minutesPerSession,
    days: days.map((day) => ({
      id: randomUUID(),
      label: day.label,
      focus: day.focus,
      exercises: day.exercises.map((ex) => {
        const catalog = getExerciseById(ex.exerciseId);
        return {
          id: ex.exerciseId,
          name: ex.name,
          sets: ex.sets,
          reps: ex.reps,
          equipment: ex.equipment,
          instructions: catalog?.instructions,
          muscles: catalog?.primaryMuscles,
          images: catalog?.images,
        };
      }),
    })),
  };
}

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
    case "exercise_options":
      return {
        type: "exercise_options",
        id,
        sessionLabel: widget.sessionLabel,
        replacing: widget.replacing,
        options: widget.options,
      };
    case "exercise_swap":
      return {
        type: "exercise_swap",
        id,
        sessionLabel: widget.sessionLabel,
        from: widget.from,
        to: widget.to,
        reason: widget.reason,
        scope: widget.scope,
      };
    case "plan_preview":
      return {
        type: "plan_created",
        id,
        plan: buildPlan(widget.name, widget.daysPerWeek, widget.minutesPerSession, widget.days),
      };
    default:
      return null;
  }
}
