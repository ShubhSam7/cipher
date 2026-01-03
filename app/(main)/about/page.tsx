"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Shield, Users, Zap } from "lucide-react";

export default function AboutPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-4xl mx-auto px-8 py-12">
        {/* Back Button */}
        <button
          onClick={() => router.push("/feed")}
          className="mb-8 flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors duration-200"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Feed</span>
        </button>

        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl sm:text-6xl font-bold text-white mb-4">
            About Cipher
          </h1>
          <p className="text-xl text-gray-400">
            Unfiltered campus conversations.
          </p>
        </div>

        {/* Mission Statement */}
        <div className="bg-black/50 backdrop-blur-lg rounded-3xl p-10 border border-gray-800/50 mb-8">
          <h2 className="text-3xl font-bold text-white mb-6">Our Mission</h2>
          <p className="text-lg text-gray-300 leading-relaxed mb-4">
            Cipher is a closed social platform designed exclusively for college campuses — 
            where ideas, confessions, and conversations flow freely without identity pressure.
          </p>
          <p className="text-lg text-gray-300 leading-relaxed">
            We believe in creating a space where students can express themselves authentically, 
            share their thoughts anonymously, and connect with their campus community in a 
            meaningful way.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-black/50 backdrop-blur-lg rounded-2xl p-8 border border-gray-800/50">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-cyan-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">
              Verified Campus Only
            </h3>
            <p className="text-gray-400">
              Access restricted to verified college students for authentic campus culture.
            </p>
          </div>

          <div className="bg-black/50 backdrop-blur-lg rounded-2xl p-8 border border-gray-800/50">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">
              True Anonymity
            </h3>
            <p className="text-gray-400">
              Post without revealing your identity — no usernames, no profiles.
            </p>
          </div>

          <div className="bg-black/50 backdrop-blur-lg rounded-2xl p-8 border border-gray-800/50">
            <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-pink-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">
              Live Campus Pulse
            </h3>
            <p className="text-gray-400">
              Real-time trending topics, viral posts, and raw conversations.
            </p>
          </div>
        </div>

        {/* Contact & Links */}
        <div className="bg-black/50 backdrop-blur-lg rounded-3xl p-10 border border-gray-800/50">
          <h2 className="text-2xl font-bold text-white mb-6">Get in Touch</h2>
          <div className="space-y-4 text-gray-300">
            <div>
              <h3 className="text-white font-semibold mb-2">Contact</h3>
              <p>support@cipher.campus</p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-2">Legal</h3>
              <div className="flex gap-4">
                <a href="#" className="text-cyan-400 hover:underline">
                  Privacy Policy
                </a>
                <a href="#" className="text-cyan-400 hover:underline">
                  Terms of Service
                </a>
                <a href="#" className="text-cyan-400 hover:underline">
                  Guidelines
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500">
          <p>© 2026 Cipher. Built for campuses.</p>
        </div>
      </div>
    </div>
  );
}
