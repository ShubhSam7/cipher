"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn } from "@/lib/utils";

const sizes = { sm: "h-8 w-8 text-xs", md: "h-10 w-10 text-sm" } as const;

// Pseudonymous avatar with a quiet, tonal fallback.
export function UserAvatar({
  handle,
  src,
  size = "md",
  className,
}: {
  handle: string;
  src?: string | null;
  size?: keyof typeof sizes;
  className?: string;
}) {
  return (
    <AvatarPrimitive.Root
      className={cn("relative flex shrink-0 overflow-hidden rounded-full", sizes[size], className)}
    >
      {src && <AvatarPrimitive.Image src={src} alt="" className="h-full w-full object-cover" />}
      <AvatarPrimitive.Fallback
        delayMs={src ? 300 : undefined}
        className="avatar-fallback flex h-full w-full items-center justify-center"
        aria-hidden
      >
        {handle.charAt(0).toUpperCase()}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  );
}
