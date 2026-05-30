export type AttachmentEnvelope = {
  ciphertextKey: string;
  nonce: string;
  blobId: string;
  mimeType: string;
  sizeBytes: number;
};

export function createAttachmentEnvelope(input: Omit<AttachmentEnvelope, "blobId">) {
  return {
    blobId: crypto.randomUUID(),
    ...input,
  };
}

