"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const markdownClassName =
  "chat-markdown [&_p]:mb-2 [&_p:last-child]:mb-0 [&_h3]:mb-1.5 [&_h3]:mt-3 [&_h3:first-child]:mt-0 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:leading-snug [&_ul]:mb-2 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-4 [&_ol]:mb-2 [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-4 [&_li]:leading-relaxed [&_strong]:font-semibold [&_code]:rounded-sm [&_code]:bg-background/60 [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[0.9em] [&_a]:text-primary [&_a]:underline";

export function ChatMarkdown({ content }: { content: string }) {
  return (
    <div className={markdownClassName}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
