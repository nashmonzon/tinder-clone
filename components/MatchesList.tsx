"use client";

import { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  GridLegacy as Grid,
} from "@mui/material";

import {
  Message,
  MoreVert,
  Block,
  Schedule,
  Favorite,
} from "@mui/icons-material";
import { useMatches, type Match } from "@/contexts/MatchContext";

export default function MatchesList() {
  const { matches, unmatch } = useMatches();
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [showUnmatchDialog, setShowUnmatchDialog] = useState(false);

  const handleUnmatch = (match: Match) => {
    setSelectedMatch(match);
    setShowUnmatchDialog(true);
  };

  const confirmUnmatch = () => {
    if (selectedMatch) {
      unmatch(selectedMatch.id);
      setShowUnmatchDialog(false);
      setSelectedMatch(null);
    }
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  if (matches.length === 0) {
    return (
      <Box
        sx={{
          textAlign: "center",
          py: 8,
          px: 4,
          borderRadius: 4,
          bgcolor: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
        }}
      >
        <Favorite
          sx={{ fontSize: 64, color: "primary.main", mb: 2, opacity: 0.7 }}
        />
        <Typography
          variant="h4"
          gutterBottom
          sx={{ fontWeight: 600, color: "text.primary" }}
        >
          No matches yet
        </Typography>
        <Typography
          variant="h6"
          color="text.secondary"
          sx={{ maxWidth: 400, mx: "auto" }}
        >
          Start swiping to find your perfect matches! Your connections will
          appear here.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          mb: 4,
          p: 3,
          borderRadius: 3,
          bgcolor: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: "primary.main",
            mb: 1,
          }}
        >
          Your Matches
        </Typography>
        <Typography variant="h6" color="text.secondary">
          {matches.length} {matches.length === 1 ? "connection" : "connections"}{" "}
          waiting for you
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {matches.map((match) => (
          <Grid item xs={12} sm={6} md={4} key={match.id}>
            <Card
              sx={{
                position: "relative",
                overflow: "hidden",
                borderRadius: 4,
                bgcolor: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(10px)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                "&:hover": {
                  transform: "translateY(-8px) scale(1.02)",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
                },
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              <Box sx={{ position: "relative" }}>
                <Box sx={{ position: "relative", overflow: "hidden" }}>
                  <Avatar
                    src={match.profile.image}
                    alt={match.profile.name}
                    sx={{
                      width: "100%",
                      height: 240,
                      borderRadius: 0,
                    }}
                  />
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: "50%",
                      background:
                        "linear-gradient(transparent, rgba(0,0,0,0.7))",
                    }}
                  />
                </Box>

                {Date.now() - match.matchedAt < 24 * 60 * 60 * 1000 && (
                  <Chip
                    label="✨ New Match"
                    size="small"
                    sx={{
                      position: "absolute",
                      top: 12,
                      left: 12,
                      bgcolor: "linear-gradient(45deg, #FF6B6B, #FF8E53)",
                      background: "linear-gradient(45deg, #FF6B6B, #FF8E53)",
                      color: "white",
                      fontWeight: 600,
                      boxShadow: "0 4px 12px rgba(255,107,107,0.4)",
                      animation: "pulse 2s infinite",
                    }}
                  />
                )}

                <IconButton
                  onClick={() => handleUnmatch(match)}
                  sx={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                    bgcolor: "rgba(255,255,255,0.9)",
                    color: "text.primary",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    "&:hover": {
                      bgcolor: "rgba(255,255,255,1)",
                      transform: "scale(1.1)",
                    },
                    transition: "all 0.2s ease",
                  }}
                >
                  <MoreVert />
                </IconButton>
              </Box>

              <CardContent sx={{ p: 3 }}>
                <Typography
                  variant="h5"
                  gutterBottom
                  sx={{
                    fontWeight: 700,
                    color: "text.primary",
                    mb: 1,
                  }}
                >
                  {match.profile.name}, {match.profile.age}
                </Typography>

                {match.lastMessage ? (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mb: 3,
                      fontStyle: "italic",
                      lineHeight: 1.5,
                    }}
                  >
                    {match.lastMessage.fromUser ? "You: " : ""}
                    {match.lastMessage.text}
                  </Typography>
                ) : (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mb: 3,
                      fontStyle: "italic",
                      lineHeight: 1.5,
                    }}
                  >
                    💬 Say hello to your new match!
                  </Typography>
                )}

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Schedule fontSize="small" sx={{ color: "primary.main" }} />
                    <Typography
                      variant="body2"
                      sx={{
                        color: "primary.main",
                        fontWeight: 500,
                      }}
                    >
                      {formatTimeAgo(match.matchedAt)}
                    </Typography>
                  </Box>

                  <Button
                    variant="contained"
                    size="medium"
                    startIcon={<Message />}
                    sx={{
                      borderRadius: 3,
                      px: 3,
                      py: 1,
                      background: "linear-gradient(45deg, #667eea, #764ba2)",
                      boxShadow: "0 4px 15px rgba(102,126,234,0.4)",
                      fontWeight: 600,
                      textTransform: "none",
                      "&:hover": {
                        background: "linear-gradient(45deg, #5a6fd8, #6a4190)",
                        boxShadow: "0 6px 20px rgba(102,126,234,0.6)",
                        transform: "translateY(-2px)",
                      },
                      transition: "all 0.2s ease",
                    }}
                  >
                    Message
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog
        open={showUnmatchDialog}
        onClose={() => setShowUnmatchDialog(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 1,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 600, fontSize: "1.25rem" }}>
          Unmatch {selectedMatch?.profile.name}?
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ lineHeight: 1.6 }}>
            Are you sure you want to unmatch with {selectedMatch?.profile.name}?
            This action cannot be undone and you&apos;ll lose all your
            conversation history.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button
            onClick={() => setShowUnmatchDialog(false)}
            sx={{
              borderRadius: 2,
              px: 3,
              textTransform: "none",
              fontWeight: 500,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmUnmatch}
            color="error"
            variant="contained"
            startIcon={<Block />}
            sx={{
              borderRadius: 2,
              px: 3,
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Unmatch
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
