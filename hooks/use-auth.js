"use client";

import { createContext, useContext, useEffect, useState } from "react";

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

function generateDeterministicUuid(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(12, "0");
  return `00000000-0000-4000-8000-${hex.slice(0, 12)}`;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("customer");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const localUser = localStorage.getItem("afterhours_user");
        if (localUser) {
          const parsed = JSON.parse(localUser);
          setUser(parsed);
          setRole(parsed.role || "customer");
          setAuthCookie(true);
        }
      }
    } catch (err) {
      console.warn("Auth initialization warning:", err);
    } finally {
      setLoading(false);
    }
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
        if (typeof window !== "undefined") {
          localStorage.setItem("afterhours_user", JSON.stringify(adminUser));
        }
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
        if (typeof window !== "undefined") {
          localStorage.setItem("afterhours_user", JSON.stringify(staffUser));
        }
        return { success: true, user: staffUser };
      } else {
        throw new Error("Invalid password for Staff account.");
      }
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
    if (typeof window !== "undefined") {
      localStorage.setItem("afterhours_user", JSON.stringify(directUser));
    }
    return { success: true, user: directUser };
  };

  const signup = async ({ email, password, fullName, role = "customer" }) => {
    const cleanEmail = email.trim().toLowerCase();
    const createdUser = {
      id: generateDeterministicUuid(cleanEmail),
      email: cleanEmail,
      user_metadata: { full_name: fullName, role },
      role,
    };

    setUser(createdUser);
    setRole(role);
    setAuthCookie(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("afterhours_user", JSON.stringify(createdUser));
    }

    return { success: true, user: createdUser, session: null };
  };

  const loginWithGoogle = async () => {
    const googleUser = {
      id: "usr-google-" + Date.now(),
      email: "guest@afterhours.live",
      user_metadata: { full_name: "Google User", role: "customer" },
      role: "customer",
    };
    setUser(googleUser);
    setRole("customer");
    setAuthCookie(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("afterhours_user", JSON.stringify(googleUser));
    }
    return { user: googleUser };
  };

  const logout = async () => {
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
