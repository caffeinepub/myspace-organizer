import {
  BookOpen,
  Calendar,
  Cloud,
  CloudOff,
  Fingerprint,
  Home,
  RefreshCw,
  Settings,
  StickyNote,
} from "lucide-react";
import React from "react";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";
import { useSyncService } from "../../hooks/useSyncService";

const TABS = [
  { id: "home", label: "Home", icon: Home },
  { id: "routines", label: "Routines", icon: Calendar },
  { id: "notes", label: "Notes", icon: StickyNote },
  { id: "records", label: "Records", icon: BookOpen },
  { id: "settings", label: "Settings", icon: Settings },
];

interface BottomTabBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function BottomTabBar({ activeTab, onTabChange }: BottomTabBarProps) {
  const { identity, login } = useInternetIdentity();
  const { isSyncing } = useSyncService();
  const isLoggedIn = !!identity && !identity.getPrincipal().isAnonymous();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-t border-border/50"
      aria-label="Main navigation"
    >
      <div className="flex items-center justify-around px-2 py-2 safe-area-bottom">
        {TABS.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              type="button"
              key={id}
              onClick={() => onTabChange(id)}
              className={`
                flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-150
                ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }
              `}
              aria-label={`${label} tab${isActive ? ", currently active" : ""}`}
              aria-current={isActive ? "page" : undefined}
            >
              <div
                className={`relative transition-transform duration-150 ${isActive ? "scale-110" : ""}`}
              >
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 1.8} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                )}
              </div>
              <span
                className={`text-[10px] font-medium ${isActive ? "text-primary" : ""}`}
              >
                {label}
              </span>
            </button>
          );
        })}

        {/* Sync / login indicator */}
        <button
          type="button"
          onClick={isLoggedIn ? undefined : login}
          data-ocid="auth.toggle"
          title={isLoggedIn ? "Synced to cloud" : "Sign in to sync"}
          className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all duration-150 text-muted-foreground hover:text-foreground"
        >
          <div className="relative">
            {isSyncing ? (
              <RefreshCw className="w-4 h-4 animate-spin text-primary" />
            ) : isLoggedIn ? (
              <Cloud className="w-4 h-4 text-primary" />
            ) : (
              <CloudOff className="w-4 h-4" />
            )}
          </div>
          <span className="text-[10px] font-medium">
            {isLoggedIn ? "Synced" : "Sign in"}
          </span>
        </button>
      </div>
    </nav>
  );
}
