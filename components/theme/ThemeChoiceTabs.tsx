"use client";
import { useTheme } from "next-themes";
import { useHydrated } from "@/lib/hooks/useHydrated";
import { SegmentedControl } from "@/components/ui/segmented";
export function ThemeChoiceTabs() { const { theme, setTheme } = useTheme(); const hydrated = useHydrated(); return <SegmentedControl label="Theme" value={hydrated ? theme : undefined} options={[{value:"system",label:"System"},{value:"light",label:"Light"},{value:"dark",label:"Dark"}]} onChange={setTheme} />; }
