"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress,
  Fab,
} from "@mui/material";
import { Undo, Refresh, Favorite as FavoriteIcon } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import ProfileCard from "./ProfileCard";
import ActionButtons from "./ActionButtons";
import MatchModal from "./MatchModal";
import { useMatches } from "@/contexts/MatchContext";

interface Profile {
  id: number;
  name: string;
  age: number;
  image: string;
  bio: string;
  images?: string[];
  location?: string;
  interests?: string[];
}

type SwipeAction = "like" | "dislike";

interface SwipeHistory {
  profile: Profile;
  action: SwipeAction;
  timestamp: number;
}

const mockProfiles: Profile[] = [
  {
    id: 1,
    name: "Sarah",
    age: 21,
    image: "/girl-1.jpg",
    bio: "Love hiking and coffee ☕",
    location: "2 miles away",
    interests: ["hiking", "coffee", "photography"],
  },
  {
    id: 2,
    name: "Jessica",
    age: 23,
    image: "/girl-2.png",
    images: ["/girl-24.png", "/girl-22.png", "/girl-23.png", "/girl-25.png"],
    bio: "Artist and dog lover 🎨🐕",
    location: "5 miles away",
    interests: ["art", "dogs", "music"],
  },
  {
    id: 3,
    name: "Emma",
    age: 25,
    image: "/girl-3.jpg",
    bio: "Yoga instructor and foodie 🧘‍♀️",
    location: "3 miles away",
    interests: ["yoga", "cooking", "travel"],
  },
  {
    id: 4,
    name: "Olivia",
    age: 24,
    image: "/girl-4.jpg",
    bio: "Marketing professional who loves weekend adventures",
    location: "1 mile away",
    interests: ["marketing", "adventure", "wine"],
  },
  {
    id: 5,
    name: "Sophia",
    age: 26,
    image: "/girl-5.jpg",
    bio: "Bookworm and coffee enthusiast",
    location: "4 miles away",
    interests: ["reading", "coffee", "writing"],
  },
];

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
  const router = useRouter();

  const { matches, addMatch } = useMatches();
  const matchCount = matches.length;

  useEffect(() => {
    const loadProfiles = async () => {
      try {
        setLoading(true);

        await new Promise((resolve) => setTimeout(resolve, 1000));
        setProfiles(mockProfiles);
        setError(null);
      } catch (err) {
        setError("Failed to load profiles. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadProfiles();
  }, []);

  const currentProfile = profiles[currentIndex];
  const nextProfile = profiles[currentIndex + 1];
  const hasMoreProfiles = currentIndex < profiles.length - 1;

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

      const isMatch = action === "like";

      if (isMatch) {
        addMatch(currentProfile);
        setMatchedProfile(currentProfile);
        setShowMatch(true);
        setIsAnimating(false);
      } else {
        setTimeout(() => {
          setCurrentIndex((prev) => prev + 1);
          setIsAnimating(false);
        }, 200);
      }
    },
    [currentProfile, isAnimating, addMatch]
  );

  const handleUndo = useCallback(() => {
    if (swipeHistory.length === 0 || isAnimating) return;

    const lastAction = swipeHistory[swipeHistory.length - 1];

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
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setProfiles([...mockProfiles]);
    } catch (err) {
      setError("Failed to refresh profiles. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleMatchClose = useCallback(() => {
    setShowMatch(false);
    setMatchedProfile(null);
    setCurrentIndex((prev) => prev + 1);
  }, []);

  const handleSendMessage = useCallback(() => {
    router.push("/matches");
  }, [router]);

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

  if (!hasMoreProfiles && !currentProfile) {
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
            size="small"
            color="primary"
            onClick={() => router.push("/matches")}
            sx={{ mb: 1, display: "block", position: "relative" }}
          >
            <FavoriteIcon />
            {matchCount > 0 && (
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
            )}
          </Fab>
        )}

        {swipeHistory.length > 0 && (
          <Fab
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
        onSendMessage={handleSendMessage}
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
          {profiles.length - currentIndex} profiles remaining
        </Typography>
      </Box>
    </Box>
  );
}
