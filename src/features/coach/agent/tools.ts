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

  show_widget: tool({
    description:
      "Render one structured UI widget in the chat: a question with chips, a plan preview, a session adjustment, a safety notice, a gentle routine, or an urgent-care stop. Call this as the last action in your turn — after calling it, send no further text and no further tool calls this turn.",
    inputSchema: z.object({ widget: WidgetSchema }),
    execute: async () => "Widget shown to the user.",
  }),
};
