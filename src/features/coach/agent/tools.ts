import { tool } from "ai";
import { z } from "zod";
import { searchExercises } from "@/lib/exercises/exercise-catalog";
import { WidgetSchema } from "./widget-schema";

export const coachTools = {
  search_exercises: tool({
    description:
      "Search the exercise catalog for candidate exercises matching equipment, experience level, target muscles, or category. Always call this before naming specific exercises — never invent an exercise name that didn't come from this tool.",
    inputSchema: z.object({
      equipment: z
        .array(z.string())
        .nullable()
        .describe(
          "Equipment available, e.g. 'dumbbell', 'barbell', 'body only', 'bands', 'machine', 'cable', 'kettlebells'. Null to allow any.",
        ),
      level: z
        .enum(["beginner", "intermediate", "expert"])
        .nullable()
        .describe("The user's training experience. Null if unknown."),
      muscles: z
        .array(z.string())
        .nullable()
        .describe(
          "Target muscles, e.g. 'chest', 'quadriceps', 'lower back'. Null for no preference.",
        ),
      category: z
        .enum([
          "cardio",
          "olympic weightlifting",
          "plyometrics",
          "powerlifting",
          "strength",
          "stretching",
          "strongman",
        ])
        .nullable(),
      excludeHighImpact: z
        .boolean()
        .nullable()
        .describe(
          "Set true for pain, injury-screening, or gentle-movement contexts to exclude high-impact categories.",
        ),
    }),
    execute: async (input) => {
      const results = searchExercises({
        equipment: input.equipment ?? undefined,
        level: input.level ?? undefined,
        muscles: input.muscles ?? undefined,
        category: input.category ?? undefined,
        excludeHighImpact: input.excludeHighImpact ?? undefined,
        limit: 8,
      });

      return JSON.stringify(
        results.map((exercise) => ({
          id: exercise.id,
          name: exercise.name,
          equipment: exercise.equipment,
          level: exercise.level,
          category: exercise.category,
          primaryMuscles: exercise.primaryMuscles,
        })),
      );
    },
  }),

  update_plan: tool({
    description:
      "Silently update the active plan in the database. Use this for exercise swaps — it saves the change without showing the full plan card. After calling this, call show_widget(exercise_swap) to show the comparison card. Pass all 7 days with the full updated exercise list. Never change the plan name.",
    inputSchema: z.object({
      name: z.string().describe("The plan name — must match the original, never change it."),
      daysPerWeek: z.number(),
      minutesPerSession: z.number(),
      days: z.array(
        z.object({
          label: z.string(),
          focus: z.string(),
          exercises: z
            .array(
              z.object({
                exerciseId: z
                  .string()
                  .describe("Exact id from search_exercises or plan context."),
                name: z.string(),
                sets: z.number(),
                reps: z.string(),
                equipment: z.string(),
              }),
            )
            .min(0),
        }),
      ).min(1),
    }),
    execute: async () => "Plan updated in database.",
  }),

  show_widget: tool({
    description:
      "Render one structured UI widget. Plan setup order: experience → muscle_focus → equipment_access → session-length choice_chips. After muscle_focus, the next setup widget is usually equipment_access — never ask gym vs home in text only, and never use choice_chips for gym/home. Session length: if duration is unknown, call choice_chips with exactly four options (20–30 min, 30–45 min, 45–60 min, 60–90 min). If they already named a time, map it and do not confirm with chips. Never ask the user to pick a weekly split — you choose the default from the instructions. Never use the words beginner, intermediate, or expert. Other widgets: multi-select chips, plan preview (create or full-week update only), exercise_swap (single exercise replacement — use instead of plan_preview for one-exercise changes), session adjustment, safety notice, gentle routine, urgent care. Call this as the last action in your turn.",
    inputSchema: z.object({ widget: WidgetSchema }),
    execute: async () => "Widget shown to the user.",
  }),
};
