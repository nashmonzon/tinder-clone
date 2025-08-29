"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  Typography,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress,
  Fab,
  Button,
} from "@mui/material";
import { Undo, Refresh, Favorite as FavoriteIcon } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import ProfileCard from "./ProfileCard";
import ActionButtons from "./ActionButtons";
import MatchModal from "./MatchModal";
import { useMatches } from "@/contexts/MatchContext";
import { getProfiles, type Profile } from "@/lib/api";

type SwipeAction = "like" | "dislike";

interface SwipeHistory {
  profile: Profile;
  action: SwipeAction;
  timestamp: number;
}

export default function SwipeInterface() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [swipeHistory, setSwipeHistory] = useState<SwipeHistory[]>([]);
  const [showMatch, setShowMatch] = useState(false);
  const [matchedProfile, setMatchedProfile] = useState<Profile | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showUndoSnackbar, setShowUndoSnackbar] = useState(false);
  const [pendingLike, setPendingLike] = useState<Profile | null>(null);
  const router = useRouter();

  const { matches, addMatch } = useMatches();
  const matchCount = matches.length;

  const matchedIds = useMemo(
    () => new Set(matches.map((m) => m.profile.id)),
    [matches]
  );
  const visibleProfiles = useMemo(
    () => profiles.filter((p) => !matchedIds.has(p.id)),
    [profiles, matchedIds]
  );

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await getProfiles();
        setProfiles(res.data);
        setError(null);
        setCurrentIndex(0);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        setError("Failed to load profiles. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const currentProfile = visibleProfiles[currentIndex];
  const nextProfile = visibleProfiles[currentIndex + 1];
  const hasMoreProfiles = currentIndex < visibleProfiles.length - 1;

  const handleSwipe = useCallback(
    (action: SwipeAction) => {
      if (!currentProfile || isAnimating) return;

      setIsAnimating(true);

      const historyEntry: SwipeHistory = {
        profile: currentProfile,
        action,
        timestamp: Date.now(),
      };
      setSwipeHistory((prev) => [...prev, historyEntry]);

      if (action === "like") {
        // 👇 NO addMatch aquí
        setPendingLike(currentProfile);
        setMatchedProfile(currentProfile);
        setShowMatch(true);
        setIsAnimating(false);
        // 👈 NO avanzamos índice
      } else {
        setTimeout(() => {
          setCurrentIndex((prev) => prev + 1);
          setIsAnimating(false);
        }, 200);
      }
    },
    [currentProfile, isAnimating]
  );

  const handleUndo = useCallback(() => {
    if (swipeHistory.length === 0 || isAnimating) return;
    setSwipeHistory((prev) => prev.slice(0, -1));
    setCurrentIndex((prev) => Math.max(0, prev - 1));
    setShowUndoSnackbar(true);
  }, [swipeHistory, isAnimating]);

  const handleRefresh = useCallback(async () => {
    setLoading(true);
    setCurrentIndex(0);
    setSwipeHistory([]);
    setError(null);
    setShowMatch(false);
    setMatchedProfile(null);
    setIsAnimating(false);

    try {
      const res = await getProfiles();
      setProfiles(res.data);
    } catch {
      setError("Failed to refresh profiles. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleMatchClose = useCallback(() => {
    setShowMatch(false);
    setMatchedProfile(null);

    if (pendingLike) {
      addMatch(pendingLike);
      setPendingLike(null);
    }
  }, [pendingLike, addMatch]);

  const handleSendMessage = useCallback(() => {
    if (pendingLike) {
      addMatch(pendingLike);
      setPendingLike(null);
    }
    setShowMatch(false);
    setMatchedProfile(null);

    router.push("/matches");
  }, [pendingLike, addMatch, router]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: 400,
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography variant="h6" color="error" gutterBottom>
          {error}
        </Typography>
        <IconButton onClick={handleRefresh} color="primary" size="large">
          <Refresh />
        </IconButton>
      </Box>
    );
  }

  if (!showMatch && !hasMoreProfiles && !currentProfile) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography variant="h5" gutterBottom>
          No more profiles
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          You&apos;ve seen everyone in your area. Check back later for new
          profiles!
        </Typography>
        <IconButton onClick={handleRefresh} color="primary" size="large">
          <Refresh />
        </IconButton>
        <Button
          aria-label="go-to-matches"
          variant="contained"
          startIcon={<FavoriteIcon />}
          onClick={() => router.push("/matches")}
          sx={{ ml: 1 }}
        >
          Go to Matches
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{ width: "100%", maxWidth: 400, mx: "auto", position: "relative" }}
    >
      <Box sx={{ position: "relative", height: 500 }}>
        {nextProfile && (
          <Box
            sx={{
              position: "absolute",
              top: 8,
              left: 4,
              right: 4,
              zIndex: 1,
              transform: "scale(0.95) translateZ(0)",
              opacity: 0.8,
              transition: "all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)",
              willChange: "transform, opacity",
            }}
          >
            <ProfileCard profile={nextProfile} disabled />
          </Box>
        )}

        {currentProfile && (
          <Box
            sx={{
              position: "relative",
              zIndex: 2,
              transition: "all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)",
              transform: isAnimating
                ? "scale(0.98) translateZ(0)"
                : "scale(1) translateZ(0)",
              opacity: isAnimating ? 0.9 : 1,
              willChange: "transform, opacity",
            }}
          >
            <ProfileCard profile={currentProfile} disabled={isAnimating} />
          </Box>
        )}
      </Box>

      {currentProfile && (
        <Box
          sx={{
            transition: "opacity 0.2s ease-in-out",
            opacity: isAnimating ? 0.7 : 1,
          }}
        >
          <ActionButtons
            onLike={() => handleSwipe("like")}
            onDislike={() => handleSwipe("dislike")}
            disabled={isAnimating}
          />
        </Box>
      )}

      <Box sx={{ position: "fixed", bottom: 100, right: 16, zIndex: 1000 }}>
        {matchCount > 0 && (
          <Fab
            aria-label="open-matches"
            size="small"
            color="primary"
            onClick={() => router.push("/matches")}
            sx={{ mb: 1, display: "block", position: "relative" }}
          >
            <FavoriteIcon />
            <Box
              sx={{
                position: "absolute",
                top: -4,
                right: -4,
                bgcolor: "error.main",
                color: "white",
                borderRadius: "50%",
                width: 20,
                height: 20,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: "bold",
              }}
            >
              {matchCount > 99 ? "99+" : matchCount}
            </Box>
          </Fab>
        )}

        {swipeHistory.length > 0 && (
          <Fab
            aria-label="undo"
            size="small"
            color="secondary"
            onClick={handleUndo}
            disabled={isAnimating}
            sx={{ mb: 1, display: "block" }}
          >
            <Undo />
          </Fab>
        )}

        <Fab
          aria-label="refresh"
          size="small"
          color="primary"
          onClick={handleRefresh}
          disabled={loading}
        >
          <Refresh />
        </Fab>
      </Box>

      <MatchModal
        open={showMatch}
        profile={matchedProfile}
        onClose={handleMatchClose}
        onSendMessage={() => handleSendMessage()} // firma simple
      />

      <Snackbar
        open={showUndoSnackbar}
        autoHideDuration={2000}
        onClose={() => setShowUndoSnackbar(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="info" variant="filled">
          Last swipe undone
        </Alert>
      </Snackbar>

      <Box sx={{ textAlign: "center", mt: 2 }}>
        <Typography variant="caption" color="text.secondary">
          {Math.max(0, visibleProfiles.length - currentIndex)} profiles
          remaining
        </Typography>
      </Box>
    </Box>
  );
}
