"use client";

import { useState, useEffect } from "react";
import { Alert, Snackbar } from "@mui/material";
import { WifiOff, Wifi } from "@mui/icons-material";

export default function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [showOfflineAlert, setShowOfflineAlert] = useState(false);
  const [showOnlineAlert, setShowOnlineAlert] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOnlineAlert(true);
      setShowOfflineAlert(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineAlert(true);
      setShowOnlineAlert(false);
    };

    // Set initial state
    setIsOnline(navigator.onLine);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <>
      <Snackbar
        open={showOfflineAlert}
        onClose={() => setShowOfflineAlert(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity="warning"
          icon={<WifiOff />}
          onClose={() => setShowOfflineAlert(false)}
        >
          You&apos;re offline. Some features may not work properly.
        </Alert>
      </Snackbar>

      <Snackbar
        open={showOnlineAlert}
        autoHideDuration={3000}
        onClose={() => setShowOnlineAlert(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity="success"
          icon={<Wifi />}
          onClose={() => setShowOnlineAlert(false)}
        >
          You&apos;re back online!
        </Alert>
      </Snackbar>
    </>
  );
}
