"use client";

import { forwardRef } from "react";
import { cn } from "../../lib/utils/cn";
import { Loader2 } from "lucide-react";

const Button = forwardRef(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      children,
      disabled,
      type = "button",
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-bold uppercase tracking-widest transition-all duration-200 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed select-none rounded-xl";

    const variants = {
      primary:
        "bg-[#c8102e] text-white hover:bg-[#a80b24] border border-[#e01838] shadow-[0_0_20px_rgba(255,13,57,0.4)] hover:shadow-[0_0_35px_rgba(255,13,57,0.7)]",
      glow: "bg-[#c8102e] text-white hover:bg-[#a80b24] border border-[#e01838] shadow-[0_0_25px_rgba(255,13,57,0.6)] hover:shadow-[0_0_40px_rgba(255,13,57,0.9)] font-black",
      secondary:
        "bg-black hover:bg-[#150307] text-white border border-gray-800 hover:border-[#c8102e]",
      outline:
        "border border-[#c8102e] bg-transparent text-white hover:bg-[#c8102e] transition-colors",
      ghost: "hover:bg-white/10 text-gray-300 hover:text-white",
      danger:
        "bg-red-700 text-white hover:bg-red-800 border border-red-500",
    };

    const sizes = {
      sm: "h-9 px-4 text-xs gap-2",
      md: "h-11 px-6 text-xs gap-2.5",
      lg: "h-13 px-8 text-sm gap-3 font-extrabold",
      icon: "h-10 w-10 p-0",
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-white" />
            <span>PROCESSING...</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
