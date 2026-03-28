import { Lock, X } from "lucide-react";
import { useState } from "react";
import { saveCredentials } from "./lockerStorage";

interface Props {
  onSetupComplete: () => void;
  onClose: () => void;
}

export function LockerSetup({ onSetupComplete, onClose }: Props) {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<string[]>([]);

  const handleSubmit = () => {
    const errs: string[] = [];
    if (!pin || pin.length < 4 || pin.length > 6) {
      errs.push("PIN must be 4–6 digits.");
    }
    if (!/^\d+$/.test(pin)) {
      errs.push("PIN must contain only numbers.");
    }
    if (pin !== confirmPin) {
      errs.push("PINs do not match.");
    }
    if (password && password !== confirmPassword) {
      errs.push("Passwords do not match.");
    }
    if (errs.length > 0) {
      setErrors(errs);
      return;
    }
    saveCredentials(pin, password);
    onSetupComplete();
  };

  return (
    <div className="bg-card rounded-2xl border border-border/50 p-6 max-w-sm w-full mx-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Lock className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-base">Set Up Locker</h2>
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
        Create a PIN (and optionally a password) to protect your locker.
      </p>

      <div className="space-y-3">
        <div>
          <label htmlFor="setup-pin" className="text-xs font-medium block mb-1">
            PIN (4–6 digits) *
          </label>
          <input
            id="setup-pin"
            type="number"
            value={pin}
            onChange={(e) => setPin(e.target.value.slice(0, 6))}
            placeholder="Enter PIN"
            className="w-full bg-muted/50 rounded-lg p-2.5 text-sm border border-border/50 outline-none focus:border-primary transition-colors"
            inputMode="numeric"
          />
        </div>
        <div>
          <label
            htmlFor="setup-confirm-pin"
            className="text-xs font-medium block mb-1"
          >
            Confirm PIN *
          </label>
          <input
            id="setup-confirm-pin"
            type="number"
            value={confirmPin}
            onChange={(e) => setConfirmPin(e.target.value.slice(0, 6))}
            placeholder="Confirm PIN"
            className="w-full bg-muted/50 rounded-lg p-2.5 text-sm border border-border/50 outline-none focus:border-primary transition-colors"
            inputMode="numeric"
          />
        </div>
        <div className="border-t border-border/50 pt-3">
          <p className="text-xs text-muted-foreground mb-2">
            Optional: Add a password for extra security
          </p>
          <div className="space-y-3">
            <div>
              <label
                htmlFor="setup-password"
                className="text-xs font-medium block mb-1"
              >
                Password (optional)
              </label>
              <input
                id="setup-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full bg-muted/50 rounded-lg p-2.5 text-sm border border-border/50 outline-none focus:border-primary transition-colors"
              />
            </div>
            {password && (
              <div>
                <label
                  htmlFor="setup-confirm-password"
                  className="text-xs font-medium block mb-1"
                >
                  Confirm Password
                </label>
                <input
                  id="setup-confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  className="w-full bg-muted/50 rounded-lg p-2.5 text-sm border border-border/50 outline-none focus:border-primary transition-colors"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {errors.length > 0 && (
        <div className="mt-3 p-3 bg-destructive/10 rounded-lg">
          {errors.map((e) => (
            <p key={e} className="text-xs text-destructive">
              {e}
            </p>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        data-ocid="locker.setup.submit_button"
        className="mt-5 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
      >
        <Lock className="w-4 h-4" /> Set Up Locker
      </button>
    </div>
  );
}
