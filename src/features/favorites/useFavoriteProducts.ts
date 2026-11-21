"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { authClient } from "@/lib/auth-client";
import type { CatalogProduct } from "@/features/catalog/data/catalogData";

const GUEST_KEY = "petrolero-demo-favorites";
const LOCAL_EVENT = "petrolero:favorites-changed";


type FavoritesState = {
  ids: string[];
  ready: boolean;
  saving: boolean;
  error: string | null;
};

const initialState: FavoritesState = {
  ids: [],
  ready: false,
  saving: false,
  error: null,
};

function sanitize(value: unknown, validIds: ReadonlySet<string>): string[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((id): id is string =>
    typeof id === "string" && validIds.has(id),
  ))];
}

function readGuest(validIds: ReadonlySet<string>): string[] {
  try {
    return sanitize(JSON.parse(localStorage.getItem(GUEST_KEY) || "[]") as unknown, validIds);
  } catch {
    return [];
  }
}

function writeGuest(ids: string[]) {
  try {
    localStorage.setItem(GUEST_KEY, JSON.stringify(ids));
    window.dispatchEvent(new Event(LOCAL_EVENT));
  } catch {
    // Favorites still work for this session when storage is restricted.
  }
}

async function requestFavorites(method: "GET" | "POST" | "DELETE", validIds: ReadonlySet<string>, payload?: unknown) {
  const response = await fetch("/api/account/favorites", {
    method,
    cache: "no-store",
    credentials: "same-origin",
    headers: payload ? { "Content-Type": "application/json" } : undefined,
    body: payload ? JSON.stringify(payload) : undefined,
  });
  if (!response.ok) throw new Error("Синхронизация избранного недоступна.");
  const data: unknown = await response.json();
  if (!data || typeof data !== "object" || !("ids" in data)) {
    throw new Error("Неожиданный ответ сервера.");
  }
  return sanitize((data as { ids: unknown }).ids, validIds);
}

/**
 * Guest favorites are device-local. After login they are merged once into
 * the user's list, which is subsequently owned only by PostgreSQL.
 * Never write account favorites into the shared guest storage key.
 */
export default function useFavoriteProducts(products: readonly Pick<CatalogProduct, "id" | "published">[], guestOnly = false) {
  const validIds = useMemo(() => new Set(products.filter(p => p.published).map(p => p.id)), [products]);
  const { data: session, isPending } = authClient.useSession();
  const ownerId = guestOnly ? null : session?.user?.id ?? null;
  const waitingForSession = !guestOnly && isPending;
  const [state, setState] = useState<FavoritesState>(initialState);
  const [attempt, setAttempt] = useState(0);
  const savingRef = useRef(false);
  const ownerRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    ownerRef.current = waitingForSession ? undefined : ownerId;
    savingRef.current = false;
    setState(initialState);

    if (waitingForSession) return () => { cancelled = true; };

    if (!ownerId) {
      setState({ ids: readGuest(validIds), ready: true, saving: false, error: null });
      return () => { cancelled = true; };
    }

    const load = async () => {
      const localGuestIds = readGuest();
      try {
        const ids = localGuestIds.length
          ? await requestFavorites("POST", validIds, { ids: localGuestIds, ownerId })
          : await requestFavorites("GET", validIds);

        if (cancelled || ownerRef.current !== ownerId) return;
        // Clear only the guest's own selection, never the account's list.
        if (localGuestIds.length) {
          try { localStorage.removeItem(GUEST_KEY); } catch { /* read-only storage */ }
        }
        setState({ ids, ready: true, saving: false, error: null });
      } catch {
        if (cancelled || ownerRef.current !== ownerId) return;
        setState({
          ids: [], ready: false, saving: false,
          error: "Не удалось загрузить избранное из аккаунта. Повторите попытку.",
        });
      }
    };

    void load();
    return () => { cancelled = true; };
  }, [ownerId, waitingForSession, attempt, validIds]);

  // Update an already open tab after a second device/tab saved new items.
  useEffect(() => {
    if (waitingForSession || !state.ready || state.saving) return;
    let disposed = false;
    const refresh = async () => {
      if (!ownerId) {
        setState((current) => ({ ...current, ids: readGuest() }));
        return;
      }
      try {
        const ids = await requestFavorites("GET");
        if (!disposed && ownerRef.current === ownerId && !savingRef.current) {
          setState((current) => ({ ...current, ids, error: null }));
        }
      } catch {
        // Keep the last successful list; a refresh failure is non-destructive.
      }
    };

    const onFocus = () => { void refresh(); };
    const onStorage = (event: StorageEvent) => {
      if (!ownerId && event.key === GUEST_KEY) void refresh();
    };
    const onGuestChange = () => {
      if (!ownerId) void refresh();
    };

    window.addEventListener("focus", onFocus);
    window.addEventListener("storage", onStorage);
    window.addEventListener(LOCAL_EVENT, onGuestChange);
    return () => {
      disposed = true;
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(LOCAL_EVENT, onGuestChange);
    };
  }, [ownerId, state.ready, state.saving, waitingForSession, validIds]);

  const retry = useCallback(() => setAttempt((value) => value + 1), []);

  const toggle = useCallback(async (productId: string): Promise<boolean | null> => {
    if (!validIds.has(productId) || !state.ready || savingRef.current ||
        ownerRef.current !== ownerId) return null;

    const has = state.ids.includes(productId);
    const next = has
      ? state.ids.filter((id) => id !== productId)
      : [...state.ids, productId];

    if (!ownerId) {
      setState((current) => ({ ...current, ids: next, error: null }));
      writeGuest(next);
      return !has;
    }

    savingRef.current = true;
    setState((current) => ({ ...current, ids: next, saving: true, error: null }));
    try {
      const ids = await requestFavorites(has ? "DELETE" : "POST", validIds, {
        id: productId, ownerId,
      });
      if (ownerRef.current === ownerId) {
        setState({ ids, ready: true, saving: false, error: null });
      }
      return !has;
    } catch {
      // A request can succeed on the server even when its response is lost:
      // restore from the authoritative list rather than blindly reverting.
      let ids = state.ids;
      try { ids = await requestFavorites("GET"); } catch { /* keep previous list */ }
      if (ownerRef.current === ownerId) {
        setState({
          ids, ready: true, saving: false,
          error: "Не удалось сохранить избранное. Попробуйте ещё раз.",
        });
      }
      return null;
    } finally {
      savingRef.current = false;
    }
  }, [ownerId, state.ready, state.ids, validIds]);

  return {
    favoriteIds: state.ids,
    favoritesReady: state.ready,
    favoritesSaving: state.saving,
    favoritesError: state.error,
    toggleFavoriteId: toggle,
    retryFavorites: retry,
  };
}
