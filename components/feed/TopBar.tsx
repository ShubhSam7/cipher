"use client";

import { useState } from "react";
import { Search, Plus, Menu, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";

interface TopBarProps {
  onCreatePost?: () => void;
}

export default function TopBar({ onCreatePost }: TopBarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-md border-b border-gray-800 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <button className="md:hidden text-gray-400 hover:text-white">
              <Menu className="w-6 h-6" />
            </button>
            <div
              className="flex items-center gap-2 cursor-pointer group"
              onClick={() => router.push("/feed")}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent group-hover:from-cyan-300 group-hover:to-blue-400 transition-all">
                cipher
              </span>
            </div>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-8 hidden sm:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
              />
            </div>
          </form>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={onCreatePost}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-lg font-medium transition-all duration-200 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">create+</span>
            </button>

            {/* User Menu */}
            <div className="relative group">
              <button className="w-9 h-9 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-200">
                <User className="w-5 h-5 text-white" />
              </button>

              {/* Dropdown */}
              <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-xl border border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="p-3 border-b border-gray-700">
                  <p className="text-white font-medium">{user?.user_handle || "Guest"}</p>
                  <p className="text-gray-400 text-sm truncate">{user?.email || ""}</p>
                </div>
                <div className="p-2">
                  <button
                    onClick={() => router.push("/profile")}
                    className="w-full text-left px-3 py-2 text-gray-300 hover:bg-gray-700 rounded-md transition-colors"
                  >
                    Profile
                  </button>
                  <button
                    onClick={() => router.push("/settings")}
                    className="w-full text-left px-3 py-2 text-gray-300 hover:bg-gray-700 rounded-md transition-colors"
                  >
                    Settings
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-red-400 hover:bg-gray-700 rounded-md transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
