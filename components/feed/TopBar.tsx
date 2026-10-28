"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import { Search, Plus, Menu, LogOut, Settings, User } from "lucide-react";
import { useAuthStore } from "@/lib/store/authStore";
import { useUiStore } from "@/lib/store/uiStore";
import { useHydrated } from "@/lib/hooks/useHydrated";
import { Button } from "@/components/ui/Button";
import { UserAvatar } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import MobileSidebar from "./MobileSidebar";

export default function TopBar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  const hydrated = useHydrated();
  const { user, logout } = useAuthStore();
  const openCreatePost = useUiStore((state) => state.setCreatePostOpen);
  const signedIn = hydrated && !!user;

  // Search is hashtag-only until full-text search exists.
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const tag = searchQuery.trim().replace(/^#/, "").toLowerCase();
    setSearchOpen(false);
    if (tag) router.push(`/feed?tag=${encodeURIComponent(tag)}`);
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setIsMenuOpen(true)}
            aria-label="Open menu"
            className="-ml-2 rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground md:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>
          <Logo href={signedIn ? "/feed" : "/"} />
        </div>

        {signedIn && (
          <form onSubmit={handleSearch} role="search" className={`mx-4 max-w-xl flex-1 sm:block ${searchOpen ? "absolute inset-x-0 top-16 m-0 border-b bg-background p-3" : "hidden"}`}>
            <label htmlFor="tag-search" className="sr-only">Search hashtags</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <input
                id="tag-search"
                type="search"
                placeholder="Search #hashtags"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 w-full rounded-lg border border-input bg-muted/40 pl-10 pr-4 text-sm placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
              />
            </div>
          </form>
        )}

        <div className="flex items-center gap-2">
          {signedIn ? (
            <>
              <Button variant="ghost" size="icon" className="sm:hidden" onClick={() => setSearchOpen(value => !value)} aria-label="Search hashtags" aria-expanded={searchOpen}><Search className="h-5 w-5" /></Button>
              <Button
                variant="outline"
                onClick={() => openCreatePost(true)}
                className="rounded-full border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary"
                aria-label="Create post"
              >
                <Plus className="h-5 w-5" aria-hidden />
                <span className="hidden sm:inline">Create</span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger
                  className="rounded-full focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  aria-label="Account menu"
                >
                  <UserAvatar handle={user.user_handle} size="sm" className="h-9 w-9" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    <p className="font-medium">u/{user.user_handle}</p>
                    <p className="truncate text-sm font-normal text-muted-foreground">{user.email}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => router.push(`/u/${user.user_handle}`)}><User className="h-4 w-4" /> Profile</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => router.push("/settings")}>
                    <Settings className="h-4 w-4" aria-hidden /> Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem destructive onSelect={handleLogout}>
                    <LogOut className="h-4 w-4" aria-hidden /> Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            hydrated && (
              <Button asChild size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Link href="/signin">Sign in</Link>
              </Button>
            )
          )}
        </div>
      </div>

      <MobileSidebar isOpen={isMenuOpen} onOpenChange={setIsMenuOpen} returnFocusRef={menuButtonRef} />
    </header>
  );
}
