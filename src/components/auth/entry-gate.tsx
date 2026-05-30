"use client";

import type { useMessenger } from "@/features/messaging/use-messenger";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type MessengerState = ReturnType<typeof useMessenger>;

type Props = {
  messenger: MessengerState;
};

export function EntryGate({ messenger }: Props) {
  const gate = messenger.gateCopy;

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#07080c] px-4 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(88,101,242,0.18),transparent_40%),radial-gradient(circle_at_bottom,rgba(0,194,255,0.08),transparent_35%)]" />
      <div className="relative w-full max-w-md rounded-[36px] border border-white/10 bg-white/[0.05] p-6 shadow-2xl shadow-black/50 backdrop-blur-2xl md:p-8">
        <div className="mb-5 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/5 text-lg font-semibold text-cyan-200">
            I
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-white/35">Irshad private access</p>
            <h1 className="text-2xl font-semibold">Secure entry gate</h1>
          </div>
        </div>
        <p className="text-sm leading-6 text-white/55">
          This workspace is locked to the two approved people. Enter the access code first, then unlock your profile with its own password.
        </p>

        {messenger.gateStatus === "locked" ? (
          <div className="mt-6 space-y-4">
            <Input
              value={gate.entryPasswordInput}
              onChange={(event) => gate.setEntryPasswordInput(event.target.value)}
              type={gate.visiblePassword ? "text" : "password"}
              placeholder="Access code"
              aria-label="Access code"
            />
            <label className="flex items-center gap-2 text-sm text-white/55">
              <input
                type="checkbox"
                checked={gate.visiblePassword}
                onChange={(event) => gate.setVisiblePassword(event.target.checked)}
                className="accent-cyanAccent"
              />
              Show code
            </label>
            {gate.gateError ? <p className="text-sm text-red-300">{gate.gateError}</p> : null}
            <Button className="h-12 w-full rounded-2xl shadow-lg shadow-accent/20" onClick={gate.submitEntryPassword}>
              Unlock
            </Button>
          </div>
        ) : null}

        {messenger.gateStatus === "need_profile" ? (
          <div className="mt-6 space-y-4">
            <div className="flex gap-2">
              {(["register", "login"] as const).map((mode) => (
                <button
                  key={mode}
                  className={`flex-1 rounded-2xl border px-3 py-2 text-sm ${
                    gate.profileSetupMode === mode ? "border-accent/60 bg-accent/15" : "border-white/10 bg-white/5"
                  }`}
                  onClick={() => messenger.gateCopy.setProfileSetupMode(mode)}
                >
                  {mode === "register" ? "Register profile" : "Login profile"}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2">
              {messenger.availableProfileOptions.map((profile) => (
                <button
                  key={profile}
                  className={`rounded-2xl border px-3 py-3 text-left ${
                    messenger.activeUser === profile ? "border-accent/60 bg-accent/10" : "border-white/10 bg-white/5"
                  }`}
                  onClick={() => messenger.switchProfile(profile)}
                >
                  <div className="text-sm font-medium">{profile}</div>
                  <div className="text-xs text-white/45">
                    {profile === "Cat" ? "Quiet operator" : profile === "Fox" ? "Fast operator" : "Available"}
                  </div>
                </button>
              ))}
            </div>

            <Input
              value={gate.profilePassword}
              onChange={(event) => gate.setProfilePassword(event.target.value)}
              type="password"
              placeholder={`${messenger.activeUser} password (max 5-char name)`}
              aria-label="Profile password"
            />

            {gate.profileSetupMode === "register" ? (
              <Input
                value={gate.profileConfirmPassword}
                onChange={(event) => gate.setProfileConfirmPassword(event.target.value)}
                type="password"
                placeholder="Confirm profile password"
                aria-label="Confirm profile password"
              />
            ) : null}

            {gate.profileError ? <p className="text-sm text-red-300">{gate.profileError}</p> : null}

            <Button className="h-12 w-full rounded-2xl shadow-lg shadow-accent/20" onClick={gate.saveProfile}>
              Continue as {messenger.activeUser}
            </Button>

            <p className="text-xs text-white/40">
              Your profile password is stored only in this browser for this device. Use the access code again on a new computer, then log in with the profile password.
            </p>
          </div>
        ) : null}
      </div>
    </main>
  );
}
