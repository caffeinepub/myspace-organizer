import { useCallback, useRef, useState } from "react";
import { db } from "../db/db";
import { showErrorToast } from "../store/toastStore";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

const MODULES = [
  "notes",
  "routines",
  "records",
  "streak",
  "quotes",
  "labels",
  "settings",
  "locker",
] as const;
type Module = (typeof MODULES)[number];

const LOCKER_KEY = "locker_entries";
const UP_SESSION_KEY = "up_session";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyActor = any;

function getUpSession(): { username: string; userId: string } | null {
  try {
    const raw = localStorage.getItem(UP_SESSION_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return null;
}

export function useSyncService() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const syncingRef = useRef(false);

  const isIILoggedIn = !!identity && !identity.getPrincipal().isAnonymous();

  const syncToBackend = useCallback(async () => {
    if (!actor || syncingRef.current) return;

    const upSession = getUpSession();
    const useByKey = !isIILoggedIn && !!upSession;

    if (!isIILoggedIn && !upSession) return;

    const a = actor as AnyActor;
    if (useByKey && typeof a.storeUserDataByKey !== "function") return;
    if (!useByKey && typeof a.storeUserData !== "function") return;

    syncingRef.current = true;
    setIsSyncing(true);
    setSyncError(null);
    try {
      const [notes, routines, records, streak, quotes, labels, settings] =
        await Promise.all([
          db.notes.toArray(),
          db.routines.toArray(),
          db.records.toArray(),
          db.streak.toArray(),
          db.quotes.toArray(),
          db.labels.toArray(),
          db.settings.toArray(),
        ]);

      const lockerRaw = localStorage.getItem(LOCKER_KEY);

      const moduleData: Record<Module, string> = {
        notes: JSON.stringify(notes),
        routines: JSON.stringify(routines),
        records: JSON.stringify(records),
        streak: JSON.stringify(streak),
        quotes: JSON.stringify(quotes),
        labels: JSON.stringify(labels),
        settings: JSON.stringify(settings),
        locker: lockerRaw ?? "",
      };

      if (useByKey && upSession) {
        await Promise.all(
          MODULES.map((mod) =>
            (
              a.storeUserDataByKey(
                upSession.userId,
                mod,
                moduleData[mod],
              ) as Promise<void>
            ).catch(() => {}),
          ),
        );
      } else {
        await Promise.all(
          MODULES.map((mod) =>
            (a.storeUserData(mod, moduleData[mod]) as Promise<void>).catch(
              () => {},
            ),
          ),
        );
      }

      setLastSynced(new Date());
    } catch {
      const msg = "Sync to cloud failed";
      setSyncError(msg);
      showErrorToast(msg);
    } finally {
      setIsSyncing(false);
      syncingRef.current = false;
    }
  }, [actor, isIILoggedIn]);

  const syncFromBackend = useCallback(async () => {
    if (!actor || syncingRef.current) return;

    const upSession = getUpSession();
    const useByKey = !isIILoggedIn && !!upSession;

    if (!isIILoggedIn && !upSession) return;

    const a = actor as AnyActor;
    if (useByKey && typeof a.getUserDataByKey !== "function") return;
    if (!useByKey && typeof a.getUserData !== "function") return;

    syncingRef.current = true;
    setIsSyncing(true);
    setSyncError(null);
    try {
      let results: (string | null)[];
      if (useByKey && upSession) {
        results = await Promise.all(
          MODULES.map((mod) =>
            (
              a.getUserDataByKey(upSession.userId, mod) as Promise<
                string | null
              >
            ).catch(() => null),
          ),
        );
      } else {
        results = await Promise.all(
          MODULES.map((mod) =>
            (a.getUserData(mod) as Promise<string | null>).catch(() => null),
          ),
        );
      }

      const dataMap: Record<Module, string | null> = {} as Record<
        Module,
        string | null
      >;
      MODULES.forEach((mod, i) => {
        dataMap[mod] = results[i];
      });

      if (dataMap.notes) {
        const items = JSON.parse(dataMap.notes);
        if (Array.isArray(items) && items.length > 0) {
          await db.notes.clear();
          await db.notes.bulkAdd(items.map(({ id: _id, ...rest }) => rest));
        }
      }
      if (dataMap.routines) {
        const items = JSON.parse(dataMap.routines);
        if (Array.isArray(items) && items.length > 0) {
          await db.routines.clear();
          await db.routines.bulkAdd(items.map(({ id: _id, ...rest }) => rest));
        }
      }
      if (dataMap.records) {
        const items = JSON.parse(dataMap.records);
        if (Array.isArray(items) && items.length > 0) {
          await db.records.clear();
          await db.records.bulkAdd(items.map(({ id: _id, ...rest }) => rest));
        }
      }
      if (dataMap.streak) {
        const items = JSON.parse(dataMap.streak);
        if (Array.isArray(items) && items.length > 0) {
          await db.streak.clear();
          await db.streak.bulkAdd(items.map(({ id: _id, ...rest }) => rest));
        }
      }
      if (dataMap.quotes) {
        const items = JSON.parse(dataMap.quotes);
        if (Array.isArray(items) && items.length > 0) {
          await db.quotes.clear();
          await db.quotes.bulkAdd(items.map(({ id: _id, ...rest }) => rest));
        }
      }
      if (dataMap.labels) {
        const items = JSON.parse(dataMap.labels);
        if (Array.isArray(items) && items.length > 0) {
          await db.labels.clear();
          await db.labels.bulkAdd(items.map(({ id: _id, ...rest }) => rest));
        }
      }
      if (dataMap.settings) {
        const items = JSON.parse(dataMap.settings);
        if (Array.isArray(items) && items.length > 0) {
          await db.settings.clear();
          await db.settings.bulkAdd(items.map(({ id: _id, ...rest }) => rest));
        }
      }
      if (dataMap.locker && dataMap.locker.length > 0) {
        localStorage.setItem(LOCKER_KEY, dataMap.locker);
      }

      setLastSynced(new Date());
    } catch {
      const msg = "Sync from cloud failed";
      setSyncError(msg);
      showErrorToast(msg);
    } finally {
      setIsSyncing(false);
      syncingRef.current = false;
    }
  }, [actor, isIILoggedIn]);

  const hasMigrationData = useCallback(async (): Promise<boolean> => {
    try {
      const [notesCount, routinesCount, recordsCount] = await Promise.all([
        db.notes.count(),
        db.routines.count(),
        db.records.count(),
      ]);
      return notesCount > 0 || routinesCount > 0 || recordsCount > 0;
    } catch {
      return false;
    }
  }, []);

  return {
    syncToBackend,
    syncFromBackend,
    hasMigrationData,
    isSyncing,
    lastSynced,
    syncError,
  };
}
