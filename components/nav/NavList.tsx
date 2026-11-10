"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { navItems } from "./navItems";

export default function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <ul className="space-y-1">
      {navItems.map(({ name, path, icon: Icon, tone }) => {
        const isActive = pathname === path || pathname.startsWith(`${path}/`);
        return (
          <li key={path} className={path === "/settings" ? "nav-utility-start" : undefined}>
            <Link
              href={path}
              data-tone={tone}
              onClick={onNavigate}
              aria-current={isActive ? "page" : undefined}
              aria-label={name}
              className={cn(
                "nav-link flex items-center justify-between gap-3 transition-colors",
                isActive ? "nav-link--active" : "",
                (path === "/settings" || path === "/about") && "nav-link--secondary"
              )}
            >
              <span className="flex items-center gap-3">
                <span className="nav-icon"><Icon className="h-5 w-5" aria-hidden /></span>
                <span className="nav-label">{name}</span>
              </span>

            </Link>
          </li>
        );
      })}
    </ul>
  );
}
