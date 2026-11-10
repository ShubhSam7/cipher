"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn } from "@/lib/utils";

import { avatarIdentity } from "@/lib/avatar";
import { AvatarPattern } from "./AvatarPattern";

const sizes = { sm: "h-8 w-8 text-xs", md: "h-10 w-10 text-sm", lg: "h-20 w-20 text-2xl" } as const;

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
  const identity = avatarIdentity(handle);
  return (
    <AvatarPrimitive.Root data-tone={identity.tone}
      className={cn("relative flex shrink-0 overflow-hidden rounded-full", sizes[size], className)}
    >
      {src && <AvatarPrimitive.Image src={src} alt="" className="h-full w-full object-cover" />}
      <AvatarPrimitive.Fallback
        delayMs={src ? 300 : undefined}
        className="avatar-fallback flex h-full w-full items-center justify-center"
        aria-hidden
      >
        <AvatarPattern {...identity} /><span className="avatar-initial">{identity.initial}</span>
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  );
}
