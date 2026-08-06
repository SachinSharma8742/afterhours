import { createClient as createSupabaseClient } from "@supabase/supabase-js";

let clientInstance = null;

export function createClient() {
  if (clientInstance) return clientInstance;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabasePublishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY environment variables."
    );
  }

  const safeStorage = {
    getItem: (key) => {
      try {
        return typeof window !== "undefined" ? window.localStorage.getItem(key) : null;
      } catch {
        return null;
      }
    },
    setItem: (key, value) => {
      try {
        if (typeof window !== "undefined") window.localStorage.setItem(key, value);
      } catch {}
    },
    removeItem: (key) => {
      try {
        if (typeof window !== "undefined") window.localStorage.removeItem(key);
      } catch {}
    },
  };

  clientInstance = createSupabaseClient(supabaseUrl, supabasePublishableKey, {
    auth: {
      storage: safeStorage,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  return clientInstance;
}

