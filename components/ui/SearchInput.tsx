"use client";

import { useRef, type ComponentProps } from "react";
import { Search, X } from "lucide-react";
import { Input } from "./input";
import { MAX_SEARCH_LENGTH } from "@/lib/validation/search";

export function SearchInput({ value, onValueChange, ...props }: Omit<ComponentProps<typeof Input>, "value" | "onChange"> & {
  value: string;
  onValueChange: (value: string) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return <div className="relative min-w-0 flex-1">
    <Search size={18} aria-hidden className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
    <Input {...props} ref={ref} type="search" value={value} maxLength={MAX_SEARCH_LENGTH} onChange={event => onValueChange(event.target.value)} className="pl-10 pr-12" />
    {value && <button type="button" aria-label="Clear search" className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground" onClick={() => { onValueChange(""); ref.current?.focus(); }}><X size={18} aria-hidden /></button>}
  </div>;
}
