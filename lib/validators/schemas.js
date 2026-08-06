/**
 * Utility functions for input validation and sanitization
 */

export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

export function validateEventForm(data) {
  const errors = {};

  if (!data.title || data.title.trim().length < 3) {
    errors.title = "Title must be at least 3 characters long.";
  }

  if (!data.venue_name || data.venue_name.trim().length === 0) {
    errors.venue_name = "Venue name is required.";
  }

  if (!data.city || data.city.trim().length === 0) {
    errors.city = "City is required.";
  }

  if (!data.start_date) {
    errors.start_date = "Start date & time is required.";
  }

  if (!data.end_date) {
    errors.end_date = "End date & time is required.";
  } else if (data.start_date && new Date(data.end_date) <= new Date(data.start_date)) {
    errors.end_date = "End date must be after start date.";
  }

  if (!data.ticket_types || data.ticket_types.length === 0) {
    errors.ticket_types = "At least one ticket type must be defined.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateCheckoutForm(data) {
  const errors = {};

  if (!data.attendee_name || data.attendee_name.trim().length < 2) {
    errors.attendee_name = "Please enter your full name.";
  }

  if (!data.attendee_email || !validateEmail(data.attendee_email)) {
    errors.attendee_email = "Please enter a valid email address.";
  }

  if (!data.ticket_selection || Object.keys(data.ticket_selection).length === 0) {
    errors.ticket_selection = "Please select at least one ticket.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
