"use client";

import { EntryGate } from "@/components/auth/entry-gate";
import { useMessenger } from "@/features/messaging/use-messenger";

export default function EntryPage() {
  const messenger = useMessenger();
  return <EntryGate messenger={messenger} />;
}

