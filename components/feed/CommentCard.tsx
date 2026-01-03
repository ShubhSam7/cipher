"use client";

import { useState } from "react";

interface CommentCardProps {
  id: string;
  content: string;
  author: {
    user_handle: string;
    avatar: string | null;
  };
  createdAt: string;
  replies?: CommentCardProps[];
  onReply: (commentId: string) => void;
  level?: number;
}

export default function CommentCard({
  id,
  content,
  author,
  createdAt,
  replies = [],
  onReply,
  level = 0,
}: CommentCardProps) {
  const [showReplies, setShowReplies] = useState(false);

  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}min ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <div className={`${level > 0 ? "ml-12 mt-3" : "mt-4"}`}>
      <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-gray-800/30">
        {/* Comment Header */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
            <span className="text-white font-semibold text-xs">
              {author.user_handle.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1">
            <p className="text-white/80 font-medium text-sm">
              {author.user_handle}
            </p>
            <p className="text-gray-500 text-xs">{formatTimestamp(createdAt)}</p>
          </div>
        </div>

        {/* Comment Content */}
        <p className="text-gray-300 text-sm leading-relaxed mb-3">{content}</p>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {/* Only allow replies on top-level comments (level 0) */}
          {level === 0 && (
            <button
              onClick={() => onReply(id)}
              className="text-xs text-gray-500 hover:text-cyan-400 transition-colors"
            >
              Reply
            </button>
          )}

          {/* Show/Hide Replies */}
          {replies.length > 0 && (
            <button
              onClick={() => setShowReplies(!showReplies)}
              className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              {showReplies ? "Hide" : "Show"} {replies.length}{" "}
              {replies.length === 1 ? "reply" : "replies"}
            </button>
          )}
        </div>
      </div>

      {/* Nested Replies (only 1 level deep) */}
      {showReplies && replies.length > 0 && (
        <div>
          {replies.map((reply) => (
            <CommentCard
              key={reply.id}
              {...reply}
              onReply={onReply}
              level={1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
