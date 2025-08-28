"use client";

import { Container, Box, Typography, IconButton } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import MatchesList from "@/components/MatchesList";

export default function MatchesPage() {
  const router = useRouter();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        py: 3,
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            mb: 4,
            p: 2,
            borderRadius: 3,
            bgcolor: "rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
          }}
        >
          <IconButton
            onClick={() => router.back()}
            sx={{
              mr: 2,
              bgcolor: "rgba(255, 255, 255, 0.2)",
              color: "white",
              "&:hover": { bgcolor: "rgba(255, 255, 255, 0.3)" },
            }}
          >
            <ArrowBack />
          </IconButton>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              color: "white",
              fontWeight: 700,
              textShadow: "0 2px 4px rgba(0,0,0,0.3)",
            }}
          >
            Your Matches
          </Typography>
        </Box>

        <MatchesList />
      </Container>
    </Box>
  );
}
