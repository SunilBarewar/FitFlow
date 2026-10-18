import { redirect } from "next/navigation";
import { getConversationData } from "@/features/chat/lib/get-conversation-data";
import { getSessionFromCookies } from "@/lib/auth/session";
import { ChatPageClient } from "./chat-page-client";

function getTodayRef() {
  const now = new Date();
  return {
    date: now.toISOString().slice(0, 10),
    dayLabel: now.toLocaleDateString("en-US", { weekday: "long" }),
  };
}

export default async function ChatPage() {
  const session = await getSessionFromCookies();
  if (!session) {
    redirect("/sign-in?callbackUrl=/chat");
  }

  const { date, dayLabel } = getTodayRef();
  const initialData = await getConversationData(session.sub, date, dayLabel);

  return (
    <ChatPageClient
      userName={session.name?.split(" ")[0] ?? ""}
      initialData={initialData}
    />
  );
}
