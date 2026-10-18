import { z } from "zod";

export const ChoiceOptionSchema = z.object({
  id: z.string().describe("Short machine token, e.g. '3' or 'dumbbells'."),
  label: z.string().describe("Label shown to the user, e.g. '3 days'."),
});

export const WidgetSchema = z.discriminatedUnion("type", [
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
            .min(1),
        }),
      )
      .min(1),
  }),
]);

export type WidgetInput = z.infer<typeof WidgetSchema>;
