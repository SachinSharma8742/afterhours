"use client";

import { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import {
  CheckCircle2,
  AlertOctagon,
  QrCode,
  Zap,
  RotateCcw,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  History,
  X,
  Smartphone,
  Sparkles,
} from "lucide-react";
import Button from "../ui/Button";
import { verifyScannedQROnly, markTicketAsEntered } from "../../lib/services/qr-service";
import { useOfflineSync } from "../../hooks/use-offline-sync";

export default function QRScannerModal({ isOpen, onClose, targetEventId = null }) {
  const [scanResult, setScanResult] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);

  const [isEntryMarked, setIsEntryMarked] = useState(false);
  const [isMarking, setIsMarking] = useState(false);

  const html5QrCodeRef = useRef(null);
  const lastScannedRef = useRef(null);
  const { isOnline, pendingScans, queueScan } = useOfflineSync();

  const [cameraError, setCameraError] = useState(null);
  const [isSecureContext, setIsSecureContext] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isSecure = window.location.protocol === "https:" || window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
      setIsSecureContext(isSecure);
    }
  }, []);

  const stopCamera = async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        html5QrCodeRef.current.clear();
      } catch (e) {
        console.warn("Camera stop warning:", e);
      }
      html5QrCodeRef.current = null;
    }
    setCameraActive(false);
  };

  const startCameraEngine = async () => {
    setCameraError(null);

    if (html5QrCodeRef.current) {
      await stopCamera();
    }

    // Wait a tick for the DOM element to be ready after collapse/expand
    await new Promise((r) => setTimeout(r, 80));

    try {
      const html5QrCode = new Html5Qrcode("qr-reader");
      html5QrCodeRef.current = html5QrCode;

      const config = {
        fps: 30,
        // qrbox as a function: 80% of the smaller dimension — scales perfectly on any device
        qrbox: (viewfinderWidth, viewfinderHeight) => {
          const minDim = Math.min(viewfinderWidth, viewfinderHeight);
          const size = Math.floor(minDim * 0.8);
          return { width: size, height: size };
        },
        // No aspectRatio constraint — let the camera fill naturally to avoid distortion
        rememberLastUsedCamera: true,
        // Enable native BarcodeDetector API for wide-angle, tilted & distant QR reading
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: true,
        },
      };

      await html5QrCode.start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          processScan(decodedText);
        },
        () => {} // suppress frame-level errors
      );
      setCameraActive(true);
    } catch (err) {
      console.warn("Primary environment camera failed, trying fallback...", err);
      try {
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length > 0) {
          // Pick the last device — usually the rear/environment camera
          const cameraId = devices[devices.length - 1].id;
          const html5QrCode = new Html5Qrcode("qr-reader");
          html5QrCodeRef.current = html5QrCode;
          await html5QrCode.start(
            cameraId,
            {
              fps: 30,
              qrbox: (w, h) => { const s = Math.floor(Math.min(w, h) * 0.8); return { width: s, height: s }; },
              experimentalFeatures: { useBarCodeDetectorIfSupported: true },
            },
            (decodedText) => {
              processScan(decodedText);
            },
            () => {}
          );
          setCameraActive(true);
        } else {
          setCameraError("No camera devices detected.");
        }
      } catch (fallbackErr) {
        console.error("Camera access error:", fallbackErr);
        setCameraError(fallbackErr.message || "Camera permission denied or unavailable.");
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        startCameraEngine();
      }, 300);
      return () => {
        clearTimeout(timer);
        stopCamera();
      };
    } else {
      stopCamera();
      resetScannerState();
    }
  }, [isOpen]);

  const triggerFeedback = (isSuccess) => {
    if (!soundEnabled) return;
    if (typeof window !== "undefined") {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          const ctx = new AudioContext();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);

          if (isSuccess) {
            osc.frequency.setValueAtTime(587.33, ctx.currentTime);
            osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1);
            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
          } else {
            osc.frequency.setValueAtTime(220, ctx.currentTime);
            osc.frequency.setValueAtTime(164.81, ctx.currentTime + 0.15);
            gain.gain.setValueAtTime(0.4, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
          }

          osc.start();
          osc.stop(ctx.currentTime + 0.4);
        }
      } catch (e) {}
    }
  };

  const processScan = async (decodedText) => {
    if (!decodedText || isProcessing) return;
    if (lastScannedRef.current === decodedText) return;

    lastScannedRef.current = decodedText;
    setIsProcessing(true);
    setIsEntryMarked(false);

    // ✅ Stop camera immediately — like UPI apps — as soon as QR is read
    await stopCamera();

    let res;
    if (!isOnline) {
      queueScan({ payload: decodedText, eventId: targetEventId });
      res = {
        success: true,
        code: "OFFLINE_QUEUED",
        message: "Offline Scan Saved to Queue! Will sync when reconnected.",
        data: { attendeeName: "Offline Guest", scannedAt: new Date().toLocaleTimeString() },
      };
    } else {
      res = await verifyScannedQROnly(decodedText, targetEventId);
    }

    setScanResult(res);
    triggerFeedback(res.success);
    setIsProcessing(false);

    setScanHistory((prev) => [
      {
        id: `h-${Date.now()}`,
        time: new Date().toLocaleTimeString(),
        result: res,
        payload: decodedText,
      },
      ...prev.slice(0, 15),
    ]);
  };

  const handleConfirmEntry = async () => {
    if (!scanResult?.data || isMarking) return;
    setIsMarking(true);

    const res = await markTicketAsEntered(scanResult.data, "org-scanner-01");
    setIsMarking(false);

    if (res.success) {
      setIsEntryMarked(true);
      triggerFeedback(true);

      setScanHistory((prev) => [
        {
          id: `h-${Date.now()}`,
          time: new Date().toLocaleTimeString(),
          result: { ...scanResult, message: "ENTRY CONFIRMED & MARKED AS ENTERED" },
          payload: scanResult.data.qrPayload || scanResult.data.ticketId,
        },
        ...prev.slice(0, 15),
      ]);

      // Brief celebration delay, then auto-reset and restart camera for next attendee
      setTimeout(() => {
        resetScannerState(true);
      }, 1800);
    }
  };

  const resetScannerState = (restartCamera = false) => {
    lastScannedRef.current = null;
    setScanResult(null);
    setIsEntryMarked(false);
    setIsMarking(false);
    setIsProcessing(false);
    // Restart camera only when explicitly asked (after confirm/cancel by staff)
    if (restartCamera) {
      setTimeout(() => startCameraEngine(), 150);
    }
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/90 backdrop-blur-xl">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-2xl overflow-hidden max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-800 gap-2">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-violet-600/20 border border-violet-500/40 flex items-center justify-center text-violet-400 shrink-0">
              <QrCode className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-lg font-bold text-white flex items-center gap-1.5 sm:gap-2 flex-wrap truncate">
                Live Ticket Scanner
                <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-extrabold bg-violet-500/20 text-violet-300 border border-violet-500/40 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-400 animate-pulse" /> Instant Scan
                </span>
              </h3>
              <div className="flex items-center gap-2 text-[10px] sm:text-xs text-slate-400 mt-0.5">
                <span>
                  {isOnline ? (
                    <span className="text-emerald-400 flex items-center gap-1 font-mono">
                      <Wifi className="w-3 h-3" /> Online
                    </span>
                  ) : (
                    <span className="text-amber-400 flex items-center gap-1 font-mono">
                      <WifiOff className="w-3 h-3" /> Offline ({pendingScans.length})
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1.5 sm:p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
              title="Toggle Audio Feedback"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 pt-4 sm:pt-6 overflow-y-auto">
          {/* Left Column: UPI-Style Viewfinder */}
          <div className="flex flex-col gap-3 sm:gap-4">
            {!isSecureContext && (
              <div className="p-2.5 sm:p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[10px] sm:text-[11px] text-amber-200 leading-relaxed">
                ⚠️ <strong>iOS Safari Notice:</strong> Access via <strong>https://</strong> or <strong>localhost</strong> for camera stream.
              </div>
            )}

            {cameraError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-200 flex flex-col gap-2">
                <span>⚠️ {cameraError}</span>
                <Button variant="secondary" size="sm" onClick={startCameraEngine} className="w-full">
                  Retry Camera Access
                </Button>
              </div>
            )}

            {/* Camera Viewfinder — collapses when camera is off after a scan */}
            <div
              className={`relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-inner transition-all duration-300 ${
                cameraActive
                  ? "min-h-[260px] sm:min-h-[320px]"
                  : scanResult
                  ? "h-0 border-0 overflow-hidden"
                  : "min-h-[260px] sm:min-h-[320px] flex items-center justify-center"
              }`}
            >
              {/* html5-qrcode mounts the <video> element here — no padding so it fills flush */}
              <div id="qr-reader" className="w-full h-full" />

              {/* Idle placeholder before camera starts */}
              {!cameraActive && !scanResult && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-500">
                  <Smartphone className="w-8 h-8 text-violet-500 animate-pulse" />
                  <p className="text-xs font-semibold text-slate-400">Initialising camera...</p>
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Scan Result & History */}
          <div className="flex flex-col gap-4">
            {/* Live Scan Result Box */}
            {scanResult ? (
              <div
                className={`p-6 rounded-2xl border flex flex-col gap-4 transition-all animate-in zoom-in-95 duration-200 ${
                  scanResult.success
                    ? "bg-emerald-950/60 border-2 border-emerald-500 text-emerald-100 shadow-2xl shadow-emerald-950/80"
                    : "bg-rose-950/60 border-2 border-rose-600 text-rose-100 shadow-2xl shadow-rose-950/80"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {scanResult.success ? (
                      <CheckCircle2 className="w-9 h-9 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertOctagon className="w-9 h-9 text-rose-400 shrink-0 animate-bounce" />
                    )}
                    <div>
                      <h4 className="font-extrabold text-lg tracking-wide uppercase">
                        {isEntryMarked
                          ? "✓ ENTRY CONFIRMED"
                          : scanResult.success
                          ? "✓ PASS VERIFIED (READY)"
                          : "⛔ ENTRY DENIED"}
                      </h4>
                      <p className="text-xs font-semibold opacity-90">
                        {isEntryMarked
                          ? "Entry marked successfully & ticket pass invalidated."
                          : scanResult.message}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black uppercase font-mono tracking-wider shadow-md ${
                      isEntryMarked
                        ? "bg-emerald-500 text-slate-950 border border-emerald-300"
                        : scanResult.success
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400"
                        : "bg-rose-600 text-white border border-rose-400 animate-pulse"
                    }`}
                  >
                    {isEntryMarked
                      ? "ENTERED"
                      : scanResult.success
                      ? "VALID PASS"
                      : scanResult.code === "NOT_FOUND"
                      ? "NOT FOUND"
                      : scanResult.code === "INVALID_SIGNATURE"
                      ? "INVALID SIGNATURE"
                      : scanResult.code === "ALREADY_USED"
                      ? "ALREADY USED"
                      : "ENTRY DENIED"}
                  </span>
                </div>

                {scanResult.data && (
                  <div className="pt-4 border-t border-white/15 text-xs flex flex-col gap-3 font-mono">
                    {/* Pass Tier — full-width prominent badge so gate staff can see it instantly */}
                    <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-400/40">
                      <span className="text-[10px] text-amber-300 uppercase font-extrabold tracking-widest">Pass Type</span>
                      <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-amber-400/20 text-amber-200 border border-amber-400/50 shadow-sm">
                        {scanResult.data.ticketType || "General Admission"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-black/40 border border-white/10">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">Attendee Name</span>
                        <p className="font-bold text-white text-sm mt-0.5">{scanResult.data.attendeeName}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">Status / Time</span>
                        <p className="font-bold text-slate-200 mt-0.5">{isEntryMarked ? "Scanned & Marked" : scanResult.data.scannedAt || "Ready"}</p>
                      </div>
                    </div>
                  </div>
                )}

                {isEntryMarked ? (
                  <div className="w-full py-3.5 px-4 rounded-xl bg-emerald-600/30 border border-emerald-500/50 text-emerald-300 font-extrabold text-xs flex items-center justify-center gap-2 uppercase tracking-wider shadow-lg">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 animate-pulse" /> ENTRY MARKED SUCCESSFULLY!
                  </div>
                ) : scanResult.success ? (
                  <div className="flex flex-col gap-2 mt-2">
                    <button
                      type="button"
                      disabled={isMarking}
                      onClick={handleConfirmEntry}
                      className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-xl shadow-emerald-950/80 uppercase tracking-wider transition-all disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-5 h-5" /> {isMarking ? "MARKING AS ENTERED..." : "✓ CONFIRM & MARK AS ENTERED"}
                    </button>
                    <button
                      type="button"
                      onClick={() => resetScannerState(true)}
                      className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center gap-2 transition-all"
                    >
                      <RotateCcw className="w-4 h-4" /> Cancel / Scan Next Ticket
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => resetScannerState(true)}
                    className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-xl uppercase tracking-wider transition-all mt-2"
                  >
                    <RotateCcw className="w-4 h-4" /> SCAN NEXT TICKET
                  </button>
                )}
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-slate-950/40 border border-slate-800 border-dashed text-center flex flex-col items-center justify-center text-slate-400 gap-2 min-h-[220px]">
                <Smartphone className="w-8 h-8 text-violet-400 animate-bounce" />
                <p className="text-xs font-semibold text-white">Align QR Code inside viewfinder line</p>
                <p className="text-[11px] text-slate-500">25 FPS instant auto-fetch detector active...</p>
              </div>
            )}

            {/* Scan History Feed */}
            <div className="flex-1 bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                <History className="w-4 h-4 text-violet-400" /> Live Gate Log ({scanHistory.length})
              </h4>
              <div className="flex flex-col gap-2 max-h-44 overflow-y-auto pr-1">
                {scanHistory.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4 text-center">No scans recorded in this session yet.</p>
                ) : (
                  scanHistory.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className={`w-2 h-2 rounded-full ${item.result.success ? "bg-emerald-400" : "bg-rose-400"}`} />
                        <span className="font-semibold text-slate-200">{item.result.data?.attendeeName || "Guest"}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">{item.time}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
