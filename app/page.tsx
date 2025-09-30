"use client";

import { Button } from "@/components/ui/Button";
import ShinyText from "@/components/ShinyText";
import LightRays from "@/components/LightRays";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

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
        </main>
        <div />
      </div>
    </div>
  );
}
