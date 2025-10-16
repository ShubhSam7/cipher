"use client";

import { useState } from "react";
import { Heart, MessageCircle, Share2 } from "lucide-react";

interface PostCardProps {
  username: string;
  timestamp: string;
  content: string;
  initialLikes?: number;
  initialComments?: number;
}

export default function PostCard({
  username,
  timestamp,
  content,
  initialLikes = 0,
  initialComments = 0,
}: PostCardProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(false);

  const handleLike = () => {
    if (isLiked) {
      setLikes(likes - 1);
    } else {
      setLikes(likes + 1);
    }
    setIsLiked(!isLiked);
  };

  return (
    <div className="bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-cyan-500/30 transition-all duration-300 shadow-lg">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
          <span className="text-white font-semibold text-sm">
            {username.charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <p className="text-white font-medium">{username}</p>
          <p className="text-gray-400 text-sm">{timestamp}</p>
        </div>
      </div>

      {/* Content */}
      <div className="mb-4">
        <p className="text-gray-200 leading-relaxed">{content}</p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-6">
        <button
          onClick={handleLike}
          className={`flex items-center gap-2 transition-all duration-200 ${
            isLiked
              ? "text-pink-500"
              : "text-gray-400 hover:text-pink-500"
          }`}
        >
          <Heart
            className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`}
          />
          <span className="text-sm font-medium">{likes > 0 ? likes : "like"}</span>
        </button>

        <button className="flex items-center gap-2 text-gray-400 hover:text-cyan-500 transition-colors duration-200">
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm font-medium">
            {initialComments > 0 ? initialComments : "comment"}
          </span>
        </button>

        <button className="flex items-center gap-2 text-gray-400 hover:text-blue-500 transition-colors duration-200">
          <Share2 className="w-5 h-5" />
          <span className="text-sm font-medium">share</span>
        </button>
      </div>
    </div>
  );
}
