"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { Mail, Lock, ShieldCheck, ArrowRight } from "lucide-react";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/portal-ops-x97";

  const { login } = useAuth();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast({
        title: "Missing Fields",
        description: "Please enter your staff or admin email and password.",
        type: "error",
      });
      return;
    }

    setIsLoading(true);
    try {
      // 1. Attempt login with credentials
      const result = await login(email.trim(), password);
      
      const loggedUser = result?.user;
      const userRole = loggedUser?.role || loggedUser?.user_metadata?.role;

      // 2. Enforce Role Check (Must be 'admin' or 'staff')
      if (!loggedUser || (userRole !== "admin" && userRole !== "staff")) {
        throw new Error("Access Denied: Your account does not have Admin or Staff authorization.");
      }

      // 3. Set dedicated staff/admin authorization cookie ONLY after successful validation
      document.cookie = "afterhours_admin_auth=true; path=/; max-age=604800; SameSite=Lax";

      // 4. Save isolated staff admin session with verified role
      localStorage.setItem("afterhours_admin_session", JSON.stringify({
        email: email.trim().toLowerCase(),
        role: userRole,
        name: loggedUser?.user_metadata?.full_name || email.trim().split("@")[0],
        loggedInAt: new Date().toISOString(),
      }));

      toast({
        title: "Authentication Successful",
        description: `Welcome to the Operations Portal (${userRole.toUpperCase()} Access).`,
        type: "success",
      });

      // 5. Direct clean redirect to secure operations portal
      window.location.href = redirectPath;
    } catch (err) {
      toast({
        title: "Authentication Failed",
        description: err.message || "Invalid staff credentials.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl shadow-2xl flex flex-col gap-6">
      <div className="text-center flex flex-col items-center gap-2">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-lg">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-bold text-emerald-300 mt-1">
          INTERNAL OPERATIONS PORTAL
        </div>
        <h2 className="text-2xl font-bold text-white mt-1">Authorized Staff Sign-In</h2>
        <p className="text-xs text-slate-400">Restricted access portal for event operations & admin staff</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          icon={Mail}
          type="email"
          label="Staff / Admin Email"
          placeholder="Enter authorized email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Input
          icon={Lock}
          type="password"
          label="Password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button type="submit" variant="glow" size="lg" isLoading={isLoading} className="mt-2 bg-gradient-to-r from-emerald-600 to-teal-600">
          Authenticate Access <ArrowRight className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-16">
      <Suspense fallback={<div className="text-white text-center">Loading Operations Portal...</div>}>
        <AdminLoginForm />
      </Suspense>
    </div>
  );
}
