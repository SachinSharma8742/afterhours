import { useState } from "react";
import { Download, Calendar, MapPin, Ticket, ShieldCheck, Image as ImageIcon, AlertTriangle, XCircle, User, CheckCircle2 } from "lucide-react";
import { generateSignedQRPayload } from "../../lib/security/qr-crypto";
import { downloadTicketPDF, downloadQRImage } from "../../lib/utils/pdf-generator";
import { useToast } from "../../hooks/use-toast";
import { formatDate } from "../../lib/utils/formatters";

export default function TicketPassCard({ ticket, event }) {
  const { toast } = useToast();
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [downloadingImage, setDownloadingImage] = useState(false);

  const isUsed = ticket?.status === "used" || ticket?.status === "expired";

  // Always compute valid cryptographic HMAC payload
  const validQRPayload =
    ticket?.qr_code?.qr_payload ||
    generateSignedQRPayload({
      ticketId: ticket?.id || ticket?.ticket_number || `TCK-${Date.now()}`,
      eventId: event?.id || ticket?.event_id || "afterhours-event",
    }).qrPayload;

  const qrImageUrl =
    ticket?.qr_code?.qr_image_url ||
    `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(validQRPayload)}`;

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
    <div className={`rounded-3xl overflow-hidden border-2 transition-all font-montserrat ${
      isUsed
        ? "bg-black border-red-600/80 shadow-[0_0_40px_rgba(200,16,46,0.5)]"
        : "bg-black border-[#c8102e] shadow-[0_0_40px_rgba(200,16,46,0.35)]"
    }`}>
      {/* Event Header Banner */}
      <div className="relative h-44 w-full bg-[#0a0a0a]">
        <img
          src={event?.banner_url || "/images/event.jpeg"}
          alt="Event Header"
          className="w-full h-full object-cover brightness-65"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        
        {/* Pass Status Badge */}
        <div className="absolute top-4 right-4">
          {isUsed ? (
            <span className="px-3 py-1.5 rounded-full text-[10px] font-black bg-[#c8102e] text-white border border-red-400 uppercase tracking-widest shadow-lg animate-pulse flex items-center gap-1.5 font-mono">
              <XCircle className="w-3.5 h-3.5 text-white" /> EXPIRED / ENTERED
            </span>
          ) : (
            <span className="px-3 py-1.5 rounded-full text-[10px] font-black bg-[#0a200f] text-emerald-300 border border-emerald-600 uppercase tracking-widest shadow-lg flex items-center gap-1.5 font-mono">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> OFFICIAL GATE PASS
            </span>
          )}
        </div>

        {/* Event Title Header */}
        <div className="absolute bottom-3 left-5 right-5">
          <span className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#c8102e] font-mono">
            AFTERHOURS PASS
          </span>
          <h3 className="font-bebas text-3xl sm:text-4xl text-white leading-none tracking-wider uppercase drop-shadow-md">
            {event?.title || "AfterHours VIP Event"}
          </h3>
        </div>
      </div>

      {/* Pass Body Content */}
      <div className="p-5 sm:p-7 flex flex-col gap-5 bg-black grid-lines-bg">
        
        {/* Date & Location Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-[#0d0d0d] border border-[#22050b] text-xs font-mono">
          <div className="flex items-center gap-2 text-gray-300">
            <Calendar className="w-4 h-4 text-[#c8102e] shrink-0" />
            <span className="font-semibold">{formatDate(event?.start_date || new Date())}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <MapPin className="w-4 h-4 text-[#c8102e] shrink-0" />
            <span className="truncate font-semibold">{event?.venue_name || "Jaipur Venue"}, {event?.city || "Jaipur"}</span>
          </div>
        </div>

        {/* Safety Tip / Expired Callout */}
        {isUsed ? (
          <div className="p-4 rounded-xl bg-[#1a0006] border border-[#c8102e] flex items-start gap-3 text-xs text-rose-200">
            <XCircle className="w-5 h-5 text-[#c8102e] shrink-0 mt-0.5" />
            <div className="flex flex-col gap-0.5">
              <span className="font-extrabold text-sm text-white uppercase tracking-wider">
                ⛔ ENTRY ALREADY MARKED
              </span>
              <p className="text-[11px] text-gray-300 leading-relaxed">
                Scanned on <strong>{ticket?.scanned_at ? new Date(ticket.scanned_at).toLocaleString() : "Gate Scanner"}</strong>. This one-time security pass is permanently invalidated.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-3.5 rounded-xl bg-[#0f0507] border border-[#c8102e]/40 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-[11px] font-bold text-gray-300 uppercase tracking-wider">Pass Type</span>
            </div>
            <span className="px-3 py-1 rounded-lg text-xs font-extrabold uppercase tracking-wider bg-[#c8102e] text-white border border-[#e01838] shadow-[0_0_15px_rgba(200,16,46,0.5)]">
              {ticket?.ticket_type_name || "General Admission"}
            </span>
          </div>
        )}

        {/* MAXIMIZED QR CODE CONTAINER */}
        <div className="flex flex-col items-center justify-center p-4 sm:p-6 rounded-2xl bg-[#070707] border-2 border-[#c8102e]/60 text-center gap-3 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]">
          {isUsed ? (
            <div className="relative w-full py-10 px-6 rounded-xl bg-[#160002] border border-[#c8102e] flex flex-col items-center justify-center text-center gap-3">
              <div className="w-16 h-16 rounded-full bg-[#6e0008] border-2 border-[#c8102e] flex items-center justify-center text-white shadow-lg">
                <XCircle className="w-10 h-10 text-white animate-pulse" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-bebas text-2xl text-white tracking-widest uppercase">
                  PASS INVALIDATED
                </span>
                <span className="text-[11px] font-mono text-gray-400">
                  Entry Recorded: {ticket?.scanned_at ? new Date(ticket.scanned_at).toLocaleString() : "Gate Scanner"}
                </span>
              </div>
            </div>
          ) : (
            <div className="w-full flex items-center justify-center">
              {/* Ultra High-Contrast Max-Size QR Wrapper */}
              <div className="relative w-full max-w-[340px] aspect-square p-3 sm:p-4 rounded-2xl bg-white shadow-[0_0_30px_rgba(255,255,255,0.25)] border-4 border-[#c8102e] flex items-center justify-center transition-all hover:scale-[1.01]">
                <img
                  src={qrImageUrl}
                  alt="Official QR Pass"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          )}

          <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider pt-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{isUsed ? "Status: Checked In & Security Locked" : "Cryptographically Signed Gate Pass"}</span>
          </div>
        </div>

        {/* Ticket Metadata Grid */}
        <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-[#0d0d0d] border border-[#22050b] text-xs font-mono">
          <div>
            <span className="text-gray-500 uppercase font-bold text-[9px] tracking-wider flex items-center gap-1">
              <User className="w-3 h-3 text-[#c8102e]" /> Attendee
            </span>
            <p className="font-extrabold text-white truncate mt-0.5 text-sm">{ticket?.attendee_name || "Guest Attendee"}</p>
          </div>
          <div>
            <span className="text-gray-500 uppercase font-bold text-[9px] tracking-wider flex items-center gap-1">
              <Ticket className="w-3 h-3 text-[#c8102e]" /> Ticket Code
            </span>
            <p className="font-extrabold text-[#c8102e] font-mono mt-0.5 text-sm truncate">{ticket?.ticket_number || "TCK-8890"}</p>
          </div>
        </div>

        {/* Download Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <button
            onClick={handleDownloadPDF}
            disabled={downloadingPDF}
            className="btn-sharp-red py-3.5 px-4 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 w-full disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{downloadingPDF ? "COMPILING PDF..." : "DOWNLOAD PDF PASS"}</span>
          </button>

          <button
            onClick={handleDownloadQRImage}
            disabled={downloadingImage}
            className="bg-black hover:bg-[#160002] border border-[#c8102e]/60 hover:border-[#c8102e] text-white py-3.5 px-4 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 w-full transition-colors disabled:opacity-50"
          >
            <ImageIcon className="w-4 h-4 text-[#c8102e]" />
            <span>{downloadingImage ? "SAVING..." : "SAVE QR IMAGE (PNG)"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}


