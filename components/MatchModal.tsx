"use client";

import {
  Dialog,
  DialogContent,
  Typography,
  Box,
  Button,
  Avatar,
  IconButton,
} from "@mui/material";
import { Favorite, Close, Message, Star } from "@mui/icons-material";
import { useState, useEffect } from "react";

interface Profile {
  id: number;
  name: string;
  age: number;
  image: string;
  bio: string;
  images?: string[];
}

interface MatchModalProps {
  open: boolean;
  profile: Profile | null;
  onClose: () => void;
  onSendMessage?: (profile: Profile) => void;
}

export default function MatchModal({
  open,
  profile,
  onClose,
  onSendMessage,
}: MatchModalProps) {
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    if (open) {
      setShowAnimation(true);
      // Reset animation after it completes
      const timer = setTimeout(() => setShowAnimation(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [open]);

  if (!profile) return null;

  const handleSendMessage = () => {
    onSendMessage?.(profile);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          textAlign: "center",
          p: 0,
          overflow: "hidden",
          background: "linear-gradient(135deg, #ff4458 0%, #ff6b7a 100%)",
        },
      }}
    >
      <DialogContent sx={{ p: 0, position: "relative" }}>
        <IconButton
          onClick={onClose}
          sx={{
            position: "absolute",
            top: 16,
            right: 16,
            zIndex: 4,
            bgcolor: "rgba(255,255,255,0.2)",
            color: "white",
            "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
          }}
        >
          <Close />
        </IconButton>

        {/* Animated hearts background */}
        {showAnimation && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              pointerEvents: "none",
              zIndex: 1,
            }}
          >
            {[...Array(6)].map((_, i) => (
              <Favorite
                key={i}
                sx={{
                  position: "absolute",
                  color: "rgba(255,255,255,0.3)",
                  fontSize: 24 + Math.random() * 16,
                  left: `${Math.random() * 80 + 10}%`,
                  top: `${Math.random() * 80 + 10}%`,
                  animation: `heartFloat 2s ease-out ${i * 0.3}s`,
                  "@keyframes heartFloat": {
                    "0%": {
                      transform: "translateY(0) scale(0)",
                      opacity: 0,
                    },
                    "50%": {
                      transform: "translateY(-20px) scale(1)",
                      opacity: 1,
                    },
                    "100%": {
                      transform: "translateY(-40px) scale(0)",
                      opacity: 0,
                    },
                  },
                }}
              />
            ))}
          </Box>
        )}

        <Box sx={{ p: 4, color: "white", position: "relative", zIndex: 2 }}>
          {/* Match title with animation */}
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="h3"
              component="h2"
              gutterBottom
              sx={{
                fontWeight: "bold",
                textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
                animation: showAnimation ? "bounceIn 0.8s ease-out" : "none",
                "@keyframes bounceIn": {
                  "0%": { transform: "scale(0)", opacity: 0 },
                  "50%": { transform: "scale(1.1)", opacity: 1 },
                  "100%": { transform: "scale(1)", opacity: 1 },
                },
              }}
            >
              It&apos;s a Match!
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              You and {profile.name} liked each other
            </Typography>
          </Box>

          {/* Profile images */}
          <Box sx={{ position: "relative", mb: 4 }}>
            <Avatar
              src={profile.image}
              alt={profile.name}
              sx={{
                width: 140,
                height: 140,
                mx: "auto",
                border: "6px solid white",
                boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                animation: showAnimation
                  ? "profilePulse 1s ease-out 0.5s"
                  : "none",
                "@keyframes profilePulse": {
                  "0%": { transform: "scale(1)" },
                  "50%": { transform: "scale(1.05)" },
                  "100%": { transform: "scale(1)" },
                },
              }}
            />

            {/* Match indicator */}
            <Box
              sx={{
                position: "absolute",
                top: -8,
                right: "calc(50% - 80px)",
                bgcolor: "white",
                borderRadius: "50%",
                width: 48,
                height: 48,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
              }}
            >
              <Star sx={{ color: "#ffd700", fontSize: 28 }} />
            </Box>
          </Box>

          {/* Profile info */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
              {profile.name}, {profile.age}
            </Typography>
            {profile.bio && (
              <Typography
                variant="body1"
                sx={{ opacity: 0.9, maxWidth: 300, mx: "auto" }}
              >
                {profile.bio}
              </Typography>
            )}
          </Box>

          {/* Action buttons */}
          <Box
            sx={{
              display: "flex",
              gap: 2,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Button
              variant="outlined"
              onClick={onClose}
              sx={{
                borderRadius: 3,
                px: 4,
                py: 1.5,
                borderColor: "white",
                color: "white",
                "&:hover": {
                  borderColor: "white",
                  bgcolor: "rgba(255,255,255,0.1)",
                },
              }}
            >
              Keep Swiping
            </Button>
            <Button
              variant="contained"
              onClick={handleSendMessage}
              startIcon={<Message />}
              sx={{
                borderRadius: 3,
                px: 4,
                py: 1.5,
                bgcolor: "white",
                color: "primary.main",
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.9)",
                },
              }}
            >
              Send Message
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
