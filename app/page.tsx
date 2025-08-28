"use client";

import { Container, Typography, Box } from "@mui/material";
import SwipeInterface from "@/components/SwipeInterface";

export default function HomePage() {
  return (
    <Box
      sx={{
        height: "100%",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        backgroundAttachment: "fixed",
        position: "relative",
        overflow: "auto",
        "&::before": {
          content: '""',
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            "linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
          backdropFilter: "blur(10px)",
          zIndex: 0,
        },
      }}
    >
      <Container
        maxWidth="sm"
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          zIndex: 1,
          py: 2,
        }}
      >
        <Box
          sx={{
            py: 3,
            textAlign: "center",
            background: "rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(20px)",
            borderRadius: "20px",
            margin: "20px 0",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
          }}
        >
          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontWeight: 700,
              background: "linear-gradient(45deg, #fff 30%, #f8f9fa 90%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textShadow: "0 2px 4px rgba(0,0,0,0.1)",
              letterSpacing: "-0.02em",
            }}
          >
            Tinder Clone
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "rgba(255, 255, 255, 0.8)",
              mt: 1,
              fontWeight: 300,
            }}
          >
            Find your perfect match
          </Typography>
        </Box>

        <Box
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "calc(100vh - 200px)",
            pb: 3,
          }}
        >
          <SwipeInterface />
        </Box>
      </Container>
    </Box>
  );
}
