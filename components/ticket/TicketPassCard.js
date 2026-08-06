import { useState } from "react";
import { Download, QrCode, Calendar, MapPin, Ticket, ShieldCheck, Image as ImageIcon, AlertTriangle, XCircle } from "lucide-react";
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import { generateSignedQRPayload } from "../../lib/security/qr-crypto";
import { downloadTicketPDF, downloadQRImage } from "../../lib/utils/pdf-generator";
import { useToast } from "../../hooks/use-toast";
import { formatDate } from "../../lib/utils/formatters";

export default function TicketPassCard({ ticket, event }) {
  const { toast } = useToast();
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [downloadingImage, setDownloadingImage] = useState(false);

  const isUsed = ticket.status === "used" || ticket.status === "expired";

  // Always compute valid cryptographic HMAC payload — NEVER fall back to "DEMO"
  const validQRPayload =
    ticket.qr_code?.qr_payload ||
    generateSignedQRPayload({
      ticketId: ticket.id || ticket.ticket_number || `TCK-${Date.now()}`,
      eventId: event?.id || ticket.event_id || "afterhours-event",
    }).qrPayload;

  const qrImageUrl =
    ticket.qr_code?.qr_image_url ||
    `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(validQRPayload)}`;

  const handleDownloadPDF = async () => {
    setDownloadingPDF(true);
    try {
      await downloadTicketPDF(ticket, event);
      toast({
        title: "E-Ticket PDF Downloaded",
        description: "Your official ticket pass PDF has been saved.",
        type: "success"
      });
    } catch (err) {
      toast({
        title: "Download Failed",
        description: "Unable to compile PDF. Please try again.",
        type: "error"
      });
    } finally {
      setDownloadingPDF(false);
    }
  };

  const handleDownloadQRImage = async () => {
    setDownloadingImage(true);
    try {
      await downloadQRImage(ticket);
      toast({
        title: "QR Image Saved",
        description: "Unique QR Pass image (PNG) saved to your device gallery.",
        type: "success"
      });
    } catch (err) {
      toast({
        title: "Download Failed",
        description: "Unable to download image. Try right-clicking the QR code to save.",
        type: "error"
      });
    } finally {
      setDownloadingImage(false);
    }
  };

  return (
    <div className={`rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl max-w-2xl mx-auto transition-all ${
      isUsed ? "bg-rose-950/30 border-2 border-rose-600/80 shadow-[0_0_40px_rgba(225,29,72,0.4)]" : "bg-slate-900 border border-slate-800"
    }`}>
      {/* Event Header Banner */}
      <div className="relative h-44 w-full bg-slate-950">
        <img
          src={event?.banner_url || "/images/event.jpeg"}
          alt="Event Header"
          className="w-full h-full object-cover brightness-75"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
        <div className="absolute top-4 right-4">
          {isUsed ? (
            <span className="px-3.5 py-1 rounded-full text-xs font-black bg-rose-600 text-white border border-rose-400 uppercase tracking-widest shadow-lg shadow-rose-950/90 animate-pulse flex items-center gap-1.5">
              <XCircle className="w-4 h-4 text-white" /> 🔴 INVALID / EXPIRED (ENTERED)
            </span>
          ) : (
            <Badge variant="violet">VALID PASS</Badge>
          )}
        </div>
        <div className="absolute bottom-4 left-6 right-6">
          <h3 className="text-xl font-bold text-white tracking-tight">{event?.title || "AfterHours VIP Event"}</h3>
        </div>
      </div>

      {/* Pass Body */}
      <div className="p-6 sm:p-8 flex flex-col gap-6">
        {/* Date & Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-6 border-b border-slate-800/80 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Calendar className="w-4 h-4 text-violet-400 shrink-0" />
            <span>{formatDate(event?.start_date || new Date())}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <MapPin className="w-4 h-4 text-fuchsia-400 shrink-0" />
            <span className="truncate">{event?.venue_name || "Brooklyn Terminal"}, {event?.city || "New York"}</span>
          </div>
        </div>

        {/* Safety / Expired Callout Box */}
        {isUsed ? (
          <div className="p-4.5 rounded-2xl bg-rose-950/90 border-2 border-rose-600 flex items-start gap-3 text-xs text-rose-100 shadow-xl">
            <XCircle className="w-6 h-6 text-rose-400 shrink-0 mt-0.5 animate-pulse" />
            <div className="flex flex-col gap-1">
              <span className="font-extrabold text-sm text-rose-300 tracking-wide uppercase">
                ⛔ ONE-TIME PASS INVALIDATED & ENTERED
              </span>
              <p className="text-xs text-rose-200/90 leading-relaxed font-semibold">
                This ticket pass was scanned and marked <strong>ENTERED</strong> at the venue entrance gate on <strong>{ticket.scanned_at ? new Date(ticket.scanned_at).toLocaleString() : "Gate Scanner"}</strong>. It is permanently <strong>EXPIRED & INVALID</strong> for one-time security protection.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs text-amber-200">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-0.5">
              <span className="font-bold text-amber-300">Important Safety Tip:</span>
              <p className="text-[11px] text-amber-200/90 leading-relaxed">
                Please download both the <strong>PDF Pass</strong> and <strong>QR Image (PNG)</strong> to your device. Keep them saved offline so you can easily enter the venue even without mobile internet!
              </p>
            </div>
          </div>
        )}

        {/* Signed QR Code Display / Expired Stamp */}
        <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-950 border border-slate-800 text-center gap-3">
          {isUsed ? (
            <div className="relative w-full p-8 rounded-2xl bg-rose-950/40 border-2 border-rose-600/80 flex flex-col items-center justify-center text-center gap-3 shadow-2xl">
              <div className="w-20 h-20 rounded-full bg-rose-600/30 border-2 border-rose-500 flex items-center justify-center text-rose-400 shadow-inner">
                <XCircle className="w-12 h-12 text-rose-500 animate-pulse" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xl font-black text-rose-400 tracking-widest uppercase">
                  ⛔ INVALID / ENTRY ALREADY MARKED
                </span>
                <span className="text-xs font-mono text-rose-300/80">
                  Checked In: {ticket.scanned_at ? new Date(ticket.scanned_at).toLocaleString() : "Gate Scanner #1"}
                </span>
              </div>
              <span className="px-4 py-1.5 rounded-full text-xs font-mono font-black bg-rose-600 text-white uppercase tracking-widest border border-rose-400 shadow-md">
                ONE-TIME USE EXPIRED
              </span>
            </div>
          ) : (
            <div className="relative p-3 rounded-2xl bg-white shadow-xl shadow-violet-950/40 overflow-hidden">
              <img
                src={qrImageUrl}
                alt="Signed QR Pass"
                className="w-48 h-48 object-contain"
              />
            </div>
          )}

          <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{isUsed ? "Status: Checked In & Security Invalidated" : "HMAC-SHA256 Encrypted & Signed"}</span>
          </div>
        </div>

        {/* Ticket Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-xs">
          <div>
            <span className="text-slate-500 uppercase font-semibold text-[10px]">Attendee Name</span>
            <p className="font-bold text-slate-100 mt-0.5">{ticket.attendee_name || "John Doe"}</p>
          </div>
          <div>
            <span className="text-slate-500 uppercase font-semibold text-[10px]">Ticket Number</span>
            <p className="font-bold text-violet-400 font-mono mt-0.5">{ticket.ticket_number || "TCK-8890"}</p>
          </div>
          <div>
            <span className="text-slate-500 uppercase font-semibold text-[10px]">Status</span>
            <p className={`font-bold mt-0.5 ${ticket.status === "used" ? "text-rose-400" : "text-emerald-400"}`}>
              {ticket.status === "used" ? "EXPIRED (USED)" : "VALID"}
            </p>
          </div>
        </div>

        {/* Download Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <Button
            variant="glow"
            size="md"
            isLoading={downloadingPDF}
            onClick={handleDownloadPDF}
            className="w-full"
          >
            <Download className="w-4 h-4" />
            Download PDF Pass
          </Button>

          <Button
            variant="secondary"
            size="md"
            isLoading={downloadingImage}
            onClick={handleDownloadQRImage}
            className="w-full bg-slate-800 hover:bg-slate-700 text-white"
          >
            <ImageIcon className="w-4 h-4 text-violet-400" />
            Save QR Image (PNG)
          </Button>
        </div>
      </div>
    </div>
  );
}

