import { useCallback, useEffect, useRef, useState } from "react";
import { LockerMain } from "./LockerMain";
import { LockerSetup } from "./LockerSetup";
import { LockerUnlock } from "./LockerUnlock";
import { getSettings, hasCredentials } from "./lockerStorage";

type State = "setup" | "unlock" | "main";

interface Props {
  onClose: () => void;
}

export function LockerModal({ onClose }: Props) {
  const [state, setState] = useState<State>(() => {
    if (!hasCredentials()) return "setup";
    return "unlock";
  });

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    const { timeoutMinutes } = getSettings();
    timerRef.current = setTimeout(
      () => {
        setState("unlock");
      },
      timeoutMinutes * 60 * 1000,
    );
  }, []);

  useEffect(() => {
    if (state === "main") {
      resetTimer();
    } else {
      if (timerRef.current) clearTimeout(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [state, resetTimer]);

  const handleInteraction = () => {
    if (state === "main") resetTimer();
  };

  const handleBackdropKey = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      data-ocid="locker.modal"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        role="button"
        tabIndex={-1}
        aria-label="Close locker"
        onClick={onClose}
        onKeyDown={handleBackdropKey}
      />
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: child content handles keyboard events */}
      <div
        className="relative z-10 w-full flex items-center justify-center"
        onClick={handleInteraction}
      >
        {state === "setup" && (
          <LockerSetup
            onSetupComplete={() => setState("main")}
            onClose={onClose}
          />
        )}
        {state === "unlock" && (
          <LockerUnlock onUnlocked={() => setState("main")} onClose={onClose} />
        )}
        {state === "main" && (
          <LockerMain onLock={() => setState("unlock")} onClose={onClose} />
        )}
      </div>
    </div>
  );
}
