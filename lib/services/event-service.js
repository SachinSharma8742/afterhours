import { createClient } from "../supabase/client";

/**
 * Official Company Real Event Seed
 */
export const OFFICIAL_COMPANY_EVENTS = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    title: "Freshers Party 2026",
    slug: "freshers-party-2026",
    short_description: "Welcome to the Biggest Freshers Celebration in Jaipur! Get ready for an unforgettable night of music, fun, and memories at The Royal Palm, Jagatpura, Jaipur.",
    full_description: `Welcome to the Biggest Freshers Celebration in Jaipur!

Get ready for an unforgettable night of music, fun, and unforgettable memories! Freshers Party 2026 is designed for college students and young professionals to meet new people, make lasting friendships, and enjoy an exciting evening filled with entertainment.

Whether you're a fresher or just looking for an amazing night out, this event promises a vibrant atmosphere with live music, engaging games, exciting performances, and a high-energy DJ night.

--------------------------------------------------

### 📅 Event Details
• Date: 16 August 2026
• Time: 6:00 PM – 10:30 PM
• Venue: The Royal Palm, Jagatpura, Jaipur
• Location Map: https://maps.app.goo.gl/XA1ajM8Ne7jNGGZFA?g_st=ic
• Age Limit: 16+ Only
• Entry: Valid QR Code Pass & Government ID Required

--------------------------------------------------

### ✨ What's Included

🎧 **DJ Night**
Dance to the latest Bollywood, Punjabi, EDM, and commercial hits with an electrifying live DJ. Get ready for an unforgettable party atmosphere.

👑 **Mr. & Miss Freshers**
Compete for the prestigious Mr. Freshers and Miss Freshers titles through exciting rounds that showcase confidence, personality, and stage presence.

🚩 **Red Flag / 🟢 Green Flag**
A crowd-favorite interactive game where participants respond to fun and relatable dating and friendship scenarios. Expect lots of laughs and audience participation.

🤝 **Speed Friending**
Meet new people through quick one-on-one conversations designed to help you make new friends and connections in a fun, relaxed setting.

💃 **Dance Performances**
Enjoy energetic dance performances that keep the excitement going throughout the evening.

📸 **Photo Booth**
Capture unforgettable memories with your friends at our themed photo booth. Take amazing pictures and create memories you'll always remember.

--------------------------------------------------

### 🌟 Why You Should Attend
• Meet students from different colleges across Jaipur.
• Enjoy one of the city's most exciting DJ nights.
• Participate in fun games and activities.
• Make new friends and unforgettable memories.
• Capture amazing moments at our Photo Booth.
• Experience an evening full of music, entertainment, and positive vibes.

--------------------------------------------------

### 📌 Important Information
• Entry is strictly 16+ only.
• A valid QR Code Pass is mandatory for entry.
• Please carry a valid Government-issued photo ID for verification.
• Management reserves the right to refuse entry to anyone violating event rules or safety guidelines.

Get ready to experience Freshers Party 2026—an evening of music, games, friendships, and unforgettable memories awaits you!`,
    banner_url: "/images/event.jpeg",
    venue_name: "The Royal Palm",
    venue_address: "Jagatpura, Jaipur",
    maps_url: "https://maps.app.goo.gl/XA1ajM8Ne7jNGGZFA?g_st=ic",
    city: "Jaipur",
    start_date: "2026-08-16T18:00:00+05:30",
    end_date: "2026-08-16T22:30:00+05:30",
    is_featured: true,
    is_published: true,
    status: "published",
    category_name: "Nightlife & Parties",
    category_slug: "nightlife-parties",
    organizer: {
      company_name: "AfterHours Management",
      bio: "Official Event Management & Production Host",
      verified: true,
    },
    ticket_types: [
      {
        id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
        name: "♂ Boys Pass",
        price: 999,
        quantity_total: 300,
        quantity_sold: 0,
        description: "Valid entry pass for 1 male attendee (16+). Includes entry to all event activities and the DJ Night.",
      },
      {
        id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
        name: "♀ Girls Pass",
        price: 299,
        quantity_total: 300,
        quantity_sold: 0,
        description: "Valid entry pass for 1 female attendee (16+). Includes entry to all event activities and the DJ Night.",
      },
      {
        id: "cccccccc-cccc-cccc-cccc-cccccccccccc",
        name: "⚢ Couple Pass",
        price: 499,
        quantity_total: 200,
        quantity_sold: 0,
        description: "Valid entry pass for 1 couple (16+). Includes entry to all event activities and the DJ Night for both.",
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
 * Ensures an organizer profile exists in Supabase DB for the user
 */
export async function getOrCreateOrganizerProfile(supabase, user) {
  if (!user) return null;

  try {
    const { data: existing } = await supabase
      .from("organizers")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (existing?.id) return existing.id;

    const { data: created } = await supabase
      .from("organizers")
      .insert([
        {
          user_id: user.id,
          company_name: user.user_metadata?.company_name || user.user_metadata?.full_name || "AfterHours Management",
          bio: "Official Event Management Company.",
          verified: true,
        },
      ])
      .select("id")
      .single();

    if (created?.id) return created.id;
  } catch (err) {
    console.warn("Organizer profile helper warning:", err);
  }
  return null;
}

/**
 * Fetch events directly from Supabase PostgreSQL database
 */
export async function getEvents({ category, search, city, featured } = {}) {
  let events = [];
  try {
    const supabase = createClient();
    let query = supabase
      .from("events")
      .select("*, categories:category_id(*), ticket_types(*)")
      .eq("is_published", true)
      .order("start_date", { ascending: true });

    if (featured) query = query.eq("is_featured", true);
    if (city) query = query.ilike("city", `%${city}%`);
    if (search) query = query.or(`title.ilike.%${search}%,venue_name.ilike.%${search}%,city.ilike.%${search}%`);

    const { data, error } = await query;
    if (!error && data && data.length > 0) {
      events = data;
    }
  } catch (err) {
    console.warn("Supabase fetch warning:", err);
  }

  // Merge with official company event catalogue if database has no entries
  if (events.length === 0) {
    events = [...OFFICIAL_COMPANY_EVENTS];
  }

  // Also include locally created admin events
  try {
    if (typeof window !== "undefined") {
      const localEvents = JSON.parse(localStorage.getItem("afterhours_created_events") || "[]");
      localEvents.forEach(loc => {
        if (!events.some(e => e.id === loc.id || e.slug === loc.slug)) {
          events.unshift(loc);
        }
      });
    }
  } catch {}

  let filtered = [...events];
  if (featured) filtered = filtered.filter(e => e.is_featured);
  if (category && category !== "all") filtered = filtered.filter(e => e.category_slug === category);
  if (city) filtered = filtered.filter(e => e.city?.toLowerCase().includes(city.toLowerCase()));
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(e => e.title?.toLowerCase().includes(q) || e.venue_name?.toLowerCase().includes(s) || e.city?.toLowerCase().includes(q));
  }

  return filtered;
}

/**
 * Fetch a single event by ID or Slug
 */
export async function getEventByIdOrSlug(identifier) {
  if (!identifier) return null;

  const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(identifier);

  try {
    const supabase = createClient();
    let query = supabase
      .from("events")
      .select("*, categories:category_id(*), ticket_types(*), event_images(*), organizers(*)");

    if (isUuid) {
      query = query.or(`id.eq.${identifier},slug.eq.${identifier}`);
    } else {
      query = query.eq("slug", identifier);
    }

    const { data } = await query.single();
    if (data) return data;
  } catch (err) {}

  const allEvents = await getEvents();
  return allEvents.find(e => e.id === identifier || e.slug === identifier) || OFFICIAL_COMPANY_EVENTS[0];
}

/**
 * Creates and persists a new event to Supabase DB and local state
 */
export async function createEventInSupabase(formData) {
  const supabase = createClient();
  const eventSlug = slugify(formData.title) + "-" + Math.floor(Math.random() * 10000);
  const now = new Date().toISOString();

  let user = null;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    user = session?.user || null;
  } catch {}

  let organizerId = await getOrCreateOrganizerProfile(supabase, user);

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
    start_date: formData.start_date ? new Date(formData.start_date).toISOString() : "2026-08-16T18:00:00+05:30",
    end_date: formData.end_date ? new Date(formData.end_date).toISOString() : "2026-08-16T22:30:00+05:30",
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
    const insertPayload = {
      title: newEventObj.title,
      slug: newEventObj.slug,
      short_description: newEventObj.short_description,
      full_description: newEventObj.full_description,
      banner_url: newEventObj.banner_url,
      venue_name: newEventObj.venue_name,
      venue_address: newEventObj.venue_address,
      city: newEventObj.city,
      start_date: newEventObj.start_date,
      end_date: newEventObj.end_date,
      is_published: true,
      is_featured: newEventObj.is_featured,
      status: "published",
    };

    if (organizerId) insertPayload.organizer_id = organizerId;

    const { data: createdEvent } = await supabase
      .from("events")
      .insert([insertPayload])
      .select()
      .single();

    if (createdEvent) {
      newEventObj.id = createdEvent.id;
    }
  } catch (err) {
    console.warn("Supabase insert warning:", err);
  }

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
  try {
    const supabase = createClient();
    const { data } = await supabase.from("event_categories").select("*").order("name");
    if (data && data.length > 0) return data;
  } catch (err) {}

  return [
    { id: "cat-1", name: "Nightlife & Parties", slug: "nightlife-parties" },
    { id: "cat-2", name: "Music & Concerts", slug: "music-concerts" },
    { id: "cat-3", name: "Tech & Innovation", slug: "tech-innovation" },
    { id: "cat-4", name: "Arts & Theatre", slug: "arts-theatre" },
    { id: "cat-5", name: "Sports & Fitness", slug: "sports-fitness" },
    { id: "cat-6", name: "Business & Networking", slug: "business-networking" },
  ];
}
