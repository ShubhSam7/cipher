"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";

const LENGTH = 6;

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  invalid?: boolean;
  disabled?: boolean;
  describedBy?: string;
}

export default function OtpInput({ value, onChange, onComplete, invalid, disabled, describedBy }: OtpInputProps) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length: LENGTH }, (_, i) => value[i] ?? "");

  const update = (next: string, focusIndex: number) => {
    const clean = next.replace(/\D/g, "").slice(0, LENGTH);
    onChange(clean);
    inputs.current[Math.min(focusIndex, LENGTH - 1)]?.focus();
    if (clean.length === LENGTH) onComplete?.(clean);
  };

  return (
    <div className="flex justify-between gap-2" role="group" aria-label="One-time code" aria-describedby={describedBy}>
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(node) => { inputs.current[index] = node; }}
          value={digit}
          disabled={disabled}
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={LENGTH}
          aria-label={`Digit ${index + 1}`}
          aria-invalid={invalid}
          autoFocus={index === 0}
          onFocus={(e) => e.target.select()}
          onChange={(e) => {
            // Typing replaces this digit; autofill/paste can deliver the whole code at once.
            const typed = e.target.value.replace(/\D/g, "");
            if (!typed) return;
            if (typed.length > 1) return update(typed, typed.length);
            update(value.slice(0, index) + typed + value.slice(index + 1), index + 1);
          }}
          onPaste={(e) => {
            e.preventDefault();
            const pasted = e.clipboardData.getData("text").replace(/\D/g, "");
            if (pasted) update(pasted, pasted.length);
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace") {
              e.preventDefault();
              const target = digit ? index : index - 1;
              if (target >= 0) update(value.slice(0, target) + value.slice(target + 1), target);
            } else if (e.key === "ArrowLeft") {
              inputs.current[index - 1]?.focus();
            } else if (e.key === "ArrowRight") {
              inputs.current[index + 1]?.focus();
            }
          }}
          className={cn(
            "h-14 w-full min-w-0 rounded-lg border border-input bg-muted/40 text-center font-mono text-2xl transition-colors focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:opacity-50",
            invalid && "border-destructive"
          )}
        />
      ))}
    </div>
  );
}
