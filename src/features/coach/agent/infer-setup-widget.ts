import { generateId, type UIMessage } from "ai";
import type { ChatBlock } from "@/features/chat/types";

const SESSION_LENGTH_OPTIONS = [
  { id: "20-30", label: "20–30 min" },
  { id: "30-45", label: "30–45 min" },
  { id: "45-60", label: "45–60 min" },
  { id: "60-90", label: "60–90 min" },
] as const;

function textFromMessage(message: UIMessage): string {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("")
    .trim();
}

function widgetFromMessage(message: UIMessage): ChatBlock | undefined {
  for (const part of message.parts) {
    if (part.type !== "data-widget") continue;
    const data = part.data as ChatBlock | undefined;
    if (data && typeof data === "object" && "type" in data) {
      return data;
    }
  }
  return undefined;
}

function isSessionLengthBlock(block: ChatBlock): boolean {
  return (
    block.type === "choice_chips" &&
    block.options.some((option) => option.id === "20-30")
  );
}

/** True when the user already named a training focus without using the widget. */
function userNamedMuscleFocus(messages: UIMessage[]): boolean {
  const focusPattern =
    /\b(full body|upper body|lower body|push|pull|legs|chest|back|shoulders|arms|core|glutes)\b/i;
  return messages.some(
    (message) => message.role === "user" && focusPattern.test(textFromMessage(message)),
  );
}

function stepCompleted(
  messages: UIMessage[],
  matches: (block: ChatBlock) => boolean,
): boolean {
  for (let index = 0; index < messages.length; index++) {
    const message = messages[index];
    if (message.role !== "assistant") continue;
    const block = widgetFromMessage(message);
    if (!block || !matches(block)) continue;

    for (let after = index + 1; after < messages.length; after++) {
      if (
        messages[after].role === "user" &&
        textFromMessage(messages[after])
      ) {
        return true;
      }
    }
  }
  return false;
}

function blockForSetupStep(
  step: "experience" | "muscle_focus" | "equipment_access" | "session_length",
): ChatBlock {
  switch (step) {
    case "experience":
      return { type: "experience", id: generateId() };
    case "muscle_focus":
      return { type: "muscle_focus", id: generateId() };
    case "equipment_access":
      return { type: "equipment_access", id: generateId() };
    case "session_length":
      return {
        type: "choice_chips",
        id: generateId(),
        options: [...SESSION_LENGTH_OPTIONS],
      };
  }
}

/**
 * When the model asks a setup question in plain text but skips show_widget,
 * attach the widget the onboarding flow expects from message history.
 */
export function inferExpectedSetupWidget(
  messages: UIMessage[],
): ChatBlock | null {
  if (!messages.some((message) => message.role === "user")) {
    return null;
  }

  if (!stepCompleted(messages, (block) => block.type === "experience")) {
    return blockForSetupStep("experience");
  }

  if (
    !stepCompleted(messages, (block) => block.type === "muscle_focus") &&
    !userNamedMuscleFocus(messages)
  ) {
    return blockForSetupStep("muscle_focus");
  }

  if (!stepCompleted(messages, (block) => block.type === "equipment_access")) {
    return blockForSetupStep("equipment_access");
  }

  if (!stepCompleted(messages, isSessionLengthBlock)) {
    return blockForSetupStep("session_length");
  }

  return null;
}
