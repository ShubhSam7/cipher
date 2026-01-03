"use client";

import { usePathname, useRouter } from "next/navigation";
import { Home, HelpCircle, Users, Settings, Info, X } from "lucide-react";
import { useEffect } from "react";

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

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Close sidebar when route changes
  useEffect(() => {
    onClose();
  }, [pathname]);

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-black border-r border-gray-800/50 z-50 md:hidden transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-800/50">
            <h2 className="text-xl font-bold text-cyan-400">Cipher</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-900 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
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

          {/* Footer */}
          <div className="p-4 border-t border-gray-800/50">
            <div className="space-y-2">
              <p className="text-xs text-gray-600 uppercase tracking-wider">Quick Links</p>
              <div className="space-y-1 text-sm text-gray-500">
                <p className="hover:text-cyan-400 cursor-pointer transition-colors">
                  Privacy Policy
                </p>
                <p className="hover:text-cyan-400 cursor-pointer transition-colors">
                  Terms of Service
                </p>
                <p className="hover:text-cyan-400 cursor-pointer transition-colors">
                  Guidelines
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
