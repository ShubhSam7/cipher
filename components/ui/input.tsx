import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "flex h-11 w-full rounded-lg border border-input bg-card px-4 text-base text-foreground placeholder:text-muted-foreground transition-colors focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-destructive",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

export { Input };
