"use client";

import { useState, Suspense, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Mail, Lock, ArrowRight, UserCheck, Ticket } from "lucide-react";

function CustomerLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/dashboard/tickets";
  const urlError = searchParams.get("error");

  const { login } = useAuth();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (urlError) {
      toast({
        title: "Authentication Alert",
        description: urlError,
        type: "error",
      });
    }
  }, [urlError, toast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Missing Fields",
        description: "Please enter your email and password.",
        type: "error",
      });
      return;
    }

    setIsLoading(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        toast({
          title: "Welcome Back!",
          description: "Signed into your account.",
          type: "success",
        });
        window.location.href = redirectPath;
      }
    } catch (err) {
      toast({
        title: "Login Failed",
        description: err.message || "Invalid email or password credentials.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-[#161013] border border-[#e5c997]/20 rounded-xl p-8 shadow-sm flex flex-col gap-6 font-montserrat">
      {/* Header */}
      <div className="text-center flex flex-col items-center gap-2">
        <img
          src="/images/logo.png?v=afterhours-v5"
          alt="AfterHours Brand"
          className="w-18 h-18 rounded-xl object-cover border border-[#e5c997]/40 shadow-sm"
        />
        <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#20151a] border border-[#e5c997]/25 text-[10px] font-semibold text-[#e5c997] uppercase tracking-wider mt-1">
          <UserCheck className="w-3.5 h-3.5" /> CUSTOMER PORTAL
        </div>
        <h2 className="font-bebas text-3xl text-[#f7f1e5] tracking-wider uppercase mt-1">CUSTOMER LOGIN</h2>
        <p className="text-xs text-[#9c8e82]">Access your purchased event passes and digital QR tickets</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-[#9c8e82]">EMAIL ADDRESS</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-3.5 py-2.5 rounded-lg bg-[#0e0a0c] border border-[#e5c997]/20 focus:border-[#e5c997] text-xs text-[#f7f1e5] placeholder-gray-600 focus:outline-none transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-[#9c8e82]">PASSWORD</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-3.5 py-2.5 rounded-lg bg-[#0e0a0c] border border-[#e5c997]/20 focus:border-[#e5c997] text-xs text-[#f7f1e5] placeholder-gray-600 focus:outline-none transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="btn-gold-luxury py-3 text-xs flex items-center justify-center gap-2 mt-2 w-full"
        >
          <span>{isLoading ? "LOGGING IN..." : "LOGIN TO ACCOUNT"}</span>
          <ArrowRight className="w-3.5 h-3.5 ml-1" />
        </button>
      </form>

      <div className="pt-4 border-t border-[#e5c997]/15 flex flex-col gap-2 text-center text-xs text-gray-400">
        <p>
          Don't have an account?{" "}
          <Link href="/signup" className="text-[#e5c997] font-bold hover:underline">
            Register Here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4 py-24">
      <Suspense fallback={<div className="text-white text-center text-xs font-bold uppercase tracking-widest">LOADING LOGIN...</div>}>
        <CustomerLoginForm />
      </Suspense>
    </div>
  );
}
