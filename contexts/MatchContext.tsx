"use client";

import type React from "react";
import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  errorHandler,
  ValidationError,
  StorageError,
} from "@/lib/errorHandler";

export interface Match {
  id: string;
  profile: {
    id: number;
    name: string;
    age: number;
    image: string;
    bio: string;
    images?: string[];
  };
  matchedAt: number;
  lastMessage?: {
    text: string;
    timestamp: number;
    fromUser: boolean;
  } | null;
  isUnmatched: boolean;
}

interface MatchState {
  matches: Match[];
  loading: boolean;
  error: string | null;
}

type MatchAction =
  | { type: "SET_MATCHES"; payload: Match[] }
  | { type: "ADD_MATCH"; payload: Match }
  | { type: "UNMATCH"; payload: string }
  | {
      type: "ADD_MESSAGE";
      payload: { matchId: string; message: Match["lastMessage"] };
    }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "CLEAR_MATCHES" };

const matchReducer = (state: MatchState, action: MatchAction): MatchState => {
  switch (action.type) {
    case "SET_MATCHES":
      return { ...state, matches: action.payload, loading: false };
    case "ADD_MATCH":
      return { ...state, matches: [action.payload, ...state.matches] };
    case "UNMATCH":
      return {
        ...state,
        matches: state.matches.map((match) =>
          match.id === action.payload ? { ...match, isUnmatched: true } : match
        ),
      };
    case "ADD_MESSAGE":
      return {
        ...state,
        matches: state.matches.map((match) =>
          match.id === action.payload.matchId
            ? { ...match, lastMessage: action.payload.message }
            : match
        ),
      };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false };
    case "CLEAR_MATCHES":
      return { ...state, matches: [] };
    default:
      return state;
  }
};

export interface MatchContextType {
  matches: Match[];
  loading: boolean;
  error: string | null;
  addMatch: (profile: Match["profile"]) => Match | null;
  getMatch: (id: string) => Match | undefined;
  unmatch: (matchId: string) => boolean;
  addMessage: (matchId: string, text: string, fromUser?: boolean) => boolean;
  clearMatches: () => boolean;
  getStorageInfo: () => { matchCount: number; storageUsed: string };
}

const MatchContext = createContext<MatchContextType | undefined>(undefined);

const STORAGE_KEY = "tinder-matches";
const STORAGE_VERSION = 1;
const MAX_MATCHES = 1000;
const SAVE_DEBOUNCE_MS = 200;

