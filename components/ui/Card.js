"use client";

import { cn } from "../../lib/utils/cn";

export function Card({ className, children, hoverable = false, glow = false, ...props }) {
  return (
    <div
      className={cn(
        "bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl rounded-2xl p-6 transition-all duration-300 relative overflow-hidden",
        hoverable && "hover:border-slate-700 hover:shadow-2xl hover:shadow-violet-950/20 hover:-translate-y-1",
        glow && "before:absolute before:inset-0 before:-z-10 before:bg-gradient-to-br before:from-violet-600/10 before:to-transparent before:rounded-2xl",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }) {
  return (
    <div className={cn("flex flex-col gap-1 mb-4", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }) {
  return (
    <h3 className={cn("text-lg font-bold text-slate-100 tracking-tight", className)} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ className, children, ...props }) {
  return (
    <p className={cn("text-xs text-slate-400 leading-relaxed", className)} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ className, children, ...props }) {
  return <div className={cn("", className)} {...props}>{children}</div>;
}

export function CardFooter({ className, children, ...props }) {
  return (
    <div className={cn("flex items-center justify-between mt-6 pt-4 border-t border-slate-800/60", className)} {...props}>
      {children}
    </div>
  );
}
