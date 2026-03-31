import {
  Cloud,
  Fingerprint,
  KeyRound,
  LogOut,
  RefreshCw,
  User,
} from "lucide-react";
import React, { useState } from "react";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";
import { useSyncService } from "../../hooks/useSyncService";
import { useUsernameAuth } from "../../hooks/useUsernameAuth";
import { UsernameAuthModal } from "./UsernameAuthModal";

interface LoginButtonProps {
  compact?: boolean;
}

export function LoginButton({ compact = false }: LoginButtonProps) {
  const { identity, login, clear, isLoggingIn, isInitializing } =
    useInternetIdentity();
  const { syncToBackend, isSyncing, lastSynced } = useSyncService();
  const {
    isLoggedIn: isUpLoggedIn,
    username: upUsername,
    logout: upLogout,
  } = useUsernameAuth();
  const [showUpModal, setShowUpModal] = useState(false);

  const isIILoggedIn = !!identity && !identity.getPrincipal().isAnonymous();
  const principal = isIILoggedIn ? identity.getPrincipal().toString() : null;
  const shortPrincipal = principal ? `${principal.slice(0, 8)}...` : null;

  const formatLastSynced = () => {
    if (!lastSynced) return "Not synced yet";
    const diff = Date.now() - lastSynced.getTime();
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    return `${Math.floor(diff / 3600000)}h ago`;
  };

  if (isInitializing) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-muted-foreground text-xs">
        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
        {!compact && <span>Loading...</span>}
      </div>
    );
  }

  // Internet Identity logged in
  if (isIILoggedIn) {
    return (
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/60 text-xs">
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            {isSyncing ? (
              <RefreshCw className="w-3.5 h-3.5 text-primary animate-spin shrink-0" />
            ) : (
              <Cloud className="w-3.5 h-3.5 text-primary shrink-0" />
            )}
            {!compact && (
              <div className="min-w-0">
                <div className="text-foreground font-medium truncate">
                  {shortPrincipal}
                </div>
                <div className="text-muted-foreground text-[10px]">
                  {formatLastSynced()}
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={syncToBackend}
              disabled={isSyncing}
              data-ocid="auth.secondary_button"
              title="Sync now"
              className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-primary"
            >
              <RefreshCw
                className={`w-3 h-3 ${isSyncing ? "animate-spin" : ""}`}
              />
            </button>
            <button
              type="button"
              onClick={clear}
              data-ocid="auth.delete_button"
              title="Sign out"
              className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-destructive"
            >
              <LogOut className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Username/password logged in
  if (isUpLoggedIn) {
    return (
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/60 text-xs">
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            {isSyncing ? (
              <RefreshCw className="w-3.5 h-3.5 text-primary animate-spin shrink-0" />
            ) : (
              <User className="w-3.5 h-3.5 text-primary shrink-0" />
            )}
            {!compact && (
              <div className="min-w-0">
                <div className="text-foreground font-medium truncate">
                  {upUsername}
                </div>
                <div className="text-muted-foreground text-[10px]">
                  {formatLastSynced()}
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={syncToBackend}
              disabled={isSyncing}
              data-ocid="auth.secondary_button"
              title="Sync now"
              className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-primary"
            >
              <RefreshCw
                className={`w-3 h-3 ${isSyncing ? "animate-spin" : ""}`}
              />
            </button>
            <button
              type="button"
              onClick={upLogout}
              data-ocid="auth.delete_button"
              title="Sign out"
              className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-destructive"
            >
              <LogOut className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Not logged in — show both options
  return (
    <>
      <div className="flex flex-col gap-1.5">
        <button
          type="button"
          onClick={login}
          disabled={isLoggingIn}
          data-ocid="auth.primary_button"
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-xs font-medium transition-colors"
        >
          {isLoggingIn ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin shrink-0" />
          ) : (
            <Fingerprint className="w-3.5 h-3.5 shrink-0" />
          )}
          {!compact && (
            <span>{isLoggingIn ? "Signing in..." : "Sign in to sync"}</span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setShowUpModal(true)}
          data-ocid="auth.secondary_button"
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg bg-muted/60 hover:bg-muted text-muted-foreground text-xs font-medium transition-colors"
        >
          <KeyRound className="w-3.5 h-3.5 shrink-0" />
          {!compact && <span>Sign in with Password</span>}
        </button>
      </div>
      <UsernameAuthModal
        isOpen={showUpModal}
        onClose={() => setShowUpModal(false)}
      />
    </>
  );
}
