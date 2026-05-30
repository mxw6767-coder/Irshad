 "use client";

import { ChatShell } from "@/components/chat/chat-shell";
import { EntryGate } from "@/components/auth/entry-gate";
import { useMessenger } from "@/features/messaging/use-messenger";

export default function Page() {
  const messenger = useMessenger();
  return messenger.gateStatus === "ready" ? <ChatShell messenger={messenger} /> : <EntryGate messenger={messenger} />;
}
