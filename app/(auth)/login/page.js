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
    <div className="w-full max-w-md bg-[#0f0a0c] border border-[#c8102e]/30 rounded-2xl p-8 backdrop-blur-xl box-red-glow flex flex-col gap-6 font-montserrat">
      {/* Header */}
      <div className="text-center flex flex-col items-center gap-2">
        <div className="w-12 h-12 rounded-xl bg-[#6e0008] border border-[#c8102e] flex items-center justify-center text-white shadow-[0_0_15px_rgba(255,13,57,0.4)]">
          <Ticket className="w-6 h-6 text-white" />
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-black border border-[#c8102e]/40 text-[10px] font-bold text-[#c8102e] uppercase tracking-widest mt-1">
          <UserCheck className="w-3.5 h-3.5" /> CUSTOMER PORTAL
        </div>
        <h2 className="font-bebas text-3xl text-white tracking-wider uppercase mt-1">CUSTOMER LOGIN</h2>
        <p className="text-xs text-gray-400">Access your purchased event passes and digital QR tickets</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">EMAIL ADDRESS</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-4 py-3 rounded-lg bg-black border border-gray-800 focus:border-[#c8102e] text-xs text-white placeholder-gray-600 focus:outline-none transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">PASSWORD</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-3 rounded-lg bg-black border border-gray-800 focus:border-[#c8102e] text-xs text-white placeholder-gray-600 focus:outline-none transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="btn-brush-red py-4 rounded-lg text-xs font-bold uppercase tracking-widest text-white flex items-center justify-center gap-2 mt-2"
        >
          <span>{isLoading ? "LOGGING IN..." : "LOGIN TO ACCOUNT"}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <div className="pt-4 border-t border-gray-900 flex flex-col gap-2 text-center text-xs text-gray-400">
        <p>
          Don't have an account?{" "}
          <Link href="/signup" className="text-[#c8102e] font-bold hover:underline">
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
