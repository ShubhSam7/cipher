"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  HelpCircle,
  Users,
  Settings,
  Info,
} from "lucide-react";

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  status?: "active" | "coming-soon";
}

const navItems: NavItem[] = [
  { name: "Home", path: "/feed", icon: <Home className="w-5 h-5" />, status: "active" },
  { name: "Questions", path: "/questions", icon: <HelpCircle className="w-5 h-5" />, status: "coming-soon" },
  { name: "Community", path: "/community", icon: <Users className="w-5 h-5" />, status: "coming-soon" },
  { name: "Settings", path: "/settings", icon: <Settings className="w-5 h-5" />, status: "coming-soon" },
  { name: "About", path: "/about", icon: <Info className="w-5 h-5" />, status: "active" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <aside className="w-64 bg-black border-r border-gray-800/50 h-screen sticky top-0 p-4 hidden md:block">
      <nav className="space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          const isComingSoon = item.status === "coming-soon";
          
          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? "bg-cyan-500/10 border border-cyan-400 text-cyan-400 shadow-lg shadow-cyan-500/10"
                  : "text-gray-400 hover:bg-gray-900 hover:text-white border border-transparent"
              }`}
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <span className="font-medium">{item.name}</span>
              </div>
              {isComingSoon && (
                <span className="text-xs px-2 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-400/20">
                  Soon
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="my-6 border-t border-gray-800/50"></div>

      {/* Additional Info */}
      <div className="px-4 space-y-2">
        <p className="text-xs text-gray-600 uppercase tracking-wider">QUICK LINKS</p>
        <div className="space-y-1 text-sm text-gray-500">
          <p className="hover:text-cyan-400 cursor-pointer transition-colors">Privacy Policy</p>
          <p className="hover:text-cyan-400 cursor-pointer transition-colors">Terms of Service</p>
          <p className="hover:text-cyan-400 cursor-pointer transition-colors">Guidelines</p>
        </div>
      </div>
    </aside>
  );
}
