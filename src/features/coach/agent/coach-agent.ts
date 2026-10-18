import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { ToolLoopAgent } from "ai";
import { COACH_INSTRUCTIONS } from "./coach-instructions";
import { coachTools } from "./tools";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export const coachAgent = new ToolLoopAgent({
  id: "fitflow-coach",
  model: google("gemini-3.5-flash"),
  instructions: COACH_INSTRUCTIONS,
  tools: coachTools,
});
