"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, UserCheck, Ticket } from "lucide-react";

export default function CustomerSignupPage() {
  const { signup, loginWithGoogle } = useAuth();
  const { toast } = useToast();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedName || !trimmedEmail || !trimmedPassword) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields.",
        type: "error",
      });
      return;
    }

    setIsLoading(true);
    try {
      const res = await signup({ fullName: trimmedName, email: trimmedEmail, password: trimmedPassword, role: "customer" });
      if (res.success) {
        toast({
          title: "Account Created!",
          description: "Customer account registered successfully.",
          type: "success",
        });
        window.location.href = "/dashboard/tickets";
      }
    } catch (err) {
      toast({
        title: "Registration Failed",
        description: err.message || "Could not register account.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setIsGoogleLoading(true);
    try {
      await loginWithGoogle(window.location.origin + "/dashboard/tickets");
    } catch (err) {
      const errMsg = err.message || "";
      toast({
        title: "Google Sign-Up Failed",
        description: errMsg || "Unable to initialize Google Sign-Up.",
        type: "error",
      });
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4 py-24 font-montserrat">
      <div className="w-full max-w-md bg-[#0f0a0c] border border-[#c8102e]/30 rounded-2xl p-8 backdrop-blur-xl box-red-glow flex flex-col gap-6">
        
        {/* Header */}
        <div className="text-center flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-xl bg-[#6e0008] border border-[#c8102e] flex items-center justify-center text-white shadow-[0_0_15px_rgba(255,13,57,0.4)]">
            <Ticket className="w-6 h-6 text-white" />
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-black border border-[#c8102e]/40 text-[10px] font-bold text-[#c8102e] uppercase tracking-widest mt-1">
            <UserCheck className="w-3.5 h-3.5" /> ATTENDEE REGISTRATION
          </div>
          <h2 className="font-bebas text-3xl text-white tracking-wider uppercase mt-1">CREATE ACCOUNT</h2>
          <p className="text-xs text-gray-400">Join AfterHours to discover events & reserve passes</p>
        </div>

        {/* Google Signup */}
        <button
          type="button"
          onClick={handleGoogleSignup}
          disabled={isGoogleLoading}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-lg bg-black hover:bg-gray-900 border border-gray-800 text-white font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-50"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.2 9 5 12 5z" />
            <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
            <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 10.8 0 12s.7 2.3 1.9 4.7l3.7-2.9z" />
            <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.2-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z" />
          </svg>
          <span>{isGoogleLoading ? "Connecting..." : "Sign up with Google"}</span>
        </button>

        {/* Divider */}
        <div className="relative flex items-center justify-center my-1">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-900" />
          </div>
          <div className="relative bg-[#0f0a0c] px-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
            OR REGISTER WITH EMAIL
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">FULL NAME</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Alex Rivera"
              className="w-full px-4 py-3 rounded-lg bg-black border border-gray-800 focus:border-[#c8102e] text-xs text-white placeholder-gray-600 focus:outline-none transition-colors"
            />
          </div>

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
            <span>{isLoading ? "CREATING..." : "CREATE ACCOUNT"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-gray-900 flex flex-col gap-2 text-center text-xs text-gray-400">
          <p>
            Already have an account?{" "}
            <Link href="/login" className="text-[#c8102e] font-bold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
