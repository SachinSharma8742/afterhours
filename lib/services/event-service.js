/**
 * Official Company Real Event Seed
 */
export const OFFICIAL_COMPANY_EVENTS = [
  {
    id: "jaipur-glow-and-A5F3B",
    title: "GLOW AND RAVE !!",
    subtitle: "Pre Diwali Party",
    slug: "glow-and-rave-2026",
    short_description: "Jaipur, this Diwali season, AFTER HOURS is where the real scene is. Big Bollywood energy, festive fits on point, crazy dance floors, and a night that’s about to make your Instagram stories look unreal.",
    full_description: `### 🪩 GLOW AND RAVE !! — Pre Diwali Party
**Jaipur, this Diwali season, AFTER HOURS is where the real scene is. 🪩✨**

Big Bollywood energy, festive fits on point, crazy dance floors, and a night that’s about to make your Instagram stories look unreal.

The lights, the music, the madness — we’re bringing the kind of pre-Diwali night you don’t want to hear about later.

So Jaipur, what’s it gonna be? **Making memories with us or catching the FOMO on Instagram the next morning? 👀🔥**

**AFTER HOURS — Your pre-Diwali plans, sorted.**

--------------------------------------------------

### 📅 Event Schedule & Venue
• Date: Wednesday, 4 November 2026
• Time: 6:00 PM – 10:00 PM
• Venue: The Royal Palm
• Address: The Royal Palm, Jagatpura, Jaipur, Rajasthan, India
• Exact Landmark: The royal palm !!
• Location Map: https://maps.app.goo.gl/iyc7qtiVVLSANQMQ7
• Entry: 16+ Only | Valid QR Pass & Government ID Required

--------------------------------------------------

### 🎟️ Pass Categories & Pricing
• **FEMALE STAG**: ₹499 (Valid entry pass for 1 female attendee, 16+)
• **MALE STAG**: ₹699 (Valid entry pass for 1 male attendee, 16+)
• **COUPLE**: ₹999 (Valid entry pass for 1 couple, 16+)
• **GROUP OF 5 (3 girls 2 boys)**: ₹2,250 (Group pass valid for 5 attendees: strictly 3 girls & 2 boys)

--------------------------------------------------

### ⚡ Registration & Approval Process
• **Approval Required**: The host reviews your registration request before confirming your spot.
• **WhatsApp Payment Link**: You'll receive a payment link on WhatsApp after approval.

--------------------------------------------------

### 📌 House Rules & Important Info
• Entry is strictly 16+ only.
• A valid QR Code Pass is mandatory for entry.
• Please carry a valid Government-issued photo ID for verification.
• Dress code: Festive fits, smart casuals, or neon party wear.
• Management reserves the right to refuse entry to anyone violating event rules or safety guidelines.`,
    banner_url: "/images/hero-banner.png",
    venue_name: "The Royal Palm",
    venue_address: "The Royal Palm, Jagatpura, Jaipur, Rajasthan, India",
    maps_url: "https://maps.app.goo.gl/iyc7qtiVVLSANQMQ7",
    city: "Jaipur",
    start_date: "2026-11-04T18:00:00+05:30",
    end_date: "2026-11-04T22:00:00+05:30",
    is_featured: true,
    is_published: true,
    status: "published",
    category_name: "Pre Diwali Party",
    category_slug: "pre-diwali-party",
    organizer: {
      company_name: "AFTER HOURS",
      bio: "Jaipur Premier Nightlife & Curated Festive Productions",
      verified: true,
    },
    ticket_types: [
      {
        id: "e6c4ef35-00b0-448d-87e3-a7e4bb431c91",
        name: "♀ FEMALE STAG",
        price: 499,
        quantity_total: 20,
        quantity_sold: 1,
        description: "Valid entry pass for 1 female attendee (16+). Includes entry to dance arena and festive party zone.",
      },
      {
        id: "bcc8da48-f9a7-44c9-a980-83db7611edb0",
        name: "♂ MALE STAG",
        price: 699,
        quantity_total: 20,
        quantity_sold: 2,
        description: "Valid entry pass for 1 male attendee (16+). Includes entry to dance arena and festive party zone.",
      },
      {
        id: "297353bb-5c94-4824-b276-f8ea6ecaec0b",
        name: "⚢ COUPLE",
        price: 999,
        quantity_total: 20,
        quantity_sold: 0,
        description: "Valid entry pass for 1 couple (16+). Includes entry for both attendees to dance arena and party zone.",
      },
      {
        id: "b059a61e-7790-4d64-88c3-7bfb3d61386a",
        name: "👥 GROUP OF 5 (3 girls 2 boys)",
        price: 2250,
        quantity_total: 20,
        quantity_sold: 0,
        description: "Group entry pass for 5 attendees (strictly 3 girls & 2 boys). Full access to dance arena and party zone.",
      },
    ],
  },
];

