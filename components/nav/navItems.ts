import { Home, HelpCircle, Users, Settings, Info, BarChart3, type LucideIcon } from "lucide-react";

export interface NavItem {
  name: string;
  path: string;
  icon: LucideIcon;
}

export const navItems: NavItem[] = [
  { name: "Home", path: "/feed", icon: Home },
  { name: "Questions", path: "/questions", icon: HelpCircle },
  { name: "Communities", path: "/community", icon: Users },
  { name: "Polls", path: "/polls", icon: BarChart3 },
  { name: "Settings", path: "/settings", icon: Settings },
  { name: "About", path: "/about", icon: Info },
];
