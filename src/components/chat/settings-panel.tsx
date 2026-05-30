"use client";

import type { ReactNode } from "react";
import type { useMessenger } from "@/features/messaging/use-messenger";
import { cn } from "@/lib/utils";

type MessengerState = ReturnType<typeof useMessenger>;

type Props = {
  messenger: MessengerState;
};

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-[26px] border border-white/10 bg-white/[0.03] p-4">
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}

export function SettingsPanel({ messenger }: Props) {
  return (
    <aside className="absolute inset-y-0 right-0 z-30 w-full max-w-xl border-l border-white/10 bg-[#0b0e14]/95 p-4 shadow-2xl shadow-black/50 backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-white/35">Settings</p>
          <h2 className="mt-1 text-2xl font-semibold">Product controls</h2>
        </div>
        <button
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80"
          onClick={() => messenger.setShowSettings(false)}
        >
          Close
        </button>
      </div>

      <div className="mt-4 grid gap-4 overflow-y-auto pb-4">
        <Section title="Appearance">
          <button className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-left text-sm" onClick={() => messenger.setToast("Theme updated")}>Dark premium</button>
          <button className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-left text-sm" onClick={() => messenger.setReducedMotion((current) => !current)}>
            Reduced motion: {messenger.reducedMotion ? "On" : "Off"}
          </button>
        </Section>

        <Section title="Notifications">
          <label className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm">
            <span>Unread badges</span>
            <input type="checkbox" defaultChecked className="accent-cyanAccent" />
          </label>
          <label className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm">
            <span>Message toasts</span>
            <input type="checkbox" defaultChecked className="accent-cyanAccent" />
          </label>
        </Section>

        <Section title="Privacy">
          <button className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-left text-sm" onClick={() => messenger.setToast("Privacy options ready")}>Message previews hidden</button>
          <button className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-left text-sm" onClick={() => messenger.setToast("Export data queued")}>Export data</button>
        </Section>

        <Section title="Devices">
          {messenger.activeConversation ? (
            <div className="space-y-2 text-sm text-white/65">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2">Vinayak Desktop · trusted</div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2">Friend Laptop · trusted</div>
            </div>
          ) : null}
        </Section>

        <Section title="Security">
          <button className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-left text-sm" onClick={() => messenger.setToast("Sessions inspected")}>Session management</button>
          <button className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-left text-sm" onClick={() => messenger.setToast("Device revocation ready")}>Device management</button>
        </Section>

        <Section title="Toast / Status">
          <div className={cn("rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-sm", messenger.toast ? "text-white" : "text-white/45")}>
            {messenger.toast ?? "No recent events"}
          </div>
          <button className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-left text-sm" onClick={() => messenger.setToast(null)}>Clear toast</button>
        </Section>
      </div>
    </aside>
  );
}
