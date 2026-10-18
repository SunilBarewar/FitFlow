import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { ToolLoopAgent } from "ai";
import { COACH_INSTRUCTIONS } from "./coach-instructions";
import { coachTools } from "./tools";
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { createOpenAI } from '@ai-sdk/openai';


const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


export const coachAgent = new ToolLoopAgent({

  model: openai("gpt-4.1"),
  instructions: COACH_INSTRUCTIONS,
  tools: coachTools,
});
