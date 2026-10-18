import { Agent } from "@openai/agents";
import { COACH_INSTRUCTIONS } from "./coach-instructions";
import { searchExercisesTool } from "./tools";

export const coachAgent = new Agent({
  name: "FitFlow Coach",
  instructions: COACH_INSTRUCTIONS,
  tools: [searchExercisesTool],
});
