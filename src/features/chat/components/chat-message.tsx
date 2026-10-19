"use client";

import { motion } from "motion/react";
import type { ChatBlock, ChatMessage } from "@/features/chat/types";
import type { useChatConversation } from "@/features/chat/use-chat-conversation";
import { cn } from "@/lib/utils/cn";
import {
  ChoiceChipsBlock,
  MultiSelectChipsBlock,
} from "./blocks/choice-blocks";
import { EquipmentBlock } from "./blocks/equipment-block";
import { ExperienceBlock } from "./blocks/experience-block";
import { MuscleFocusBlock } from "./blocks/muscle-focus-block";
import {
  ExerciseOptionsBlock,
  ExerciseSwapBlock,
  PlanCreatedCard,
  SessionMutationBlock,
} from "./blocks/plan-blocks";
import {
  GentleRoutineBlock,
  SafetyNoticeBlock,
  UrgentCareBlock,
} from "./blocks/safety-blocks";
import { ChatMarkdown } from "./chat-markdown";
import { CoachMark } from "./coach-mark";

type Conversation = ReturnType<typeof useChatConversation>;

/** Blocks that need the full column rather than a bubble's width. */
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

  if (!isUser && !message.text && !message.block) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.26, ease: [0.2, 0.7, 0.2, 1] }}
      className={cn("flex gap-3", isUser && "flex-row-reverse")}
    >
      {isUser ? null : (
        /* Wide blocks reclaim the avatar gutter on phones — 44px matters
           at 390px, and the mark is still there once there's room. */
        <CoachMark className={cn("mt-0.5", wide && "hidden sm:flex")} />
      )}

      <div
        className={cn(
          "flex min-w-0 flex-col gap-2.5",
          isUser ? "max-w-[85%] items-end" : wide ? "w-full" : "max-w-[88%]",
        )}
      >
        {message.text ? (
          <div
            className={cn(
              "text-[15px] leading-relaxed",
              isUser
                ? "rounded-[20px] rounded-tr-md bg-ink px-4 py-2.5 text-white"
                : "text-ink-soft",
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
          onPersistSubmit={(id) =>
            conversation.persistBlockSelection(block.id, id)
          }
        />
      );
    case "experience":
      return (
        <ExperienceBlock
          blockId={block.id}
          resolved={resolved}
          initialSelectedId={block.selected}
          onSubmit={(optionId, label) =>
            conversation.selectChoice(optionId, label)
          }
          onPersistSubmit={(id) =>
            conversation.persistBlockSelection(block.id, id)
          }
        />
      );
    case "muscle_focus":
      return (
        <MuscleFocusBlock
          blockId={block.id}
          resolved={resolved}
          initialSelected={block.selected}
          onSubmit={(label) => conversation.selectChoice(block.id, label)}
          onPersistSubmit={(selection) =>
            conversation.persistBlockSelection(block.id, selection)
          }
        />
      );
    case "equipment_access":
      return (
        <EquipmentBlock
          blockId={block.id}
          resolved={resolved}
          initialSelected={block.selected}
          onSubmit={(label) => conversation.selectChoice(block.id, label)}
          onPersistSubmit={(selection) =>
            conversation.persistBlockSelection(block.id, selection)
          }
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
          onPersistSubmit={(selection) =>
            conversation.persistBlockSelection(block.id, selection)
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
    case "plan_updated":
    case "session_adjusted":
      return null;
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
    case "exercise_options":
      return (
        <ExerciseOptionsBlock
          block={block}
          resolved={resolved}
          onSelect={(_exerciseId, name) => {
            conversation.sendText(`Let's use ${name}`);
          }}
          onPersistSubmit={(exerciseId) =>
            conversation.persistBlockSelection(block.id, exerciseId)
          }
        />
      );
    case "exercise_swap":
      return <ExerciseSwapBlock block={block} />;
    case "gentle_routine":
      return <GentleRoutineBlock block={block} />;
    case "urgent_care":
      return <UrgentCareBlock />;
    default:
      return null;
  }
}

/** What the coach is doing right now, in its own words. */
export function CoachActivityIndicator({ label }: { label: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex items-center gap-3"
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <CoachMark working />
      <motion.p
        key={label}
        initial={{ opacity: 0, y: 3 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="text-[14px] text-ink-muted"
      >
        {label}
      </motion.p>
    </motion.div>
  );
}
