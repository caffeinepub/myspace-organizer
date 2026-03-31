import { useCallback, useEffect, useState } from "react";
import { useActor } from "./useActor";

const SESSION_KEY = "up_session";

interface UpSession {
  username: string;
  userId: string;
}

async function hashText(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function generateRecoveryCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let code = "";
  const arr = new Uint8Array(24);
  crypto.getRandomValues(arr);
  for (const byte of arr) {
    code += chars[byte % chars.length];
  }
  return code;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyActor = any;

export function useUsernameAuth() {
  const { actor } = useActor();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Restore session on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) {
        const session: UpSession = JSON.parse(raw);
        setUsername(session.username);
        setUserId(session.userId);
        setIsLoggedIn(true);
      }
    } catch {
      // ignore
    }
  }, []);

  const register = useCallback(
    async (
      usernameInput: string,
      password: string,
    ): Promise<{ ok: boolean; recoveryCode?: string; error?: string }> => {
      if (!actor) return { ok: false, error: "Not connected" };
      setIsLoading(true);
      try {
        const [passwordHash, recoveryCode] = await Promise.all([
          hashText(password),
          Promise.resolve(generateRecoveryCode()),
        ]);
        const recoveryHash = await hashText(recoveryCode);
        const newUserId = `up_${usernameInput}`;
        const a = actor as AnyActor;
        const result = await a.registerUser(
          usernameInput,
          passwordHash,
          recoveryHash,
          newUserId,
        );
        if ("ok" in result) {
          return { ok: true, recoveryCode };
        }
        return { ok: false, error: result.err ?? "Registration failed" };
      } catch (e) {
        return { ok: false, error: String(e) };
      } finally {
        setIsLoading(false);
      }
    },
    [actor],
  );

  const login = useCallback(
    async (
      usernameInput: string,
      password: string,
    ): Promise<{ ok: boolean; error?: string }> => {
      if (!actor) return { ok: false, error: "Not connected" };
      setIsLoading(true);
      try {
        const passwordHash = await hashText(password);
        const a = actor as AnyActor;
        const result = await a.loginUser(usernameInput, passwordHash);
        if ("ok" in result) {
          const session: UpSession = {
            username: usernameInput,
            userId: result.ok,
          };
          localStorage.setItem(SESSION_KEY, JSON.stringify(session));
          setUsername(usernameInput);
          setUserId(result.ok);
          setIsLoggedIn(true);
          return { ok: true };
        }
        return { ok: false, error: result.err ?? "Login failed" };
      } catch (e) {
        return { ok: false, error: String(e) };
      } finally {
        setIsLoading(false);
      }
    },
    [actor],
  );

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setUsername(null);
    setUserId(null);
    setIsLoggedIn(false);
  }, []);

  const resetPassword = useCallback(
    async (
      usernameInput: string,
      recoveryCode: string,
      newPassword: string,
    ): Promise<{ ok: boolean; error?: string }> => {
      if (!actor) return { ok: false, error: "Not connected" };
      setIsLoading(true);
      try {
        const [recoveryHash, newPasswordHash] = await Promise.all([
          hashText(recoveryCode),
          hashText(newPassword),
        ]);
        const a = actor as AnyActor;
        const result = await a.resetPasswordWithRecovery(
          usernameInput,
          recoveryHash,
          newPasswordHash,
        );
        if ("ok" in result) return { ok: true };
        return { ok: false, error: result.err ?? "Reset failed" };
      } catch (e) {
        return { ok: false, error: String(e) };
      } finally {
        setIsLoading(false);
      }
    },
    [actor],
  );

  return {
    isLoggedIn,
    username,
    userId,
    isLoading,
    register,
    login,
    logout,
    resetPassword,
  };
}
