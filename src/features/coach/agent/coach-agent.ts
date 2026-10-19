import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { ToolLoopAgent } from "ai";
import { z } from "zod";
import { COACH_INSTRUCTIONS } from "./coach-instructions";
import { coachTools } from "./tools";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { createOpenAI } from "@ai-sdk/openai";

const coachCallOptionsSchema = z.object({
  sessionContext: z.string(),
});

export type CoachCallOptions = z.infer<typeof coachCallOptionsSchema>;

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const coachAgent = new ToolLoopAgent<CoachCallOptions>({
  model: openai("gpt-5.1"),
  instructions: COACH_INSTRUCTIONS,
  tools: coachTools,
  callOptionsSchema: coachCallOptionsSchema,
  prepareCall: ({ options, instructions, ...rest }) => {
    const base =
      typeof instructions === "string" ? instructions : COACH_INSTRUCTIONS;
    return {
      ...rest,
      instructions: `${base}\n\n---\n\n# Current session context\n\n${options.sessionContext}`,
    };
  },
});