/**
 * Creates a slug from a title string
 */
export function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}

/**
 * Ensures an organizer profile exists for the user
 */
export async function getOrCreateOrganizerProfile(user) {
  return "org-afterhours-01";
}

/**
 * Fetch events directly from static catalogue and local state
 */
export async function getEvents({ category, search, city, featured } = {}) {
  let events = [...OFFICIAL_COMPANY_EVENTS];

  // Include locally created admin events if any
  try {
    if (typeof window !== "undefined") {
      const localEvents = JSON.parse(localStorage.getItem("afterhours_created_events") || "[]");
      localEvents.forEach((loc) => {
        if (!events.some((e) => e.id === loc.id || e.slug === loc.slug)) {
          events.unshift(loc);
        }
      });
    }
  } catch {}

  let filtered = [...events];
  if (featured) filtered = filtered.filter((e) => e.is_featured);
  if (category && category !== "all") filtered = filtered.filter((e) => e.category_slug === category);
  if (city) filtered = filtered.filter((e) => e.city?.toLowerCase().includes(city.toLowerCase()));
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (e) =>
        e.title?.toLowerCase().includes(q) ||
        e.venue_name?.toLowerCase().includes(q) ||
        e.city?.toLowerCase().includes(q)
    );
  }

  return filtered;
}

/**
 * Fetch a single event by ID or Slug
 */
export async function getEventByIdOrSlug(identifier) {
  if (!identifier) return OFFICIAL_COMPANY_EVENTS[0];

  const allEvents = await getEvents();
  const cleanId = typeof identifier === "string" ? identifier.trim() : String(identifier);
  const normalized = decodeURIComponent(cleanId).toLowerCase().replace(/\s+/g, "-");

  return (
    allEvents.find(
      (e) =>
        e.id === cleanId ||
        e.slug === cleanId ||
        e.slug === normalized ||
        slugify(e.title) === normalized ||
        e.title.toLowerCase() === decodeURIComponent(cleanId).toLowerCase() ||
        cleanId === "freshers-party-2026" ||
        cleanId === "glow-and-rave" ||
        cleanId === "glow-and-rave-2026" ||
        normalized.includes("glow")
    ) || OFFICIAL_COMPANY_EVENTS[0]
  );
}

/**
 * Creates and persists a new event to local state
 */
export async function createEventInSupabase(formData) {
  const eventSlug = slugify(formData.title) + "-" + Math.floor(Math.random() * 10000);

  const newEventObj = {
    id: `evt-${Date.now()}`,
    title: formData.title,
    slug: eventSlug,
    short_description: formData.short_description || "",
    full_description: formData.full_description || "",
    banner_url: formData.banner_url || "/images/event.jpeg",
    venue_name: formData.venue_name || "The Royal Palm",
    venue_address: formData.venue_address || "Jagatpura, Jaipur",
    city: formData.city || "Jaipur",
    start_date: formData.start_date
      ? new Date(formData.start_date).toISOString()
      : "2026-11-04T18:00:00+05:30",
    end_date: formData.end_date
      ? new Date(formData.end_date).toISOString()
      : "2026-11-04T22:30:00+05:30",
    is_published: true,
    is_featured: formData.is_featured || false,
    status: "published",
    organizer: { company_name: "AfterHours Management", verified: true },
    ticket_types: formData.ticket_types || [
      { id: `tt-${Date.now()}-1`, name: "♂ Boys Pass", price: 999, quantity_total: 300 },
      { id: `tt-${Date.now()}-2`, name: "♀ Girls Pass", price: 299, quantity_total: 300 },
      { id: `tt-${Date.now()}-3`, name: "⚢ Couple Pass", price: 499, quantity_total: 200 },
    ],
  };

  try {
    if (typeof window !== "undefined") {
      const existing = JSON.parse(localStorage.getItem("afterhours_created_events") || "[]");
      existing.unshift(newEventObj);
      localStorage.setItem("afterhours_created_events", JSON.stringify(existing));
    }
  } catch {}

  return newEventObj;
}

/**
 * Fetch categories
 */
export async function getCategories() {
  return [
    { id: "cat-1", name: "Nightlife & Parties", slug: "nightlife-parties" },
    { id: "cat-2", name: "Music & Concerts", slug: "music-concerts" },
    { id: "cat-3", name: "Tech & Innovation", slug: "tech-innovation" },
    { id: "cat-4", name: "Arts & Theatre", slug: "arts-theatre" },
    { id: "cat-5", name: "Sports & Fitness", slug: "sports-fitness" },
    { id: "cat-6", name: "Business & Networking", slug: "business-networking" },
  ];
}
