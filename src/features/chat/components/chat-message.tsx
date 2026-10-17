"use client";

import { cn } from "cn";
import { Sparkles } from "lucide-react";
import { motion } from "motion/react";
import type { ChatMessage } from "@/features/chat/types";
import type { useChatConversation } from "@/features/chat/use-chat-conversation";
import {
  ChoiceChipsBlock,
  MultiSelectChipsBlock,
} from "./blocks/choice-blocks";
import { PlanPreviewBlock, SessionMutationBlock } from "./blocks/plan-blocks";
import {
  GentleRoutineBlock,
  SafetyNoticeBlock,
  UrgentCareBlock,
} from "./blocks/safety-blocks";

type Conversation = ReturnType<typeof useChatConversation>;

export function ChatMessageRow({
  message,
  conversation,
}: {
  message: ChatMessage;
  conversation: Conversation;
}) {
  const isUser = message.role === "user";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className={cn("flex gap-2.5", isUser && "flex-row-reverse")}
    >
      {!isUser ? (
        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Sparkles size={13} aria-hidden />
        </span>
      ) : null}
      <div
        className={cn("flex max-w-[85%] flex-col gap-2", isUser && "items-end")}
      >
        {message.text ? (
          <div
            className={cn(
              "rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
              isUser
                ? "rounded-tr-sm bg-primary text-primary-foreground"
                : "rounded-tl-sm bg-muted text-foreground",
            )}
          >
            {message.text}
          </div>
        ) : null}
        {message.block ? (
          <BlockRenderer
            block={message.block}
            resolved={Boolean(message.resolved)}
            conversation={conversation}
          />
        ) : null}
      </div>
    </motion.div>
  );
}

function BlockRenderer({
  block,
  resolved,
  conversation,
}: {
  block: NonNullable<ChatMessage["block"]>;
  resolved: boolean;
  conversation: Conversation;
}) {
  switch (block.type) {
    case "choice_chips":
      return (
        <ChoiceChipsBlock
          block={block}
          resolved={resolved}
          onSelect={(optionId, label) =>
            conversation.answerChoice(block.id, optionId, label)
          }
        />
      );
    case "multi_select_chips":
      return (
        <MultiSelectChipsBlock
          block={block}
          resolved={resolved}
          onSubmit={(ids, labels) =>
            conversation.answerMultiSelect(block.id, ids, labels)
          }
        />
      );
    case "plan_preview":
      return (
        <PlanPreviewBlock
          block={block}
          resolved={resolved}
          onAccept={() => conversation.acceptPlan(block.id, block.plan)}
          onDecline={() => conversation.declinePlan(block.id)}
        />
      );
    case "session_mutation":
      return (
        <SessionMutationBlock
          block={block}
          resolved={resolved}
          onStart={() =>
            conversation.startAdjustedWorkout(block.id, block.toMinutes)
          }
          onKeep={() => conversation.keepOriginalWorkout(block.id)}
        />
      );
    case "safety_notice":
      return (
        <SafetyNoticeBlock
          block={block}
          resolved={resolved}
          onAcknowledge={() => conversation.acknowledgeSafety(block.id)}
        />
      );
    case "gentle_routine":
      return <GentleRoutineBlock block={block} />;
    case "urgent_care":
      return <UrgentCareBlock />;
    default:
      return null;
  }
}

export function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex items-center gap-2.5"
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <Sparkles size={13} aria-hidden />
      </span>
      <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-muted px-3.5 py-3">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>
    </motion.div>
  );
}
