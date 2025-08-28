"use client";

import type React from "react";

import { useState, useEffect } from "react";
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  Skeleton,
} from "@mui/material";
import { PhotoCamera } from "@mui/icons-material";

interface Profile {
  id: number;
  name: string;
  age: number;
  image: string;
  bio: string;
  images?: string[]; // Support for multiple images
}

interface ProfileCardProps {
  profile: Profile;
  disabled?: boolean;
}

export default function ProfileCard({
  profile,
  disabled = false,
}: ProfileCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageLoading, setImageLoading] = useState(true);
  const [brokenImages, setBrokenImages] = useState<Set<number>>(new Set());

  // Get all available images (main image + additional images)
  const allImages = profile.images
    ? [profile.image, ...profile.images]
    : [profile.image];
  const currentImage = allImages[currentImageIndex] || profile.image;

  const isCurrentImageBroken = brokenImages.has(currentImageIndex);

  useEffect(() => {
    setCurrentImageIndex(0);
    setImageLoading(false);
    setBrokenImages(new Set());
  }, [profile.id]);

  useEffect(() => {
    if (!isCurrentImageBroken) {
      setImageLoading(false);
    }
  }, [currentImageIndex, isCurrentImageBroken]);

  const handleImageClick = (event: React.MouseEvent) => {
    if (disabled || allImages.length <= 1) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const cardWidth = rect.width;

    if (clickX > cardWidth / 2) {
      setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
    } else {
      setCurrentImageIndex(
        (prev) => (prev - 1 + allImages.length) % allImages.length
      );
    }
  };

  const handleImageLoad = () => {
    setImageLoading(false);
    setBrokenImages((prev) => {
      const newSet = new Set(prev);
      newSet.delete(currentImageIndex);
      return newSet;
    });
  };

  const handleImageError = () => {
    setImageLoading(false);
    setBrokenImages((prev) => new Set(prev).add(currentImageIndex));
  };

  const isValidProfile = profile && profile.name && profile.age;

  if (!isValidProfile) {
    return (
      <Card
        sx={{
          width: "100%",
          height: 500,
          mb: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box sx={{ textAlign: "center", p: 3 }}>
          <PhotoCamera sx={{ fontSize: 48, color: "grey.400", mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Profile unavailable
          </Typography>
        </Box>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        width: "100%",
        height: 500,
        position: "relative",
        overflow: "hidden",
        mb: 3,
        cursor: "default",
        opacity: disabled ? 0.7 : 1,
      }}
    >
      {allImages.length > 1 && (
        <Box
          sx={{
            position: "absolute",
            top: 12,
            left: 12,
            right: 12,
            zIndex: 2,
            display: "flex",
            gap: 0.5,
          }}
        >
          {allImages.map((_, index) => (
            <Box
              key={index}
              sx={{
                flex: 1,
                height: 3,
                bgcolor:
                  index === currentImageIndex
                    ? "white"
                    : "rgba(255,255,255,0.3)",
                borderRadius: 1.5,
                transition: "background-color 0.2s ease",
              }}
            />
          ))}
        </Box>
      )}

      {imageLoading && !isCurrentImageBroken && (
        <Skeleton
          variant="rectangular"
          width="100%"
          height={400}
          sx={{ position: "absolute", top: 0, left: 0, right: 0 }}
        />
      )}

      {!isCurrentImageBroken ? (
        <CardMedia
          component="img"
          height="400"
          image={currentImage}
          alt={`${profile.name}, ${profile.age}`}
          onLoad={handleImageLoad}
          onError={handleImageError}
          onClick={handleImageClick}
          sx={{
            objectFit: "cover",
            display: imageLoading ? "none" : "block",
            cursor: allImages.length > 1 ? "pointer" : "default",
          }}
        />
      ) : (
        <Box
          onClick={handleImageClick}
          sx={{
            height: 400,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "grey.200",
            color: "grey.600",
            cursor: allImages.length > 1 ? "pointer" : "default",
            transition: "all 0.2s ease",
            "&:hover":
              allImages.length > 1
                ? {
                    bgcolor: "grey.300",
                    transform: "scale(1.02)",
                  }
                : {},
            userSelect: "none",
          }}
        >
          <Box sx={{ textAlign: "center" }}>
            <PhotoCamera sx={{ fontSize: 48, mb: 1 }} />
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Image unavailable
            </Typography>
          </Box>
        </Box>
      )}

      <CardContent
        sx={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          background: "linear-gradient(transparent, rgba(0,0,0,0.8))",
          color: "white",
          pt: 4,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 1,
          }}
        >
          <Typography
            variant="h5"
            component="h2"
            sx={{
              fontWeight: 600,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: "80%",
            }}
          >
            {profile.name}, {profile.age}
          </Typography>
        </Box>

        {profile.bio && (
          <Typography
            variant="body2"
            sx={{
              opacity: 0.9,
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {profile.bio}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
