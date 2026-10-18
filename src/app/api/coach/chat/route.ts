import { run } from "@openai/agents";
import { coachAgent } from "@/features/coach/agent/coach-agent";
import { toAgentInput } from "@/features/coach/agent/to-agent-input";
import { getSessionFromCookies } from "@/lib/auth/session";
import { apiError } from "@/lib/utils/http";

type IncomingBody = {
  messages?: unknown;
};

export async function POST(request: Request) {
  const session = await getSessionFromCookies();
  if (!session) {
    return apiError("You're not signed in.", 401, "UNAUTHORIZED");
  }

  let body: IncomingBody;
  try {
    body = (await request.json()) as IncomingBody;
  } catch {
    return apiError("Invalid JSON body.", 400, "INVALID_JSON");
  }

  if (!Array.isArray(body.messages)) {
    return apiError("Expected a messages array.", 400, "VALIDATION_ERROR");
  }

  const input = toAgentInput(body.messages);
  if (input.length === 0) {
    return apiError(
      "No message content to respond to.",
      400,
      "VALIDATION_ERROR",
    );
  }

  try {
    const result = await run(coachAgent, input, { stream: true });
    const encoder = new TextEncoder();
    const textStream = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const chunk of result.toTextStream()) {
            controller.enqueue(encoder.encode(chunk));
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(textStream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "The coach couldn't respond.";
    return apiError(message, 502, "AGENT_FAILED");
  }
}
