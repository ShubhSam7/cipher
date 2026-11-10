"use client";
import { useEffect } from "react";
import { useTheme } from "next-themes";
import { THEME_COLORS } from "@/lib/theme";
export function ThemeColorSync() { const { resolvedTheme } = useTheme(); useEffect(() => { if (!resolvedTheme) return; document.querySelectorAll('meta[name="theme-color"]').forEach(meta => { meta.setAttribute("content", THEME_COLORS[resolvedTheme === "dark" ? "dark" : "light"]); meta.removeAttribute("media"); }); }, [resolvedTheme]); return null; }
