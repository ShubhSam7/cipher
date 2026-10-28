"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const Sheet = DialogPrimitive.Root;
const SheetTitle = DialogPrimitive.Title;

// Left-side drawer built on Dialog: gets Esc, focus trap and scroll lock for free.
const SheetContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-[var(--overlay)] data-[state=open]:animate-[fade-in_200ms_ease-out] data-[state=closed]:animate-[fade-out_200ms_ease-in] motion-reduce:animate-none" />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex h-full w-72 max-w-[85vw] flex-col border-r bg-background shadow-[var(--shadow-elevated)] data-[state=open]:animate-[slide-in-left_160ms_ease-out] data-[state=closed]:animate-[slide-out-left_200ms_ease-in] focus:outline-none motion-reduce:animate-none",
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-2 top-2 flex h-11 w-11 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
        <X className="h-5 w-5" />
        <span className="sr-only">Close menu</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
SheetContent.displayName = "SheetContent";

export { Sheet, SheetContent, SheetTitle };
