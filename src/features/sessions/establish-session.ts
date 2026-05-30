export type SessionRecord = {
  id: string;
  conversationId: string;
  senderDeviceId: string;
  recipientDeviceId: string;
  version: number;
  sessionBlob: string;
};

export function createSessionRecord(input: Omit<SessionRecord, "id">): SessionRecord {
  return {
    id: crypto.randomUUID(),
    ...input,
  };
}

