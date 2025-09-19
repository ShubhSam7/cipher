"use client";

import { Button } from "@/components/ui/Button"; 
import ShinyText from "@/components/ShinyText";
import { useRouter } from "next/navigation"; 

export default function Home() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push("/feed");
  };

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <div />
      <main className="flex flex-col items-center gap-8">
        <ShinyText
          text="Welcome to the Social Media only made for College Gossips!"
          speed={3}
          className="text-3xl sm:text-4xl font-bold text-center max-w-2xl"
        />
        <Button
          onClick={handleGetStarted}
          className="mt-4 px-8 py-3 text-base rounded-lg shadow-md border border-white hover:bg-amber-200 transition-colors hover:text-blue-600"
        >
          Get Started
        </Button>
      </main>
      <div />
    </div>
  );
}