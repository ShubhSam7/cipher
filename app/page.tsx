"use client";

import { Button } from "@/components/ui/Button";
import ShinyText from "@/components/ShinyText";
import LightRays from "@/components/LightRays";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";
import { useState, useEffect } from "react";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, logout } = useAuthStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      await new Promise(resolve => setTimeout(resolve, 500));
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleGetStarted = () => {
    router.push("/feed");
  };

  const handleSignIn = () => {
    router.push("/signin");
  };

  const handleSignUp = () => {
    router.push("/signup");
  };

  return (
    <div className="font-sans relative min-h-screen">
      <div
        style={{
          width: "100%",
          height: "100vh",
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 0,
        }}
      >
        <LightRays
          raysOrigin="top-center"
          raysColor="#00ffff"
          raysSpeed={1.5}
          lightSpread={0.8}
          rayLength={1.2}
          followMouse={true}
          mouseInfluence={0.1}
          noiseAmount={0.1}
          distortion={0.05}
          className="custom-rays"
        />
      </div>

      <div className="relative z-10 grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
        <div />
        <main className="flex flex-col items-center gap-8">
          <ShinyText
            text="Welcome to the Social Media only made for College Gossips!"
            speed={3}
            className="text-3xl sm:text-4xl font-bold text-center max-w-2xl"
          />
          {!isHydrated ? (
            <div className="flex gap-4 mt-4">
              <div className="px-8 py-3 flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-cyan-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-white">Loading...</span>
              </div>
            </div>
          ) : isAuthenticated ? (
            <div className="flex gap-4 mt-4">
              <Button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="px-8 py-3 text-base rounded-lg shadow-md border border-white hover:bg-cyan-100 transition-colors hover:text-cyan-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoggingOut ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Logging out...
                  </span>
                ) : (
                  "Logout"
                )}
              </Button>
              <Button
                onClick={handleGetStarted}
                disabled={isLoggingOut}
                className="px-8 py-3 text-base rounded-lg shadow-md border border-white hover:bg-cyan-100 transition-colors hover:text-cyan-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Get Started
              </Button>
            </div>
          ) : (
            <div className="flex gap-4 mt-4">
              <Button
                onClick={handleSignIn}
                className="px-8 py-3 text-base rounded-lg shadow-md border border-white hover:bg-cyan-100 transition-colors hover:text-cyan-800"
              >
                Sign In
              </Button>
              <Button
                onClick={handleSignUp}
                className="px-8 py-3 text-base rounded-lg shadow-md border border-white hover:bg-cyan-100 transition-colors hover:text-cyan-800"
              >
                Sign Up
              </Button>
            </div>
          )}
        </main>
        <div />
      </div>
    </div>
  );
}
