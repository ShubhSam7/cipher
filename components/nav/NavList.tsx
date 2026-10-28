"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { navItems } from "./navItems";

export default function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <ul className="space-y-1">
      {navItems.map(({ name, path, icon: Icon }) => {
        const isActive = pathname === path || pathname.startsWith(`${path}/`);
        return (
          <li key={path}>
            <Link
              href={path}
              onClick={onNavigate}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "nav-link flex items-center justify-between gap-3 transition-colors",
                isActive
                  ? "nav-link--active"
                  : ""
              )}
            >
              <span className="flex items-center gap-3">
                <Icon className="h-5 w-5" aria-hidden />
                {name}
              </span>

            </Link>
          </li>
        );
      })}
    </ul>
  );
}
