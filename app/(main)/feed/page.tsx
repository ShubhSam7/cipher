"use client";

import { useState } from "react";
import TopBar from "@/components/feed/TopBar";
import Sidebar from "@/components/feed/Sidebar";
import PostCard from "@/components/feed/PostCard";
import CreatePostModal from "@/components/feed/CreatePostModal";

// Mock data for demonstration
const mockPosts = [
  {
    id: "1",
    username: "u/shubh123",
    timestamp: "23min ago",
    content: "this is my first post",
    likes: 12,
    comments: 3,
  },
  {
    id: "2",
    username: "c/developers",
    timestamp: "1h ago",
    content:
      "last night i saw a snack was roaming in the our campus freely that i got scared and here is the only way we can see at it is we need to take some action on it",
    likes: 45,
    comments: 18,
  },
  {
    id: "3",
    username: "u/anonymous_student",
    timestamp: "2h ago",
    content:
      "Anyone else think the new cafeteria menu is actually pretty good? Finally some decent food options!",
    likes: 8,
    comments: 5,
  },
];

export default function Feed() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-black">
      <TopBar onCreatePost={() => setIsCreateModalOpen(true)} />

      <div className="flex">
        <Sidebar />

        {/* Main Feed Area */}
        <main className="flex-1 max-w-4xl mx-auto px-4 py-6 space-y-4">
          {/* Welcome Message */}
          <div className="bg-gradient-to-r from-cyan-500/5 to-cyan-600/5 border border-cyan-400/20 rounded-2xl p-6 mb-6">
            <h1 className="text-2xl font-bold text-white mb-2">
              Welcome to Cipher Feed
            </h1>
            <p className="text-gray-500">
              Share your thoughts anonymously with your college community
            </p>
          </div>

          {/* Posts Feed */}
          {mockPosts.map((post) => (
            <PostCard
              key={post.id}
              username={post.username}
              timestamp={post.timestamp}
              content={post.content}
              initialLikes={post.likes}
              initialComments={post.comments}
            />
          ))}

          {/* Load More */}
          <div className="flex justify-center pt-6">
            <button className="px-6 py-3 bg-black/50 hover:bg-gray-900 border border-gray-800 text-gray-400 hover:text-white rounded-xl transition-all duration-200">
              Load More Posts
            </button>
          </div>
        </main>

        {/* Right Sidebar (Optional - for trending or suggestions) */}
        <aside className="w-80 p-4 hidden lg:block">
          <div className="sticky top-20 space-y-4">
            {/* Trending Topics */}
            <div className="bg-black/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-800/50">
              <h3 className="text-white font-semibold mb-3">Trending Topics</h3>
              <div className="space-y-2">
                <div className="text-sm text-gray-500 hover:text-cyan-400 cursor-pointer transition-colors">
                  #CampusLife
                </div>
                <div className="text-sm text-gray-500 hover:text-cyan-400 cursor-pointer transition-colors">
                  #Exams2024
                </div>
                <div className="text-sm text-gray-500 hover:text-cyan-400 cursor-pointer transition-colors">
                  #TechEvents
                </div>
                <div className="text-sm text-gray-500 hover:text-cyan-400 cursor-pointer transition-colors">
                  #StudyTips
                </div>
              </div>
            </div>

            {/* Community Guidelines */}
            <div className="bg-black/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-800/50">
              <h3 className="text-white font-semibold mb-3">Guidelines</h3>
              <ul className="space-y-2 text-sm text-gray-500">
                <li>• Be respectful to everyone</li>
                <li>• No personal information</li>
                <li>• Stay anonymous & safe</li>
                <li>• Report inappropriate content</li>
              </ul>
            </div>
          </div>
        </aside>
      </div>

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}