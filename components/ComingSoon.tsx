"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Sparkles } from "lucide-react";

interface ComingSoonProps {
  title: string;
  description: string;
}

export default function ComingSoon({ title, description }: ComingSoonProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-8">
      <div className="max-w-2xl w-full">
        {/* Back Button */}
        <button
          onClick={() => router.push("/feed")}
          className="mb-8 flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors duration-200"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Feed</span>
        </button>

        {/* Main Content */}
        <div className="bg-black/50 backdrop-blur-lg rounded-3xl p-12 border border-gray-800/50 text-center space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-2xl bg-cyan-500/10 flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-cyan-400" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl font-bold text-white">
            {title}
          </h1>

          {/* Description */}
          <p className="text-lg text-gray-400 max-w-lg mx-auto">
            {description}
          </p>

          {/* Coming Soon Badge */}
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-cyan-500/10 border border-cyan-400/20">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-sm font-semibold text-cyan-400 tracking-wider">
              COMING SOON
            </span>
          </div>

          {/* Additional Info */}
          <p className="text-sm text-gray-500 pt-4">
            We're working hard to bring this feature to you. Stay tuned!
          </p>
        </div>
      </div>
    </div>
  );
}
