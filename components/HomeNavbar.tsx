"use client";

import { useRouter } from "next/navigation";
import styles from "@/components/feed/TopBar.module.css";

export default function HomeNavbar() {
  const router = useRouter();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-3 px-3 md:pt-4 md:px-4">
      <nav className={`${styles.glassContainer} w-full max-w-[1200px] rounded-full px-6 py-3 md:px-8 md:py-3`}>
        <div className="flex items-center justify-between gap-4">

          {/* Brand */}
          <div
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => router.push("/")}
          >
            <span className="text-lg font-semibold text-white/90 group-hover:text-cyan-400 transition-colors">
              Cipher
            </span>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            <button
              onClick={() => router.push("/")}
              className={`${styles.navLink} ${styles.active}`}
            >
              Home
            </button>
            <button
              onClick={() => router.push("/about")}
              className={styles.navLink}
            >
              About
            </button>
            <button
              onClick={() => router.push("/signin")}
              className={styles.navLink}
            >
              Sign In
            </button>
          </div>

          {/* Right Actions - Sign Up Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/signup")}
              className={`${styles.glassButton} px-4 py-2 md:px-6 md:py-2 rounded-full text-cyan-400 font-medium text-sm transition-all duration-200 hover:shadow-lg hover:shadow-cyan-500/20 active:scale-95`}
            >
              Get Started
            </button>
          </div>

        </div>
      </nav>
    </header>
  );
}
