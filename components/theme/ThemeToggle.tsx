"use client";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { useHydrated } from "@/lib/hooks/useHydrated";
import { Button } from "@/components/ui/Button";
export function ThemeToggle({ className }: { className?: string }) { const { resolvedTheme, setTheme } = useTheme(); const hydrated = useHydrated(); return <Button variant="ghost" size="icon" className={className} aria-label={hydrated ? `Switch to ${resolvedTheme === "dark" ? "light" : "dark"} theme` : "Change theme"} onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}><Sun className="hidden h-5 w-5 dark:block" /><Moon className="h-5 w-5 dark:hidden" /></Button>; }
