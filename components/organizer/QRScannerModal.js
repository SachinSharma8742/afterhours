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
  const [manualCode, setManualCode] = useState("");
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

    try {
      const html5QrCode = new Html5Qrcode("qr-reader");
      html5QrCodeRef.current = html5QrCode;

      const config = {
        fps: 20,
        qrbox: { width: 260, height: 260 },
        aspectRatio: 1.0,
      };

      await html5QrCode.start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          processScan(decodedText);
        },
        () => {}
      );
      setCameraActive(true);
    } catch (err) {
      console.warn("Primary environment camera failed, trying fallback...", err);
      try {
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length > 0) {
          const cameraId = devices[devices.length - 1].id;
          await html5QrCodeRef.current.start(
            cameraId,
            { fps: 20, qrbox: { width: 260, height: 260 } },
            (decodedText) => {
              processScan(decodedText);
            },
            () => {}
          );
          setCameraActive(true);
        } else {
          setCameraError("No camera devices detected. Use manual code verification below.");
        }
      } catch (fallbackErr) {
        console.error("Camera access error:", fallbackErr);
        setCameraError(fallbackErr.message || "Camera permission denied or unsupported context.");
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

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    processScan(manualCode.trim());
    setManualCode("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/40 flex items-center justify-center text-violet-400">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Live Gate Ticket Scanner
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-violet-500/20 text-violet-300 border border-violet-500/40 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-400 animate-pulse" /> 25 FPS Instant Auto-Fetch
                </span>
              </h3>
              <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                <span className="flex items-center gap-1">
                  {isOnline ? (
                    <span className="text-emerald-400 flex items-center gap-1 font-mono">
                      <Wifi className="w-3.5 h-3.5" /> Online Mode
                    </span>
                  ) : (
                    <span className="text-amber-400 flex items-center gap-1 font-mono">
                      <WifiOff className="w-3.5 h-3.5" /> Offline Mode ({pendingScans.length} queued)
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
              title="Toggle Audio Feedback"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 overflow-y-auto">
          {/* Left Column: UPI-Style Viewfinder */}
          <div className="flex flex-col gap-4">
            {!isSecureContext && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-200 leading-relaxed">
                ⚠️ <strong>iOS Safari Notice:</strong> Apple Safari blocks camera stream over unencrypted <code>http://</code> IPs. Access via <strong>https://</strong> or <strong>localhost</strong>, or use manual code entry.
              </div>
            )}

            {cameraError && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-200 flex flex-col gap-2">
                <span>⚠️ {cameraError}</span>
                <Button variant="secondary" size="sm" onClick={startCameraEngine} className="w-full">
                  Retry Camera Access
                </Button>
              </div>
            )}

            <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 p-2 min-h-[310px] flex items-center justify-center shadow-inner">
              <div id="qr-reader" className="w-full text-slate-200" />

              {/* UPI Style Animated Targeting Reticle & Laser */}
              {cameraActive && !scanResult && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="relative w-64 h-64 border-2 border-violet-500/40 rounded-2xl shadow-[0_0_25px_rgba(139,92,246,0.3)] overflow-hidden">
                    {/* Glowing Laser Scan Line */}
                    <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-fuchsia-400 to-transparent shadow-[0_0_15px_#d946ef] animate-[pulse_1.5s_infinite]" />
                    
                    {/* Target Corners */}
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-violet-400 rounded-tl-lg" />
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-violet-400 rounded-tr-lg" />
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-violet-400 rounded-bl-lg" />
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-violet-400 rounded-br-lg" />
                  </div>
                </div>
              )}
            </div>

            {/* Manual Code Input Fallback */}
            <form onSubmit={handleManualSubmit} className="flex gap-2">
              <input
                type="text"
                placeholder="Or paste QR payload / ticket code..."
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500"
              />
              <Button type="submit" variant="secondary" size="sm">
                Verify
              </Button>
            </form>
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
                    <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-black/40 border border-white/10">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">Attendee Name</span>
                        <p className="font-bold text-white text-sm mt-0.5">{scanResult.data.attendeeName}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">Ticket Code</span>
                        <p className="font-bold text-violet-400 text-sm font-mono mt-0.5">{scanResult.data.ticketNumber || scanResult.data.ticketId}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">Pass Tier</span>
                        <p className="font-bold text-slate-200 mt-0.5">{scanResult.data.ticketType || "General Admission"}</p>
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
