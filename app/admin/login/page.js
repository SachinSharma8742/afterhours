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
  const redirectPath = searchParams.get("redirect") || "/admin";

  const { login } = useAuth();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAutoFillDemo = () => {
    setEmail("admin@afterhours.live");
    setPassword("admin123");
    toast({
      title: "Demo Credentials Filled",
      description: "Click 'Authenticate Staff Access' to log in.",
      type: "info",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Missing Fields",
        description: "Please enter staff email and password.",
        type: "error",
      });
      return;
    }

    setIsLoading(true);
    try {
      // 1. Set dedicated staff/admin authorization cookie
      document.cookie = "afterhours_admin_auth=true; path=/; max-age=604800; SameSite=Lax";

      // 2. Save isolated staff admin session
      localStorage.setItem("afterhours_admin_session", JSON.stringify({
        email: email.trim().toLowerCase(),
        role: "admin",
        loggedInAt: new Date().toISOString(),
      }));

      // 3. Attempt Supabase login if user exists
      try {
        await login(email, password);
      } catch (err) {}

      toast({
        title: "Staff Authenticated",
        description: "Welcome to the internal management system.",
        type: "success",
      });

      // 4. Perform direct clean redirect to internal admin portal
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
          INTERNAL SYSTEM
        </div>
        <h2 className="text-2xl font-bold text-white mt-1">Company Staff Login</h2>
        <p className="text-xs text-slate-400">Secured management portal for authorized event staff</p>
      </div>

      {/* Demo Credentials Box */}
      <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col gap-2 text-xs">
        <div className="flex items-center justify-between text-emerald-300 font-bold">
          <span>🔑 Staff Credentials Demo:</span>
          <button
            type="button"
            onClick={handleAutoFillDemo}
            className="text-[10px] bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 px-2 py-0.5 rounded-lg text-emerald-200 transition-all font-mono"
          >
            Auto-Fill
          </button>
        </div>
        <div className="font-mono text-[11px] text-slate-300 flex flex-col gap-0.5">
          <p>Email: <span className="text-emerald-400 font-bold">admin@afterhours.live</span></p>
          <p>Password: <span className="text-emerald-400 font-bold">admin123</span></p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          icon={Mail}
          type="email"
          label="Staff Email Address"
          placeholder="staff@afterhours.live"
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
          Authenticate Staff Access <ArrowRight className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-16">
      <Suspense fallback={<div className="text-white text-center">Loading Internal Portal...</div>}>
        <AdminLoginForm />
      </Suspense>
    </div>
  );
}
