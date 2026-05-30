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
    <main className="grid min-h-screen place-items-center bg-[#07080c] px-4 text-white">
      <div className="w-full max-w-md rounded-[32px] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/40 backdrop-blur-xl">
        <p className="text-xs uppercase tracking-[0.35em] text-white/35">Irshad private access</p>
        <h1 className="mt-3 text-3xl font-semibold">Enter access code</h1>
        <p className="mt-2 text-sm leading-6 text-white/50">
          This workspace is locked to the two approved people. The access code unlocks the site, then each profile uses its own password.
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
            <Button className="h-12 w-full rounded-2xl" onClick={gate.submitEntryPassword}>
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
              {(["Cat", "Fox"] as const).map((profile) => (
                <button
                  key={profile}
                  className={`rounded-2xl border px-3 py-3 text-left ${
                    messenger.activeUser === profile ? "border-accent/60 bg-accent/10" : "border-white/10 bg-white/5"
                  }`}
                  onClick={() => messenger.setActiveUser(profile)}
                >
                  <div className="text-sm font-medium">{profile}</div>
                  <div className="text-xs text-white/45">{profile === "Cat" ? "Quiet operator" : "Fast operator"}</div>
                </button>
              ))}
            </div>

            <Input
              value={gate.profilePassword}
              onChange={(event) => gate.setProfilePassword(event.target.value)}
              type="password"
              placeholder={`${messenger.activeUser} password`}
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

            <Button className="h-12 w-full rounded-2xl" onClick={gate.saveProfile}>
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

