"use client";

import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import Button from "@/components/ui/Button";

export default function ForbiddenPage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-16 text-center">
      <div className="w-20 h-20 rounded-3xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mb-6">
        <ShieldAlert className="w-10 h-10 animate-bounce" />
      </div>

      <span className="text-xs font-mono font-bold uppercase tracking-widest text-rose-400 bg-rose-500/10 border border-rose-500/30 px-3 py-1 rounded-full mb-3">
        HTTP 403 FORBIDDEN
      </span>

      <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-3">
        Access Denied
      </h1>

      <p className="text-sm text-slate-400 max-w-md leading-relaxed mb-8">
        You do not have permission to access this internal company resource. This portal is restricted exclusively to authorized staff and system administrators.
      </p>

      <div className="flex items-center gap-4">
        <Link href="/">
          <Button variant="glow" size="md">
            <ArrowLeft className="w-4 h-4" /> Return to Customer Homepage
          </Button>
        </Link>
      </div>
    </div>
  );
}
