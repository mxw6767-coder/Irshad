"use client";

import { invoke } from "@tauri-apps/api/core";
import { sendNotification } from "@tauri-apps/plugin-notification";

export function isDesktop() {
  return typeof window !== "undefined" && Boolean((window as typeof window & { __TAURI__?: unknown }).__TAURI__);
}

export type DesktopPreferences = {
  minimizeToTrayOnClose: boolean;
};

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

export async function getDesktopPreferences(): Promise<DesktopPreferences> {
  if (!isDesktop()) {
    return { minimizeToTrayOnClose: true };
  }
  return invoke<DesktopPreferences>("get_desktop_preferences");
}

export async function setMinimizeToTrayOnClose(enabled: boolean): Promise<DesktopPreferences> {
  if (!isDesktop()) {
    return { minimizeToTrayOnClose: enabled };
  }
  return invoke<DesktopPreferences>("set_minimize_to_tray_on_close", { enabled });
}
