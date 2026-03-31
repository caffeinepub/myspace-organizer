import { Copy, Eye, EyeOff, KeyRound, User } from "lucide-react";
import React, { useState } from "react";
import { useUsernameAuth } from "../../hooks/useUsernameAuth";
import { Modal } from "../common/Modal";

type View = "login" | "register" | "forgot";

interface UsernameAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UsernameAuthModal({ isOpen, onClose }: UsernameAuthModalProps) {
  const { login, register, resetPassword, isLoading } = useUsernameAuth();
  const [view, setView] = useState<View>("login");

  // Login state
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPwd, setShowLoginPwd] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Register state
  const [regUsername, setRegUsername] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  const [showRegPwd, setShowRegPwd] = useState(false);
  const [regError, setRegError] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");
  const [recoveryCopied, setRecoveryCopied] = useState(false);
  const [regSuccess, setRegSuccess] = useState(false);

  // Forgot state
  const [forgotUsername, setForgotUsername] = useState("");
  const [forgotRecovery, setForgotRecovery] = useState("");
  const [forgotNewPwd, setForgotNewPwd] = useState("");
  const [forgotConfirmPwd, setForgotConfirmPwd] = useState("");
  const [showForgotPwd, setShowForgotPwd] = useState(false);
  const [forgotError, setForgotError] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const handleClose = () => {
    setView("login");
    setLoginUsername("");
    setLoginPassword("");
    setLoginError("");
    setRegUsername("");
    setRegPassword("");
    setRegConfirm("");
    setRegError("");
    setRecoveryCode("");
    setRegSuccess(false);
    setRecoveryCopied(false);
    setForgotUsername("");
    setForgotRecovery("");
    setForgotNewPwd("");
    setForgotConfirmPwd("");
    setForgotError("");
    setForgotSuccess(false);
    onClose();
  };

  const handleLogin = async () => {
    setLoginError("");
    if (!loginUsername.trim() || !loginPassword) {
      setLoginError("Please fill in all fields.");
      return;
    }
    const result = await login(loginUsername.trim(), loginPassword);
    if (result.ok) {
      handleClose();
    } else {
      setLoginError(result.error ?? "Login failed");
    }
  };

  const handleRegister = async () => {
    setRegError("");
    if (!regUsername.trim() || !regPassword || !regConfirm) {
      setRegError("Please fill in all fields.");
      return;
    }
    if (regPassword !== regConfirm) {
      setRegError("Passwords do not match.");
      return;
    }
    if (regPassword.length < 6) {
      setRegError("Password must be at least 6 characters.");
      return;
    }
    const result = await register(regUsername.trim(), regPassword);
    if (result.ok && result.recoveryCode) {
      setRecoveryCode(result.recoveryCode);
      setRegSuccess(true);
    } else {
      setRegError(result.error ?? "Registration failed");
    }
  };

  const handleCopyRecovery = () => {
    navigator.clipboard.writeText(recoveryCode).catch(() => {});
    setRecoveryCopied(true);
    setTimeout(() => setRecoveryCopied(false), 2000);
  };

  const handleForgot = async () => {
    setForgotError("");
    if (
      !forgotUsername.trim() ||
      !forgotRecovery.trim() ||
      !forgotNewPwd ||
      !forgotConfirmPwd
    ) {
      setForgotError("Please fill in all fields.");
      return;
    }
    if (forgotNewPwd !== forgotConfirmPwd) {
      setForgotError("Passwords do not match.");
      return;
    }
    const result = await resetPassword(
      forgotUsername.trim(),
      forgotRecovery.trim(),
      forgotNewPwd,
    );
    if (result.ok) {
      setForgotSuccess(true);
    } else {
      setForgotError(result.error ?? "Reset failed");
    }
  };

  const titles: Record<View, string> = {
    login: "Sign in with Password",
    register: "Create Account",
    forgot: "Reset Password",
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={titles[view]} size="sm">
      {view === "login" && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Username"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                data-ocid="auth.input"
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type={showLoginPwd ? "text" : "password"}
                placeholder="Password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                data-ocid="auth.input"
                className="w-full pl-9 pr-9 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button
                type="button"
                onClick={() => setShowLoginPwd((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showLoginPwd ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
          {loginError && (
            <p
              data-ocid="auth.error_state"
              className="text-xs text-destructive"
            >
              {loginError}
            </p>
          )}
          <button
            type="button"
            onClick={handleLogin}
            disabled={isLoading}
            data-ocid="auth.submit_button"
            className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
          <div className="flex justify-between text-xs text-muted-foreground">
            <button
              type="button"
              onClick={() => {
                setView("register");
                setLoginError("");
              }}
              className="hover:text-primary transition-colors"
            >
              Don't have an account? Register
            </button>
            <button
              type="button"
              onClick={() => {
                setView("forgot");
                setLoginError("");
              }}
              className="hover:text-primary transition-colors"
            >
              Forgot password?
            </button>
          </div>
        </div>
      )}

      {view === "register" && !regSuccess && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Username"
                value={regUsername}
                onChange={(e) => setRegUsername(e.target.value)}
                data-ocid="auth.input"
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type={showRegPwd ? "text" : "password"}
                placeholder="Password (min 6 chars)"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                data-ocid="auth.input"
                className="w-full pl-9 pr-9 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button
                type="button"
                onClick={() => setShowRegPwd((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showRegPwd ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="password"
                placeholder="Confirm password"
                value={regConfirm}
                onChange={(e) => setRegConfirm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleRegister()}
                data-ocid="auth.input"
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>
          {regError && (
            <p
              data-ocid="auth.error_state"
              className="text-xs text-destructive"
            >
              {regError}
            </p>
          )}
          <button
            type="button"
            onClick={handleRegister}
            disabled={isLoading}
            data-ocid="auth.submit_button"
            className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isLoading ? "Creating account..." : "Create account"}
          </button>
          <div className="text-center text-xs text-muted-foreground">
            <button
              type="button"
              onClick={() => {
                setView("login");
                setRegError("");
              }}
              className="hover:text-primary transition-colors"
            >
              Already have an account? Sign in
            </button>
          </div>
        </div>
      )}

      {view === "register" && regSuccess && (
        <div className="flex flex-col gap-4">
          <div className="rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-4">
            <p className="text-xs font-semibold text-amber-800 dark:text-amber-300 mb-2">
              ⚠ Save your recovery code
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-400 mb-3 leading-relaxed">
              This code is shown only once. If you forget your password, you'll
              need it to regain access.
            </p>
            <div className="flex items-center gap-2 bg-white dark:bg-black/20 rounded-lg border border-amber-200 dark:border-amber-700 px-3 py-2">
              <code className="flex-1 text-xs font-mono break-all select-all text-amber-900 dark:text-amber-200">
                {recoveryCode}
              </code>
              <button
                type="button"
                onClick={handleCopyRecovery}
                data-ocid="auth.secondary_button"
                className="shrink-0 p-1.5 rounded hover:bg-amber-100 dark:hover:bg-amber-800/40 text-amber-600 dark:text-amber-400 transition-colors"
                title="Copy recovery code"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
            {recoveryCopied && (
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                Copied!
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={handleClose}
            data-ocid="auth.confirm_button"
            className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            I've saved my recovery code — Continue
          </button>
        </div>
      )}

      {view === "forgot" && !forgotSuccess && (
        <div className="flex flex-col gap-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Enter your username, recovery code, and a new password to reset
            access.
          </p>
          <div className="flex flex-col gap-3">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Username"
                value={forgotUsername}
                onChange={(e) => setForgotUsername(e.target.value)}
                data-ocid="auth.input"
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <input
              type="text"
              placeholder="Recovery code"
              value={forgotRecovery}
              onChange={(e) => setForgotRecovery(e.target.value)}
              data-ocid="auth.input"
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <div className="relative">
              <input
                type={showForgotPwd ? "text" : "password"}
                placeholder="New password"
                value={forgotNewPwd}
                onChange={(e) => setForgotNewPwd(e.target.value)}
                data-ocid="auth.input"
                className="w-full pl-3 pr-9 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button
                type="button"
                onClick={() => setShowForgotPwd((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showForgotPwd ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            <input
              type="password"
              placeholder="Confirm new password"
              value={forgotConfirmPwd}
              onChange={(e) => setForgotConfirmPwd(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleForgot()}
              data-ocid="auth.input"
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          {forgotError && (
            <p
              data-ocid="auth.error_state"
              className="text-xs text-destructive"
            >
              {forgotError}
            </p>
          )}
          <button
            type="button"
            onClick={handleForgot}
            disabled={isLoading}
            data-ocid="auth.submit_button"
            className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isLoading ? "Resetting..." : "Reset password"}
          </button>
          <button
            type="button"
            onClick={() => {
              setView("login");
              setForgotError("");
            }}
            className="text-xs text-muted-foreground hover:text-primary text-center transition-colors"
          >
            Back to sign in
          </button>
        </div>
      )}

      {view === "forgot" && forgotSuccess && (
        <div className="flex flex-col gap-4 items-center text-center">
          <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <KeyRound className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground mb-1">
              Password reset successfully!
            </p>
            <p className="text-xs text-muted-foreground">
              You can now sign in with your new password.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setView("login");
              setForgotSuccess(false);
              setForgotUsername("");
              setForgotRecovery("");
              setForgotNewPwd("");
              setForgotConfirmPwd("");
            }}
            data-ocid="auth.primary_button"
            className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Sign in
          </button>
        </div>
      )}
    </Modal>
  );
}
