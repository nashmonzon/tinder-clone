"use client";

import type React from "react";
import { Component, type ReactNode } from "react";
import { Box, Typography, Button, Card, CardContent } from "@mui/material";
import { ErrorOutline, Refresh } from "@mui/icons-material";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error to monitoring service in production
    if (process.env.NODE_ENV === "production") {
      console.error("Error caught by boundary:", error, errorInfo);
      // Here you would send to error reporting service like Sentry
      // reportError(error, errorInfo)
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "50vh",
            p: 3,
          }}
        >
          <Card sx={{ maxWidth: 500, textAlign: "center" }}>
            <CardContent sx={{ p: 4 }}>
              <ErrorOutline sx={{ fontSize: 64, color: "error.main", mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                Oops! Something went wrong
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                We&apos;re sorry for the inconvenience. The app encountered an
                unexpected error.
              </Typography>

              {process.env.NODE_ENV === "development" && this.state.error && (
                <Box sx={{ mb: 3, textAlign: "left" }}>
                  <Typography variant="subtitle2" color="error" gutterBottom>
                    Error Details (Development Only):
                  </Typography>
                  <Typography
                    variant="caption"
                    component="pre"
                    sx={{
                      bgcolor: "grey.100",
                      p: 2,
                      borderRadius: 1,
                      overflow: "auto",
                      maxHeight: 200,
                      fontSize: "0.75rem",
                    }}
                  >
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </Typography>
                </Box>
              )}

              <Button
                variant="contained"
                startIcon={<Refresh />}
                onClick={this.handleReset}
                sx={{ mr: 2 }}
              >
                Try Again
              </Button>
              <Button
                variant="outlined"
                onClick={() => window.location.reload()}
              >
                Reload Page
              </Button>
            </CardContent>
          </Card>
        </Box>
      );
    }

    return this.props.children;
  }
}
