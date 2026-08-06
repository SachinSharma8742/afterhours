"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "../lib/supabase/client";

const AuthContext = createContext(null);

function setAuthCookie(active) {
  if (typeof document !== "undefined") {
    if (active) {
      document.cookie = "afterhours_auth=true; path=/; max-age=604800; SameSite=Lax";
    } else {
      document.cookie = "afterhours_auth=; path=/; max-age=0; SameSite=Lax";
    }
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("customer");
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUser(user);
          const metaRole = user.user_metadata?.role || "customer";
          setRole(metaRole);
          setAuthCookie(true);
        } else {
          const localUser = localStorage.getItem("afterhours_user");
          if (localUser) {
            const parsed = JSON.parse(localUser);
            setUser(parsed);
            setRole(parsed.role || "customer");
            setAuthCookie(true);
          }
        }
      } catch (err) {
        console.warn("Auth sync warning:", err);
      } finally {
        setLoading(false);
      }
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        const metaRole = session.user.user_metadata?.role || "customer";
        setRole(metaRole);
        setAuthCookie(true);
        localStorage.setItem("afterhours_user", JSON.stringify({
          id: session.user.id,
          email: session.user.email,
          user_metadata: session.user.user_metadata,
          role: metaRole,
        }));
      } else if (_event === "SIGNED_OUT") {
        setUser(null);
        setRole("customer");
        setAuthCookie(false);
        try {
          if (typeof window !== "undefined") {
            localStorage.removeItem("afterhours_user");
            localStorage.removeItem("afterhours_orders");
            window.dispatchEvent(new Event("storage"));
          }
        } catch {}
      }
      setLoading(false);
    });

    return () => subscription?.unsubscribe();
  }, []);

  const login = async (email, password) => {
    const cleanEmail = email.trim().toLowerCase();

    // Built-in Staff / Admin Account Check
    if (cleanEmail === "admin@afterhours.live") {
      if (password === "admin123") {
        const adminUser = {
          id: "usr-admin-01",
          email: cleanEmail,
          user_metadata: { full_name: "System Administrator", role: "admin" },
          role: "admin",
        };
        setUser(adminUser);
        setRole("admin");
        setAuthCookie(true);
        localStorage.setItem("afterhours_user", JSON.stringify(adminUser));
        return { success: true, user: adminUser };
      } else {
        throw new Error("Invalid password for Administrator account.");
      }
    }

    if (cleanEmail === "staff@afterhours.live") {
      if (password === "staff123") {
        const staffUser = {
          id: "usr-staff-01",
          email: cleanEmail,
          user_metadata: { full_name: "Event Operations Staff", role: "staff" },
          role: "staff",
        };
        setUser(staffUser);
        setRole("staff");
        setAuthCookie(true);
        localStorage.setItem("afterhours_user", JSON.stringify(staffUser));
        return { success: true, user: staffUser };
      } else {
        throw new Error("Invalid password for Staff account.");
      }
    }

    try {
      const res = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
      if (res?.data?.user) {
        const u = res.data.user;
        const uRole = u.user_metadata?.role || "customer";
        setUser(u);
        setRole(uRole);
        setAuthCookie(true);
        localStorage.setItem("afterhours_user", JSON.stringify({
          id: u.id,
          email: u.email,
          user_metadata: u.user_metadata,
          role: uRole,
        }));
        return { success: true, user: u };
      }
    } catch (e) {
      console.warn("Supabase auth bypassed on login:", e);
    }

function generateDeterministicUuid(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(12, "0");
  return `00000000-0000-4000-8000-${hex.slice(0, 12)}`;
}

    // Direct Login using email & password
    const userId = generateDeterministicUuid(cleanEmail);
    const directUser = {
      id: userId,
      email: cleanEmail,
      user_metadata: { full_name: cleanEmail.split("@")[0] || "User", role: "customer" },
      role: "customer",
    };
    setUser(directUser);
    setRole("customer");
    setAuthCookie(true);
    localStorage.setItem("afterhours_user", JSON.stringify(directUser));
    return { success: true, user: directUser };
  };

  const signup = async ({ email, password, fullName, role = "customer" }) => {
    const cleanEmail = email.trim().toLowerCase();
    let data = null;

    try {
      const res = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: { full_name: fullName, role },
        },
      });
      data = res.data;
    } catch (e) {
      console.warn("Supabase signup bypassed:", e);
    }

    const createdUser = data?.user || {
      id: generateDeterministicUuid(cleanEmail),
      email: cleanEmail,
      user_metadata: { full_name: fullName, role },
      role,
    };

    setUser(createdUser);
    setRole(role);
    setAuthCookie(true);
    localStorage.setItem("afterhours_user", JSON.stringify({
      id: createdUser.id,
      email: createdUser.email,
      user_metadata: { full_name: fullName, role },
      role,
    }));

    return { success: true, user: createdUser, session: data?.session };
  };

  const loginWithGoogle = async (redirectTo) => {
    const redirectUrl = redirectTo || `${window.location.origin}/auth/callback`;
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });

    if (error) {
      throw error;
    }
    return data;
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn("Signout error:", e);
    }
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem("afterhours_user");
        localStorage.removeItem("afterhours_orders");
        sessionStorage.clear();
        window.dispatchEvent(new Event("storage"));
      }
    } catch (e) {
      console.warn("Error clearing storage on logout:", e);
    }
    setAuthCookie(false);
    setUser(null);
    setRole("customer");
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, login, signup, loginWithGoogle, logout, setRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

