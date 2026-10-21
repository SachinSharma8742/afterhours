import { createClient as createSupabaseClient } from "@supabase/supabase-js";

function createDummyClient() {
  const dummyBuilder = () => {
    const builder = {
      select: () => builder,
      insert: () => builder,
      update: () => builder,
      delete: () => builder,
      eq: () => builder,
      neq: () => builder,
      gt: () => builder,
      gte: () => builder,
      lt: () => builder,
      lte: () => builder,
      like: () => builder,
      ilike: () => builder,
      is: () => builder,
      in: () => builder,
      contains: () => builder,
      containedBy: () => builder,
      range: () => builder,
      order: () => builder,
      limit: () => builder,
      offset: () => builder,
      single: () => Promise.resolve({ data: null, error: null }),
      maybeSingle: () => Promise.resolve({ data: null, error: null }),
      then: (resolve) => resolve({ data: [], error: null, count: 0 }),
    };
    return builder;
  };

  return {
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe: () => {} } },
      }),
      signInWithPassword: async () => ({ data: { user: null, session: null }, error: null }),
      signUp: async () => ({ data: { user: null, session: null }, error: null }),
      signOut: async () => ({ error: null }),
      signInWithOAuth: async () => ({ data: { provider: "google", url: null }, error: null }),
    },
    from: () => dummyBuilder(),
    rpc: async () => ({ data: null, error: null }),
    storage: {
      from: () => ({
        upload: async () => ({ data: null, error: null }),
        getPublicUrl: () => ({ data: { publicUrl: "" } }),
      }),
    },
  };
}

let clientInstance = null;

export function createClient() {
  if (clientInstance) return clientInstance;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabasePublishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabasePublishableKey || supabaseUrl.includes("placeholder")) {
    clientInstance = createDummyClient();
    return clientInstance;
  }

  try {
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
  } catch (err) {
    console.warn("Supabase init bypassed:", err);
    clientInstance = createDummyClient();
    return clientInstance;
  }
}
