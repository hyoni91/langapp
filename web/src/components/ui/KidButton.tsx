"use client";

import { Slot } from "@radix-ui/react-slot"

interface KidButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function KidButton({
  asChild,
  className = "",
  children,
  type,
  ...props
}: KidButtonProps) {
  const Comp = asChild ? Slot : "button";
  const base = 
    "inline-flex items-center justify-center " + 
    "h-12 min-w-28 px-6 rounded-kids bg-brand-500 text-white " +
    "shadow-card active:scale-98 hover:scale-102 hover:shadow-lg " +
    "transition-transform duration-kids focus:outline-none " +
    "focus:ring-4 focus:ring-brand-200";

    if (!asChild) {
    return (
      <Comp type={type ?? "button"} className={`${base} ${className}`} {...props}>
        {children}
      </Comp>
    );
  }

  return (
   <Comp className={`${base} ${className}`} {...props}>
      {children}
    </Comp>
  );
}
