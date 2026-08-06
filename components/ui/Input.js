"use client";

import { forwardRef } from "react";
import { cn } from "../../lib/utils/cn";

const Input = forwardRef(
  ({ className, type = "text", error, icon: Icon, label, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-semibold text-slate-300 tracking-wide">
            {label}
          </label>
        )}
        <div className="relative flex items-center w-full">
          {Icon && (
            <div className="absolute left-3.5 text-slate-400 pointer-events-none">
              <Icon className="w-4 h-4" />
            </div>
          )}
          <input
            type={type}
            ref={ref}
            className={cn(
              "w-full h-11 bg-slate-900/90 border border-slate-800 rounded-xl px-4 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-violet-500/80 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200 backdrop-blur-md",
              Icon && "pl-10",
              error && "border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/20",
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-rose-400 mt-0.5">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
