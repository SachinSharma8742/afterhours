/**
 * Formats a number to INR currency format (₹)
 * @param {number} amount 
 * @returns {string}
 */
export function formatCurrency(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Formats date string to human readable format
 * @param {string|Date} date 
 * @param {boolean} includeTime 
 * @returns {string}
 */
export function formatDate(date, includeTime = true) {
  if (!date) return "";
  const cleanDate = typeof date === "string" ? date.replace(" ", "T") : date;
  const d = new Date(cleanDate);
  if (isNaN(d.getTime())) return typeof date === "string" ? date : "";

  const options = {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    ...(includeTime ? { hour: "numeric", minute: "2-digit", hour12: true } : {}),
  };

  return d.toLocaleDateString("en-US", options);
}

/**
 * Generates clean Order Number: AH-YYYYMMDD-XXXX
 */
export function generateOrderNumber() {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomHex = Math.floor(1000 + Math.random() * 9000).toString();
  return `AH-${dateStr}-${randomHex}`;
}

/**
 * Generates unique Ticket Code: TCK-XXXX-XXXX
 */
export function generateTicketNumber() {
  const segment1 = Math.random().toString(36).substring(2, 6).toUpperCase();
  const segment2 = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `TCK-${segment1}-${segment2}`;
}

/**
 * Truncate long strings with ellipsis
 */
export function truncate(str, length = 60) {
  if (!str) return "";
  if (str.length <= length) return str;
  return str.substring(0, length) + "...";
}
