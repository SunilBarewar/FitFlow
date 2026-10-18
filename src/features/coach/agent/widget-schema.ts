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
      "Gym or home, with optional specific equipment. The UI owns the options.",
    ),
  z.object({
    type: z.literal("choice_chips"),
    options: z.array(ChoiceOptionSchema).min(2).max(6),
  }),
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
      .array(z.object({ name: z.string(), detail: z.string() }))
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
]);

export type WidgetInput = z.infer<typeof WidgetSchema>;
