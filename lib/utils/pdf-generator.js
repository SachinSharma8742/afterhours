import jsPDF from "jspdf";
import QRCode from "qrcode";
import { generateSignedQRPayload } from "../security/qr-crypto";

/**
 * Helper to extract or generate valid QR payload
 */
function getValidQRPayload(ticket) {
  if (ticket?.qr_code?.qr_payload) return ticket.qr_code.qr_payload;
  const ticketId = ticket?.id || ticket?.ticket_number || `TCK-${Date.now()}`;
  return generateSignedQRPayload({ ticketId }).qrPayload;
}

/**
 * Generates a high-resolution PDF ticket pass for download
 * @param {Object} ticket - Ticket data object
 * @param {Object} event - Event data object
 */
export async function downloadTicketPDF(ticket, event) {
  try {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // Dark sleek theme background
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, 210, 297, "F");

    // Header Card container
    doc.setFillColor(30, 41, 59); // slate-800
    doc.roundedRect(15, 15, 180, 267, 4, 4, "F");

    // Header Branding
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(168, 85, 247); // violet-500
    doc.text("AFTERHOURS", 25, 25);

    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.setFont("helvetica", "normal");
    doc.text("OFFICIAL DIGITAL EVENT PASS", 25, 32);

    // Divider
    doc.setDrawColor(51, 65, 85);
    doc.line(25, 38, 185, 38);

    // Event Info Block
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text(event?.title || ticket?.event_title || "AfterHours Special Event", 25, 50);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(203, 213, 225);
    doc.text(`Venue: ${event?.venue_name || ticket?.venue_name || "The Royal Palm, Jaipur"}`, 25, 58);
    doc.text(`Date: ${event?.start_date ? new Date(event.start_date).toLocaleDateString() : "Upcoming Event"}`, 25, 65);

    // Divider
    doc.setDrawColor(51, 65, 85);
    doc.line(25, 90, 185, 90);

    // QR Code Box Container
    doc.setFillColor(15, 23, 42);
    doc.roundedRect(65, 100, 80, 80, 4, 4, "F");

    // Generate QR Image data
    const qrData = getValidQRPayload(ticket);
    const qrDataUrl = await QRCode.toDataURL(qrData, {
      errorCorrectionLevel: "H",
      margin: 1,
      width: 300,
    });

    // Embed QR image into PDF
    doc.addImage(qrDataUrl, "PNG", 70, 105, 70, 70);

    // Ticket Details Table
    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184);
    doc.text("ATTENDEE NAME", 25, 195);
    doc.text("TICKET CODE", 110, 195);

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text(ticket?.attendee_name || "John Doe", 25, 202);
    doc.text(ticket?.ticket_number || "TCK-8829-9910", 110, 202);

    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184);
    doc.setFont("helvetica", "normal");
    doc.text("TICKET TYPE", 25, 215);

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text(ticket?.ticket_type_name || "General Admission", 25, 222);

    // Security Footer Notice
    doc.setDrawColor(51, 65, 85);
    doc.line(25, 235, 185, 235);

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text("SECURITY NOTICE: This e-ticket contains a cryptographically signed HMAC signature. Unintended duplication, tampering, or resale is prohibited.", 25, 243, { maxWidth: 160 });
    doc.text("Present this QR code on your mobile device or printed sheet at the entry gate scanner.", 25, 250);

    // Save PDF
    const filename = `Ticket_${ticket?.ticket_number || "Pass"}.pdf`;
    doc.save(filename);
    return true;
  } catch (err) {
    console.error("Failed to generate PDF ticket:", err);
    throw err;
  }
}

/**
 * Downloads a high-resolution PNG image of the unique QR code
 * @param {Object} ticket - Ticket data object
 */
export async function downloadQRImage(ticket) {
  try {
    const qrData = getValidQRPayload(ticket);
    const qrDataUrl = await QRCode.toDataURL(qrData, {
      errorCorrectionLevel: "H",
      margin: 2,
      width: 800, // High resolution for mobile saving
    });

    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `QR_Pass_${ticket?.ticket_number || "Pass"}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    return true;
  } catch (err) {
    console.error("Failed to generate QR image:", err);
    throw err;
  }
}

