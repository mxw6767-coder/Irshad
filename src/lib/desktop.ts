"use client";

import { sendNotification } from "@tauri-apps/plugin-notification";

export function isDesktop() {
  return typeof window !== "undefined" && Boolean((window as typeof window & { __TAURI__?: unknown }).__TAURI__);
}

export function notifyIncomingMessage(sender: string, preview: string) {
  if (!isDesktop()) return;
  try {
    sendNotification({
      title: `New message from ${sender}`,
      body: preview,
    });
  } catch {
    // no-op on web or unsupported desktop shells
  }
}

