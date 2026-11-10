"use client";
import { ThemeProvider as Provider } from "next-themes";
import { ThemeColorSync } from "./ThemeColorSync";
export function ThemeProvider({ children }: { children: React.ReactNode }) { return <Provider attribute="class" defaultTheme="system" enableSystem storageKey="cipher-theme" disableTransitionOnChange><ThemeColorSync />{children}</Provider>; }
