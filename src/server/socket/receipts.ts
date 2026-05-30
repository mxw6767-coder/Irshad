export function createReceiptState() {
  return {
    sentAt: new Date().toISOString(),
    deliveredAt: undefined as string | undefined,
    readAt: undefined as string | undefined,
  };
}

