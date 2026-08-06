"use client";

import { useState, useEffect } from "react";
import { validateScannedQR } from "../lib/services/qr-service";

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingScans, setPendingScans] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // Check initial status
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      syncPendingScans();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Load initial queue
    loadQueue();

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const loadQueue = () => {
    try {
      const stored = localStorage.getItem("afterhours_offline_scan_queue");
      if (stored) {
        setPendingScans(JSON.parse(stored));
      }
    } catch (err) {
      console.warn("Queue load warning:", err);
    }
  };

  const queueScan = (scanData) => {
    const scanItem = {
      id: `queue-${Date.now()}-${Math.random()}`,
      payload: scanData.payload,
      scannedAt: new Date().toISOString(),
      eventId: scanData.eventId,
    };

    const updated = [...pendingScans, scanItem];
    setPendingScans(updated);
    try {
      localStorage.setItem("afterhours_offline_scan_queue", JSON.stringify(updated));
    } catch (err) {
      console.warn("Queue save error:", err);
    }
    return scanItem;
  };

  const syncPendingScans = async () => {
    const stored = localStorage.getItem("afterhours_offline_scan_queue");
    if (!stored) return;

    const queue = JSON.parse(stored);
    if (!queue || queue.length === 0) return;

    setIsSyncing(true);

    for (const scan of queue) {
      try {
        await validateScannedQR(scan.payload, "org-offline-scanner", scan.eventId);
      } catch (err) {
        console.error("Sync item error:", err);
      }
    }

    // Clear queue after sync
    localStorage.removeItem("afterhours_offline_scan_queue");
    setPendingScans([]);
    setIsSyncing(false);
  };

  return {
    isOnline,
    pendingScans,
    isSyncing,
    queueScan,
    syncPendingScans,
  };
}
