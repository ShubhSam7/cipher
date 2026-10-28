"use client";

import { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const PasswordInput = forwardRef<HTMLInputElement, Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">>(
  ({ className, ...props }, ref) => {
    const [visible, setVisible] = useState(false);

    return (
      <div className="relative">
        <Input ref={ref} type={visible ? "text" : "password"} className={cn("pr-11", className)} {...props} />
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="absolute right-0 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground"
        >
          {visible ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
        </button>
      </div>
    );
  }
);
PasswordInput.displayName = "PasswordInput";

export default PasswordInput;
