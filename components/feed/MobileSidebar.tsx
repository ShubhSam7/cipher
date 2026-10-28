"use client";

import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import NavList from "@/components/nav/NavList";

interface MobileSidebarProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  // The drawer is opened from outside its own trigger, so return focus explicitly.
  returnFocusRef?: React.RefObject<HTMLElement | null>;
}

export default function MobileSidebar({ isOpen, onOpenChange, returnFocusRef }: MobileSidebarProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        aria-describedby={undefined}
        className="md:hidden"
        onCloseAutoFocus={(e) => {
          if (!returnFocusRef?.current) return;
          e.preventDefault();
          returnFocusRef.current.focus();
        }}
      >
        <div className="border-b p-4">
          <SheetTitle className="text-xl font-bold text-primary">Cipher</SheetTitle>
        </div>
        <nav aria-label="Main" className="flex-1 overflow-y-auto p-4">
          <NavList onNavigate={() => onOpenChange(false)} />
        </nav>
        <p className="border-t p-4 text-xs text-muted-foreground">© {new Date().getFullYear()} Cipher · IIIT Nagpur</p>
      </SheetContent>
    </Sheet>
  );
}
