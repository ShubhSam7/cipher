"use client";

import { CircleCheck, CircleAlert } from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

export function Toaster() {
  const { resolvedTheme } = useTheme();
  return (
    <Sonner
      theme={resolvedTheme === "dark" ? "dark" : "light"}
      position="bottom-center"
      icons={{ success: <CircleCheck size={18} className="text-[var(--success)]"/>, error: <CircleAlert size={18} className="text-destructive"/> }}
      toastOptions={{
        classNames: {
          toast: "!bg-popover !text-popover-foreground !border-border",
          description: "!text-muted-foreground",
          actionButton: "!bg-primary !text-primary-foreground",
        },
      }}
    />
  );
}
