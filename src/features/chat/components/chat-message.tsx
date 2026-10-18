"use client";

import { cn } from "cn";
import { Dumbbell, Flame, Sparkles, Sprout } from "lucide-react";
import { motion } from "motion/react";
import { EXPERIENCE_OPTIONS } from "@/features/chat/setup-options";
import type { ChatBlock, ChatMessage } from "@/features/chat/types";
import type { useChatConversation } from "@/features/chat/use-chat-conversation";
import {
  ChoiceChipsBlock,
  MultiSelectChipsBlock,
} from "./blocks/choice-blocks";
import { DescribedChoices } from "./blocks/described-choices";
import { EquipmentBlock } from "./blocks/equipment-block";
import { MuscleFocusBlock } from "./blocks/muscle-focus-block";
import { PlanCreatedCard, SessionMutationBlock } from "./blocks/plan-blocks";
import {
  GentleRoutineBlock,
  SafetyNoticeBlock,
  UrgentCareBlock,
} from "./blocks/safety-blocks";
import { ChatMarkdown } from "./chat-markdown";

type Conversation = ReturnType<typeof useChatConversation>;

function isWideBlock(block: ChatBlock) {
  switch (block.type) {
    case "experience":
    case "muscle_focus":
    case "equipment_access":
      return true;
    case "choice_chips":
      return block.options.some((option) => option.description);
    default:
      return false;
  }
}

export function ChatMessageRow({
  message,
  conversation,
  interactive,
}: {
  message: ChatMessage;
  conversation: Conversation;
  interactive: boolean;
}) {
  const isUser = message.role === "user";
  const wide = !isUser && message.block && isWideBlock(message.block);

  return (
    <motion.div
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
        className={cn(
          "flex min-w-0 flex-col gap-2",
          isUser
            ? "max-w-[85%] items-end"
            : wide
              ? "w-full flex-1"
              : "max-w-[85%]",
        )}
      >
        {message.text ? (
          <div
            className={cn(
              "text-sm leading-relaxed",
              isUser
                ? "rounded-2xl rounded-tr-sm bg-primary px-3.5 py-2.5 text-primary-foreground"
                : cn("text-foreground", wide && "self-start"),
            )}
          >
            {isUser ? message.text : <ChatMarkdown content={message.text} />}
          </div>
        ) : null}
        {message.block ? (
          <BlockRenderer
            block={message.block}
            resolved={!interactive}
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
            conversation.selectChoice(optionId, label)
          }
        />
      );
    case "experience":
      return (
        <DescribedChoices
          options={EXPERIENCE_OPTIONS}
          icons={{ new: Sprout, returning: Dumbbell, regular: Flame }}
          resolved={resolved}
          onSelect={(optionId, label) =>
            conversation.selectChoice(optionId, label)
          }
        />
      );
    case "muscle_focus":
      return (
        <MuscleFocusBlock
          blockId={block.id}
          resolved={resolved}
          onSubmit={(label) => conversation.selectChoice(block.id, label)}
        />
      );
    case "equipment_access":
      return (
        <EquipmentBlock
          blockId={block.id}
          resolved={resolved}
          onSubmit={(label) => conversation.selectChoice(block.id, label)}
        />
      );
    case "multi_select_chips":
      return (
        <MultiSelectChipsBlock
          block={block}
          resolved={resolved}
          onSubmit={(ids, labels) =>
            conversation.selectMultiChoice(ids, labels)
          }
        />
      );
    case "plan_created":
      return (
        <PlanCreatedCard
          block={block}
          onViewPlan={() => conversation.viewPlan()}
        />
      );
    case "session_mutation":
      return (
        <SessionMutationBlock
          block={block}
          resolved={resolved}
          onStart={() =>
            conversation.startAdjustedWorkout(
              block.toMinutes,
              block.fromEquipment,
              block.toEquipment,
            )
          }
          onKeep={() => conversation.keepOriginalWorkout()}
        />
      );
    case "safety_notice":
      return (
        <SafetyNoticeBlock
          block={block}
          resolved={resolved}
          onAcknowledge={() => conversation.acknowledgeSafety()}
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
