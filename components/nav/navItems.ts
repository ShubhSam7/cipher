import { Home, HelpCircle, Users, Settings, Info, BarChart3, type LucideIcon } from "lucide-react";

import type { Tone } from "@/lib/avatar";
export type { Tone } from "@/lib/avatar";
export interface NavItem {
  name: string;
  tone: Tone;
  path: string;
  icon: LucideIcon;
}

export const navItems: NavItem[] = [
  { name: "Home", tone: "lime", path: "/feed", icon: Home },
  { name: "Questions", tone: "sky", path: "/questions", icon: HelpCircle },
  { name: "Communities", tone: "peach", path: "/community", icon: Users },
  { name: "Polls", tone: "lavender", path: "/polls", icon: BarChart3 },
  { name: "Settings", tone: "neutral", path: "/settings", icon: Settings },
  { name: "About", tone: "neutral", path: "/about", icon: Info },
];
