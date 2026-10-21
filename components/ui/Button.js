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
      "inline-flex items-center justify-center font-bold uppercase tracking-[0.14em] transition-all duration-200 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed select-none rounded-lg cursor-pointer";

    const variants = {
      primary:
        "bg-[#e5c997] text-[#14090c] hover:bg-[#edd8af] active:bg-[#dfbe86] border border-[#ebd3a6] shadow-sm hover:shadow-md font-bold",
      glow:
        "bg-[#e5c997] text-[#14090c] hover:bg-[#edd8af] active:bg-[#dfbe86] border border-[#ebd3a6] shadow-sm font-bold",
      secondary:
        "bg-[#181114] hover:bg-[#22181d] text-[#f7f1e5] border border-[#e5c997]/25 hover:border-[#e5c997]/45",
      outline:
        "border border-[#e5c997]/40 bg-transparent text-[#e5c997] hover:bg-[#e5c997] hover:text-[#14090c] transition-colors",
      ghost: "hover:bg-white/5 text-[#d8cdbe] hover:text-[#f7f1e5]",
      danger:
        "bg-red-800 text-white hover:bg-red-900 border border-red-700",
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
