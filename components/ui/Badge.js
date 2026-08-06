"use client";

import { cn } from "../../lib/utils/cn";

export default function Badge({ children, variant = "default", className }) {
  const variants = {
    default: "bg-slate-800 text-slate-300 border-slate-700",
    violet: "bg-violet-500/10 text-violet-300 border-violet-500/30",
    emerald: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
    rose: "bg-rose-500/10 text-rose-300 border-rose-500/30",
    amber: "bg-amber-500/10 text-amber-300 border-amber-500/30",
    blue: "bg-blue-500/10 text-blue-300 border-blue-500/30",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border backdrop-blur-md transition-colors",
        variants[variant] || variants.default,
        className
      )}
    >
      {children}
    </span>
  );
}