const createMatchId = (profileId: number) => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `match_${profileId}_${crypto.randomUUID()}`;
  }
  return `match_${profileId}_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;
};

type StoredShape = { version: number; data: Match[] };

function pack(matches: Match[]): string {
  const payload: StoredShape = { version: STORAGE_VERSION, data: matches };
  return JSON.stringify(payload);
}

function unpack(text: string | null): Match[] {
  if (!text) return [];
  try {
    const json = JSON.parse(text) as StoredShape | Match[];

    if (Array.isArray(json)) return json;
    if (typeof json === "object" && "version" in json && "data" in json) {
      return Array.isArray(json.data) ? json.data : [];
    }
  } catch {}
  throw new ValidationError("Invalid matches data format");
}

export function MatchProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(matchReducer, {
    matches: [],
    loading: true,
    error: null,
  });

  const activeMatches = useMemo(
    () => state.matches.filter((m) => !m.isUnmatched),
    [state.matches]
  );

  const validateMatch = useCallback((match: any): boolean => {
    try {
      if (!match || typeof match !== "object") return false;
      if (!match.id || typeof match.id !== "string") return false;
      if (!match.profile || typeof match.profile !== "object") return false;
      if (!match.matchedAt || typeof match.matchedAt !== "number") return false;
      if (typeof match.isUnmatched !== "boolean") return false;
      errorHandler.validateProfile(match.profile);
      return true;
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const raw = errorHandler.safeLocalStorage.getItem(STORAGE_KEY);
      if (!raw) {
        dispatch({ type: "SET_MATCHES", payload: [] });
        return;
      }
      const parsed = unpack(raw);
      const validMatches = parsed.filter(validateMatch).slice(0, MAX_MATCHES);
      dispatch({ type: "SET_MATCHES", payload: validMatches });
    } catch (error) {
      errorHandler.logError(
        error as Error,
        "Loading matches from localStorage"
      );
      dispatch({ type: "SET_ERROR", payload: "Failed to load matches" });
      dispatch({ type: "SET_MATCHES", payload: [] });
      errorHandler.safeLocalStorage.removeItem(STORAGE_KEY);
    }
  }, [validateMatch]);

  const saveTimer = useRef<number | null>(null);
  const lastSavedRef = useRef<string>("");

  useEffect(() => {
    if (state.loading) return;

    const toSave = state.matches.slice(0, MAX_MATCHES);
    const payload = pack(toSave);

    if (payload === lastSavedRef.current) return;

    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      try {
        const ok = errorHandler.safeLocalStorage.setItem(STORAGE_KEY, payload);
        if (!ok)
          throw new StorageError("Failed to save matches to localStorage");
        lastSavedRef.current = payload;
      } catch (error) {
        errorHandler.logError(error as Error, "Saving matches to localStorage");
        dispatch({ type: "SET_ERROR", payload: "Failed to save matches" });
      }
    }, SAVE_DEBOUNCE_MS);

    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
    };
  }, [state.matches, state.loading]);

  const addMatch = useCallback(
    (profile: Match["profile"]): Match | null => {
      try {
        errorHandler.validateProfile(profile);

        const existing = state.matches.find(
          (m) => m.profile.id === profile.id && !m.isUnmatched
        );
        if (existing) {
          throw new ValidationError("Match already exists with this profile");
        }

        const newMatch: Match = {
          id: createMatchId(profile.id),
          profile,
          matchedAt: Date.now(),
          isUnmatched: false,
        };

        dispatch({ type: "ADD_MATCH", payload: newMatch });
        return newMatch;
      } catch (error) {
        errorHandler.logError(error as Error, "Adding new match");
        dispatch({
          type: "SET_ERROR",
          payload: (error as Error)?.message || "Failed to add match",
        });
        return null;
      }
    },
    [state.matches]
  );

  const getMatch = useCallback(
    (id: string): Match | undefined => {
      if (!id || typeof id !== "string") {
        errorHandler.logError(new ValidationError("Invalid match ID"));
        return undefined;
      }
      return state.matches.find((m) => m.id === id);
    },
    [state.matches]
  );

  const unmatch = useCallback(
    (matchId: string): boolean => {
      try {
        if (!matchId || typeof matchId !== "string") {
          throw new ValidationError("Invalid match ID");
        }
        const match = state.matches.find((m) => m.id === matchId);
        if (!match) throw new ValidationError("Match not found");

        dispatch({ type: "UNMATCH", payload: matchId });
        return true;
      } catch (error) {
        errorHandler.logError(error as Error, "Unmatching user");
        dispatch({
          type: "SET_ERROR",
          payload: (error as Error)?.message || "Failed to unmatch",
        });
        return false;
      }
    },
    [state.matches]
  );

  const addMessage = useCallback(
    (matchId: string, text: string, fromUser = true): boolean => {
      try {
        if (!matchId || typeof matchId !== "string") {
          throw new ValidationError("Invalid match ID");
        }
        if (!text || typeof text !== "string" || text.trim().length === 0) {
          throw new ValidationError("Message text is required");
        }
        if (text.length > 1000) {
          throw new ValidationError("Message too long (max 1000 characters)");
        }
        const match = state.matches.find((m) => m.id === matchId);
        if (!match) throw new ValidationError("Match not found");
        if (match.isUnmatched) {
          throw new ValidationError("Cannot send message to unmatched user");
        }

        const message: Match["lastMessage"] = {
          text: text.trim(),
          timestamp: Date.now(),
          fromUser,
        };
        dispatch({ type: "ADD_MESSAGE", payload: { matchId, message } });
        return true;
      } catch (error) {
        errorHandler.logError(error as Error, "Adding message to match");
        dispatch({
          type: "SET_ERROR",
          payload: (error as Error)?.message || "Failed to send message",
        });
        return false;
      }
    },
    [state.matches]
  );

  const clearMatches = useCallback((): boolean => {
    try {
      const success = errorHandler.safeLocalStorage.removeItem(STORAGE_KEY);
      if (success) {
        dispatch({ type: "CLEAR_MATCHES" });
        lastSavedRef.current = ""; // reset para evitar comparar con snapshot anterior
      }
      return success;
    } catch (error) {
      errorHandler.logError(error as Error, "Clearing all matches");
      dispatch({
        type: "SET_ERROR",
        payload: (error as Error)?.message || "Failed to clear matches",
      });
      return false;
    }
  }, []);

  const getStorageInfo = useCallback((): {
    matchCount: number;
    storageUsed: string;
  } => {
    try {
      const stored = errorHandler.safeLocalStorage.getItem(STORAGE_KEY);
      const size = stored ? stored.length : 0;
      const storageUsed =
        size < 1024
          ? `${size} B`
          : size < 1024 * 1024
          ? `${(size / 1024).toFixed(2)} KB`
          : `${(size / (1024 * 1024)).toFixed(2)} MB`;
      return { matchCount: activeMatches.length, storageUsed };
    } catch (error) {
      errorHandler.logError(error as Error, "Getting storage info");
      return { matchCount: 0, storageUsed: "Unknown" };
    }
  }, [activeMatches.length]);

  const value: MatchContextType = {
    matches: activeMatches, // ← memo
    loading: state.loading,
    error: state.error,
    addMatch,
    getMatch,
    unmatch,
    addMessage,
    clearMatches,
    getStorageInfo,
  };

  return (
    <MatchContext.Provider value={value}>{children}</MatchContext.Provider>
  );
}

/* =========================
   Hook consumidor (igual)
========================= */

export function useMatches() {
  const ctx = useContext(MatchContext);
  if (ctx === undefined) {
    throw new Error("useMatches must be used within a MatchProvider");
  }
  return ctx;
}
