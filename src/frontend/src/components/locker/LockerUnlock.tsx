import { AlertTriangle, Lock, X } from "lucide-react";
import { useState } from "react";
import {
  LOCKER_CREDS_KEY,
  LOCKER_ENTRIES_KEY,
  verifyCredentials,
} from "./lockerStorage";

interface Props {
  onUnlocked: () => void;
  onClose: () => void;
}

function hasPasswordSet(): boolean {
  const stored = localStorage.getItem(LOCKER_CREDS_KEY);
  if (!stored) return false;
  try {
    const decoded = atob(stored);
    const colonIdx = decoded.indexOf(":");
    const pwd = decoded.slice(colonIdx + 1);
    return pwd.length > 0;
  } catch {
    return false;
  }
}

export function LockerUnlock({ onUnlocked, onClose }: Props) {
  const [pin, setPin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showForgot, setShowForgot] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const showPassword = hasPasswordSet();

  const handleUnlock = () => {
    if (!pin) {
      setError("Please enter your PIN.");
      return;
    }
    if (verifyCredentials(pin, password)) {
      onUnlocked();
    } else {
      setError("Incorrect PIN or password. Please try again.");
    }
  };

  const handleReset = () => {
    localStorage.removeItem(LOCKER_CREDS_KEY);
    localStorage.removeItem(LOCKER_ENTRIES_KEY);
    onClose();
  };

  if (showForgot) {
    return (
      <div className="bg-card rounded-2xl border border-border/50 p-6 max-w-sm w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <h2 className="font-semibold text-base">Reset Locker</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg mb-4">
          <p className="text-sm text-destructive font-medium mb-1">
            ⚠️ Warning: All data will be deleted
          </p>
          <p className="text-xs text-muted-foreground">
            Resetting the locker will permanently delete all saved passwords,
            emails, secure notes, and files. This cannot be undone.
          </p>
        </div>

        <label className="flex items-start gap-2 mb-5 cursor-pointer">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="mt-0.5 accent-destructive"
          />
          <span className="text-xs text-muted-foreground">
            I understand all locker data will be permanently deleted and I want
            to reset.
          </span>
        </label>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowForgot(false)}
            className="flex-1 px-4 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleReset}
            disabled={!confirmed}
            className="flex-1 px-4 py-2.5 rounded-lg bg-destructive text-destructive-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            Reset Locker
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-border/50 p-6 max-w-sm w-full mx-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Lock className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-base">Unlock Locker</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-muted transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <p className="text-xs text-muted-foreground mb-5">
        Enter your credentials to access the locker.
      </p>

      <div className="space-y-3">
        <div>
          <label
            htmlFor="unlock-pin"
            className="text-xs font-medium block mb-1"
          >
            PIN
          </label>
          <input
            id="unlock-pin"
            type="number"
            value={pin}
            onChange={(e) => {
              setPin(e.target.value.slice(0, 6));
              setError("");
            }}
            placeholder="Enter PIN"
            className="w-full bg-muted/50 rounded-lg p-2.5 text-sm border border-border/50 outline-none focus:border-primary transition-colors"
            inputMode="numeric"
            onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
          />
        </div>
        {showPassword && (
          <div>
            <label
              htmlFor="unlock-password"
              className="text-xs font-medium block mb-1"
            >
              Password
            </label>
            <input
              id="unlock-password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              placeholder="Enter password"
              className="w-full bg-muted/50 rounded-lg p-2.5 text-sm border border-border/50 outline-none focus:border-primary transition-colors"
              onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
            />
          </div>
        )}
      </div>

      {error && (
        <p className="mt-3 text-xs text-destructive p-2 bg-destructive/10 rounded-lg">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handleUnlock}
        data-ocid="locker.unlock.submit_button"
        className="mt-5 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
      >
        <Lock className="w-4 h-4" /> Unlock
      </button>

      <button
        type="button"
        onClick={() => setShowForgot(true)}
        className="mt-3 w-full text-xs text-muted-foreground hover:text-destructive transition-colors text-center"
      >
        Forgot PIN / Password? Reset Locker
      </button>
    </div>
  );
}
