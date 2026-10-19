import { z } from "zod";

export const ChoiceOptionSchema = z.object({
  id: z.string().describe("Short machine token, e.g. '3' or 'not-sure'."),
  label: z.string().describe("Label shown to the user, in plain language."),
  description: z
    .string()
    .optional()
    .describe(
      "One short line on what this choice means for the plan. Include it when the label alone could be ambiguous.",
    ),
});

export const WidgetSchema = z.discriminatedUnion("type", [
  z
    .object({
      type: z.literal("experience"),
    })
    .describe(
      "How training has gone so far. The UI owns the options. Never say beginner, intermediate, or expert.",
    ),
  z
    .object({
      type: z.literal("muscle_focus"),
    })
    .describe(
      "Which areas to train. The UI starts with full, upper, or lower body, and can open every muscle.",
    ),
  z
    .object({
      type: z.literal("equipment_access"),
    })
    .describe(
      "Call after experience and muscle_focus in plan setup when you need where they train most weeks (gym vs home) or specific equipment. Never use choice_chips for gym/home. The UI owns all options.",
    ),
  z
    .object({
      type: z.literal("choice_chips"),
      options: z.array(ChoiceOptionSchema).min(2).max(6),
    })
    .describe(
      "Single-choice chips. For unknown session length use exactly four options: 20–30 min, 30–45 min, 45–60 min, 60–90 min. Skip this if they already named a time. Never use this for weekly splits. Other uses: yes/no. Labels only, no description.",
    ),
  z.object({
    type: z.literal("multi_select_chips"),
    options: z.array(ChoiceOptionSchema).min(2).max(8),
  }),
  z.object({
    type: z.literal("safety_notice"),
    body: z.string(),
    acknowledgeLabel: z.string(),
  }),
  z.object({
    type: z.literal("session_mutation"),
    fromMinutes: z.number(),
    toMinutes: z.number(),
    fromEquipment: z.string(),
    toEquipment: z.string(),
    fromIntensity: z.string(),
    toIntensity: z.string(),
  }),
  z.object({
    type: z.literal("gentle_routine"),
    exercises: z
      .array(
        z.object({
          exerciseId: z.string().optional(),
          name: z.string(),
          detail: z.string(),
          dose: z.string().optional(),
          sets: z.number().optional(),
        }),
      )
      .min(1)
      .max(6),
  }),
  z.object({
    type: z.literal("urgent_care"),
  }),
  z.object({
    type: z.literal("plan_preview"),
    name: z.string(),
    daysPerWeek: z.number(),
    minutesPerSession: z.number(),
    days: z
      .array(
        z.object({
          label: z.string(),
          focus: z.string(),
          exercises: z
            .array(
              z.object({
                exerciseId: z
                  .string()
                  .describe("Exact id returned by search_exercises."),
                name: z.string(),
                sets: z.number(),
                reps: z.string(),
                equipment: z.string(),
              }),
            )
            .min(0),
        }),
      )
      .min(1),
  }),
  z
    .object({
      type: z.literal("exercise_options"),
      sessionLabel: z
        .string()
        .describe("Day and focus context, e.g. 'Monday – Push Strength'."),
      replacing: z
        .object({
          exerciseId: z.string(),
          name: z.string(),
          sets: z.number(),
          reps: z.string(),
          equipment: z.string(),
        })
        .describe("The exercise being replaced."),
      options: z
        .array(
          z.object({
            exerciseId: z.string(),
            name: z.string(),
            equipment: z.string(),
            primaryMuscles: z.array(z.string()),
            sets: z.number(),
            reps: z.string(),
          }),
        )
        .min(1)
        .max(5),
    })
    .describe(
      "Show a selectable list of replacement exercise options. Call after search_exercises. Never list options in text — always use this widget.",
    ),
  z
    .object({
      type: z.literal("exercise_swap"),
      sessionLabel: z
        .string()
        .describe("Day and focus label, e.g. 'Monday – Push Strength'."),
      from: z.object({
        exerciseId: z.string(),
        name: z.string(),
        sets: z.number(),
        reps: z.string(),
        equipment: z.string(),
      }),
      to: z.object({
        exerciseId: z.string(),
        name: z.string(),
        sets: z.number(),
        reps: z.string(),
        equipment: z.string(),
      }),
      reason: z
        .string()
        .optional()
        .describe(
          "One short line explaining why this swap fits — movement pattern match, equipment available, or preference.",
        ),
      scope: z
        .enum(["today", "all"])
        .optional()
        .describe(
          "'today' = this session only, 'all' = updated in the plan for all upcoming sessions.",
        ),
    })
    .describe(
      "Show a before/after comparison card when swapping a single exercise in one session. Call after scope is confirmed.",
    ),
]);

export type WidgetInput = z.infer<typeof WidgetSchema>;
