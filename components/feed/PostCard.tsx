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

// function HighlightHashtags(content:string): string{
//   const hashtagRegex = /#(\w+)/g;
//   const matches = content.match(hashtagRegex);
//   if (!matches) return content;

//   matches.map(tag => tag.slice(1).toLowerCase())
// }

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

  const parts = content.split(/(\#[a-zA-Z0-9_]+)/g);

  return (
    <div className="bg-black/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800/50 hover:border-cyan-400/50 transition-all duration-300 shadow-lg">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <span className="text-white font-semibold text-sm">
            {username.charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <p className="text-white font-medium">{username}</p>
          <p className="text-gray-500 text-sm">{timestamp}</p>
        </div>
      </div>

      {/* Content */}
      <div className="mb-4">
        {/* <p className="text-gray-300 leading-relaxed">{HighlightHashtags(content)}</p> */}
        
        <p className="whitespace-pre-wrap">
        {parts.map((part, index) =>
        part.match(/\#[a-zA-Z0-9_]+/) ? (
          <span
            key={index}
            className="text-blue-500 underline cursor-pointer"
          >
            {part}
          </span>
        ) : (
          part
        )
      )}
    </p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-6">
        <button
          onClick={handleLike}
          className={`flex items-center gap-2 transition-all duration-200 ${
            isLiked
              ? "text-cyan-400"
              : "text-gray-500 hover:text-cyan-400"
          }`}
        >
          <Heart
            className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`}
          />
          <span className="text-sm font-medium">{likes > 0 ? likes : "like"}</span>
        </button>

        <button className="flex items-center gap-2 text-gray-500 hover:text-cyan-400 transition-colors duration-200">
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm font-medium">
            {initialComments > 0 ? initialComments : "comment"}
          </span>
        </button>

        <button className="flex items-center gap-2 text-gray-500 hover:text-cyan-400 transition-colors duration-200">
          <Share2 className="w-5 h-5" />
          <span className="text-sm font-medium">share</span>
        </button>
      </div>
    </div>
  );
}
