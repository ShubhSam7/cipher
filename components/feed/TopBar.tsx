"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import Logo from "@/components/Logo";
import { Search, Plus, Menu, LogOut, Settings, User } from "lucide-react";
import { feedSearchHref } from "@/lib/search";
import { MAX_SEARCH_LENGTH } from "@/lib/validation/search";
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
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchButtonRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  const hydrated = useHydrated();
  const { user, logout } = useAuthStore();
  const openCreatePost = useUiStore((state) => state.setCreatePostOpen);
  const signedIn = hydrated && !!user;

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchOpen(false);
    router.push(feedSearchHref(searchQuery));
    searchInputRef.current?.blur();
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <header className="app-topbar">
      <div className="topbar-inner flex items-center justify-between gap-3 px-5 sm:px-7 lg:px-10">
        <div className="flex items-center gap-2">
          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setIsMenuOpen(true)}
            aria-label="Open menu"
            className="-ml-2 flex h-11 w-11 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground md:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>
          <Logo href={signedIn ? "/feed" : "/"} />
        </div>

        {signedIn && (
          <form
            onSubmit={handleSearch}
            role="search"
            className="topbar-search-form"
            data-open={searchOpen}
            onKeyDown={event => {
              if (event.key === "Escape" && searchOpen) {
                event.preventDefault();
                setSearchOpen(false);
                if (searchButtonRef.current?.getClientRects().length) searchButtonRef.current.focus();
              }
            }}
          >
            <label htmlFor="tag-search" className="sr-only">Search posts or #hashtags</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-brand" aria-hidden />
              <input
                ref={searchInputRef}
                id="tag-search"
                type="search"
                placeholder="Search posts or #hashtags"
                value={searchQuery}
                maxLength={MAX_SEARCH_LENGTH}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="topbar-search h-11 w-full pl-10 pr-14 text-sm placeholder:text-muted-foreground"
              />
              <button type="submit" aria-label="Search posts" className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center rounded-full text-brand hover:bg-accent"><Search size={18} aria-hidden /></button>
            </div>
          </form>
        )}

        <div className="flex items-center gap-2">
          {signedIn ? (
            <>
              <Button ref={searchButtonRef} variant="ghost" size="icon" className="sm:hidden" onClick={() => setSearchOpen(value => !value)} aria-label="Search posts or hashtags" aria-expanded={searchOpen} aria-controls="tag-search"><Search className="h-5 w-5" /></Button>
              <Button
                onClick={() => openCreatePost(true)}
                className="create-post-action"
                aria-label="Create post"
              >
                <Plus className="h-5 w-5" aria-hidden />
                <span className="hidden sm:inline">New post</span>
              </Button>

              <ThemeToggle className="hidden sm:inline-flex" /><DropdownMenu>
                <DropdownMenuTrigger
                  className="flex h-11 w-11 items-center justify-center rounded-full focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  aria-label="Account menu"
                >
                  <UserAvatar handle={user.user_handle} size="sm" className="h-9 w-9" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    <p className="break-words font-medium">u/{user.user_handle}</p>
                    <p className="truncate text-sm font-normal text-muted-foreground">{user.email}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => router.push(`/u/${user.user_handle}`)}><User className="h-4 w-4" /> Profile</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => router.push("/settings")}>
                    <Settings className="h-4 w-4" aria-hidden /> Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem className="sm:hidden" onSelect={() => router.push("/settings")}>Appearance</DropdownMenuItem>
                  <DropdownMenuItem destructive onSelect={handleLogout}>
                    <LogOut className="h-4 w-4" aria-hidden /> Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            hydrated && (
              <><ThemeToggle /><Button asChild size="sm">
                <Link href="/signin">Sign in</Link>
              </Button></>
            )
          )}
        </div>
      </div>

      <MobileSidebar isOpen={isMenuOpen} onOpenChange={setIsMenuOpen} returnFocusRef={menuButtonRef} />
    </header>
  );
}
