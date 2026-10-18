import type { AgentInputItem } from "@openai/agents";

type IncomingUIMessagePart = {
  type: string;
  text?: string;
};

type IncomingUIMessage = {
  role: string;
  parts?: IncomingUIMessagePart[];
};

function textFromParts(parts: IncomingUIMessagePart[] | undefined): string {
  return (parts ?? [])
    .filter((part) => part.type === "text" && typeof part.text === "string")
    .map((part) => part.text)
    .join("");
}

export function toAgentInput(messages: IncomingUIMessage[]): AgentInputItem[] {
  const items: AgentInputItem[] = [];

  for (const message of messages) {
    const text = textFromParts(message.parts);
    if (!text) continue;

    if (message.role === "user") {
      items.push({ type: "message", role: "user", content: text });
    } else if (message.role === "assistant") {
      items.push({
        type: "message",
        role: "assistant",
        status: "completed",
        content: [{ type: "output_text", text }],
      });
    }
  }

  return items;
}
