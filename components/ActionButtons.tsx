"use client";

import { Box, IconButton } from "@mui/material";
import { Close, Favorite } from "@mui/icons-material";

interface ActionButtonsProps {
  onLike: () => void;
  onDislike: () => void;
  disabled?: boolean;
}

export default function ActionButtons({
  onLike,
  onDislike,
  disabled = false,
}: ActionButtonsProps) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 4,
        mt: 2,
      }}
    >
      {/* Dislike Button */}
      <IconButton
        aria-label="dislike"
        data-testid="dislike-btn"
        onClick={onDislike}
        disabled={disabled}
        sx={{
          width: 56,
          height: 56,
          bgcolor: "white",
          color: "grey.600",
          border: "2px solid",
          borderColor: "grey.300",
          "&:hover": {
            bgcolor: "grey.50",
            borderColor: "grey.400",
            transform: "scale(1.05)",
          },
          "&:disabled": {
            opacity: 0.5,
          },
          transition: "all 0.2s ease-in-out",
        }}
      >
        <Close fontSize="large" />
      </IconButton>

      {/* Like Button */}
      <IconButton
        aria-label="like"
        data-testid="like-btn"
        onClick={onLike}
        disabled={disabled}
        sx={{
          width: 56,
          height: 56,
          bgcolor: "white",
          color: "primary.main",
          border: "2px solid",
          borderColor: "primary.main",
          "&:hover": {
            bgcolor: "primary.50",
            transform: "scale(1.05)",
          },
          "&:disabled": {
            opacity: 0.5,
          },
          transition: "all 0.2s ease-in-out",
        }}
      >
        <Favorite fontSize="large" />
      </IconButton>
    </Box>
  );
}
