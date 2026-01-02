"use client";

import ShinyText from "@/components/ShinyText";
import LightRays from "@/components/LightRays";
import HomeNavbar from "@/components/HomeNavbar";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";
import { useState, useEffect } from "react";
import styles from "@/components/feed/TopBar.module.css";

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
      {/* Glassmorphism Navbar */}
      <HomeNavbar />

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
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className={`${styles.glassInput} px-8 py-3 text-base rounded-full text-white font-medium transition-all duration-200 hover:border-cyan-400/50 disabled:opacity-50 disabled:cursor-not-allowed`}
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
              </button>
              <button
                onClick={handleGetStarted}
                disabled={isLoggingOut}
                className={`${styles.glassButton} px-8 py-3 text-base rounded-full text-cyan-400 font-medium transition-all duration-200 hover:shadow-lg hover:shadow-cyan-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                Get Started
              </button>
            </div>
          ) : (
            <div className="flex gap-4 mt-4">
              <button
                onClick={handleSignIn}
                className={`${styles.glassInput} px-8 py-3 text-base rounded-full text-white font-medium transition-all duration-200 hover:border-cyan-400/50`}
              >
                Sign In
              </button>
              <button
                onClick={handleSignUp}
                className={`${styles.glassButton} px-8 py-3 text-base rounded-full text-cyan-400 font-medium transition-all duration-200 hover:shadow-lg hover:shadow-cyan-500/20 active:scale-95`}
              >
                Sign Up
              </button>
            </div>
          )}
        </main>
        <div />
      </div>

      {/* ================= PLATFORM DESCRIPTION SECTION ================= */}
      <section className="relative z-10 py-16 px-8 sm:px-20">
        <div className="max-w-[1100px] mx-auto space-y-16">
          {/* Heading */}
          <div className="text-center space-y-4">
            <h2 className="text-4xl sm:text-5xl font-bold text-white/90">
              A Campus Space Built on Anonymity & Trust
            </h2>
            <p className="text-lg sm:text-xl text-white/60 max-w-3xl mx-auto">
              Cipher is a closed social platform designed exclusively for college campuses — where ideas, confessions, and conversations flow freely without identity pressure.
            </p>
          </div>

          {/* Feature Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature Card 1 */}
            <div className="group relative p-8 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 transition-all duration-300 hover:bg-white/8 hover:border-cyan-400/30 hover:shadow-xl hover:shadow-cyan-500/10 hover:-translate-y-1">
              <div className="space-y-4">
                {/* Shield Icon */}
                <div className="w-14 h-14 rounded-xl bg-cyan-500/10 flex items-center justify-center group-hover:bg-cyan-500/20 transition-all duration-300">
                  <svg className="w-7 h-7 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white">Verified Campus Only</h3>
                <p className="text-white/60">Access is restricted to verified college students, ensuring relevance, safety, and authentic campus culture.</p>
              </div>
            </div>

            {/* Feature Card 2 */}
            <div className="group relative p-8 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 transition-all duration-300 hover:bg-white/8 hover:border-cyan-400/30 hover:shadow-xl hover:shadow-cyan-500/10 hover:-translate-y-1">
              <div className="space-y-4">
                {/* Mask Icon */}
                <div className="w-14 h-14 rounded-xl bg-cyan-500/10 flex items-center justify-center group-hover:bg-cyan-500/20 transition-all duration-300">
                  <svg className="w-7 h-7 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" opacity={0.4} />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white">True Anonymity</h3>
                <p className="text-white/60">Post confessions, opinions, or thoughts without revealing your identity — no usernames, no profiles.</p>
              </div>
            </div>

            {/* Feature Card 3 */}
            <div className="group relative p-8 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 transition-all duration-300 hover:bg-white/8 hover:border-cyan-400/30 hover:shadow-xl hover:shadow-cyan-500/10 hover:-translate-y-1">
              <div className="space-y-4">
                {/* Pulse Icon */}
                <div className="w-14 h-14 rounded-xl bg-cyan-500/10 flex items-center justify-center group-hover:bg-cyan-500/20 transition-all duration-300">
                  <svg className="w-7 h-7 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white">Live Campus Pulse</h3>
                <p className="text-white/60">See what your campus is thinking in real-time — trending topics, viral posts, and raw conversations.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= CAMPUS FEED PREVIEW SECTION ================= */}
      <section className="relative z-10 py-16 px-8 sm:px-20">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/4 to-transparent blur-3xl pointer-events-none" />
        
        <div className="relative max-w-[1200px] mx-auto space-y-12">
          {/* Heading */}
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-400/20">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-sm font-semibold text-cyan-400 tracking-wider">LIVE</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-white">
              Campus Feed
            </h2>
            <p className="text-lg sm:text-xl text-white/60 max-w-3xl mx-auto">
              See what's happening on campus right now
            </p>
          </div>

          {/* Feed Posts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {/* Post 1 - Confession */}
            <div className="group p-6 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 transition-all duration-300 hover:bg-white/8 hover:border-cyan-400/20 hover:shadow-lg hover:shadow-cyan-500/5">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white/80 font-medium">Anonymous</h4>
                    <p className="text-white/40 text-sm">2 min ago • Confessions</p>
                  </div>
                </div>
                <p className="text-white/70 text-base leading-relaxed">
                  I've been attending online lectures from my bed for the past week and the professor still thinks I'm the most attentive student 😅
                </p>
                <div className="flex items-center gap-6 pt-2">
                  <button className="flex items-center gap-2 text-white/50 hover:text-cyan-400 transition-colors group/like">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span className="text-sm font-medium">234</span>
                  </button>
                  <button className="flex items-center gap-2 text-white/50 hover:text-cyan-400 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span className="text-sm font-medium">89</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Post 2 - Campus Meme */}
            <div className="group p-6 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 transition-all duration-300 hover:bg-white/8 hover:border-cyan-400/20 hover:shadow-lg hover:shadow-cyan-500/5">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white/80 font-medium">Anonymous</h4>
                    <p className="text-white/40 text-sm">15 min ago • Campus Memes</p>
                  </div>
                </div>
                <p className="text-white/70 text-base leading-relaxed">
                  When the professor says "this will be easy" before midterms 🚩🚩🚩
                  <br />
                  <span className="text-white/50 text-sm mt-2 block">Narrator: It was not easy.</span>
                </p>
                <div className="flex items-center gap-6 pt-2">
                  <button className="flex items-center gap-2 text-white/50 hover:text-cyan-400 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span className="text-sm font-medium">567</span>
                  </button>
                  <button className="flex items-center gap-2 text-white/50 hover:text-cyan-400 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span className="text-sm font-medium">143</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Post 3 - Department */}
            <div className="group p-6 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 transition-all duration-300 hover:bg-white/8 hover:border-cyan-400/20 hover:shadow-lg hover:shadow-cyan-500/5">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white/80 font-medium">Anonymous</h4>
                    <p className="text-white/40 text-sm">1 hour ago • CS Department</p>
                  </div>
                </div>
                <p className="text-white/70 text-base leading-relaxed">
                  Anyone else struggling with the DSA assignment? The deadline is tomorrow and I'm still stuck on question 2 😭
                </p>
                <div className="flex items-center gap-6 pt-2">
                  <button className="flex items-center gap-2 text-white/50 hover:text-cyan-400 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span className="text-sm font-medium">156</span>
                  </button>
                  <button className="flex items-center gap-2 text-white/50 hover:text-cyan-400 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span className="text-sm font-medium">67</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Post 4 - Trending */}
            <div className="group p-6 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 transition-all duration-300 hover:bg-white/8 hover:border-cyan-400/20 hover:shadow-lg hover:shadow-cyan-500/5">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-pink-500/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white/80 font-medium">Anonymous</h4>
                    <p className="text-white/40 text-sm">3 hours ago • Trending</p>
                  </div>
                </div>
                <p className="text-white/70 text-base leading-relaxed">
                  The canteen finally added the momos everyone was asking for! 🎉 Best decision they've made all semester
                </p>
                <div className="flex items-center gap-6 pt-2">
                  <button className="flex items-center gap-2 text-white/50 hover:text-cyan-400 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span className="text-sm font-medium">892</span>
                  </button>
                  <button className="flex items-center gap-2 text-white/50 hover:text-cyan-400 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span className="text-sm font-medium">201</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Post 5 - Campus Life */}
            <div className="group p-6 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 transition-all duration-300 hover:bg-white/8 hover:border-cyan-400/20 hover:shadow-lg hover:shadow-cyan-500/5 lg:col-span-2">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white/80 font-medium">Anonymous</h4>
                    <p className="text-white/40 text-sm">5 hours ago • Campus Life</p>
                  </div>
                </div>
                <p className="text-white/70 text-base leading-relaxed">
                  Shoutout to the seniors who organized the tech fest this year. The workshops were actually useful and the competitions were 🔥. Already looking forward to next year!
                </p>
                <div className="flex items-center gap-6 pt-2">
                  <button className="flex items-center gap-2 text-white/50 hover:text-cyan-400 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span className="text-sm font-medium">445</span>
                  </button>
                  <button className="flex items-center gap-2 text-white/50 hover:text-cyan-400 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span className="text-sm font-medium">98</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* View More Button */}
          <div className="text-center pt-4">
            <button className="px-8 py-3 rounded-full bg-cyan-500/10 border border-cyan-400/20 text-cyan-400 font-medium hover:bg-cyan-500/20 hover:border-cyan-400/40 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20">
              View All Posts →
            </button>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="relative z-10 mt-24 px-8 sm:px-20">
        <div className="max-w-[1200px] mx-auto">
          <div className="p-12 rounded-3xl bg-[rgba(10,10,12,0.8)] backdrop-blur-2xl border border-white/6">
            {/* Footer Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-8">
              {/* Brand Column */}
              <div className="space-y-3">
                <h3 className="text-2xl font-bold text-white">Cipher</h3>
                <p className="text-white/60">Unfiltered campus conversations.</p>
              </div>

              {/* Navigation Column */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-white/80 uppercase tracking-wider mb-4">Navigate</h4>
                <ul className="space-y-2">
                  <li>
                    <a href="#" className="text-white/60 hover:text-cyan-400 transition-colors duration-200">
                      Home
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-white/60 hover:text-cyan-400 transition-colors duration-200">
                      Trending
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-white/60 hover:text-cyan-400 transition-colors duration-200">
                      Communities
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-white/60 hover:text-cyan-400 transition-colors duration-200">
                      Confessions
                    </a>
                  </li>
                </ul>
              </div>

              {/* Legal Column */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-white/80 uppercase tracking-wider mb-4">Legal</h4>
                <ul className="space-y-2">
                  <li>
                    <a href="#" className="text-white/60 hover:text-cyan-400 transition-colors duration-200">
                      Privacy Policy
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-white/60 hover:text-cyan-400 transition-colors duration-200">
                      Terms of Use
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-white/60 hover:text-cyan-400 transition-colors duration-200">
                      Contact
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            {/* Footer Bottom */}
            <div className="pt-8 border-t border-white/6">
              <p className="text-center text-white/40 text-sm">
                © 2026 Cipher. Built for campuses.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Spacing */}
        <div className="h-12" />
      </footer>
    </div>
  );
}
