"use client";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
const steps = [{id:"email",label:"Email"},{id:"otp",label:"Verify"},{id:"complete",label:"Create"}];
export function Stepper({ current }: { current: "email" | "otp" | "complete" }) {
  const currentIndex = steps.findIndex((step) => step.id === current);
  return (
    <div className="mb-6"><div className="stepper-track" aria-hidden><span style={{width:`${currentIndex / (steps.length - 1) * 100}%`}}/></div><ol className="signup-stepper flex items-center justify-center gap-2" aria-label="Signup progress">
      {steps.map((step, index) => {
        const done = index < currentIndex;
        return (
          <li key={step.id} className="flex items-center gap-2" aria-current={index === currentIndex ? "step" : undefined}>
            <span
              data-done={done}
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold",
                index === currentIndex && "bg-primary text-primary-foreground",
                done && "bg-primary/20 text-brand",
                index > currentIndex && "bg-muted text-muted-foreground"
              )}
            >
              {done ? <Check className="h-4 w-4" aria-label="Done" /> : index + 1}
            </span>
            <span className={cn("text-sm", index === currentIndex ? "text-foreground" : "text-muted-foreground")}>
              {step.label}
            </span>
            {index < steps.length - 1 && <span className="mx-1 h-px w-6 bg-border" aria-hidden />}
          </li>
        );
      })}
    </ol></div>
  );
}

