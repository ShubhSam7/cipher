"use client";

import { useState, useEffect } from "react";
import CommentCard from "./CommentCard";
import { Send } from "lucide-react";

interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    user_handle: string;
    avatar: string | null;
  };
  createdAt: string;
  parentId: string | null;
}

interface CommentSectionProps {
  postId: string;
}

export default function CommentSection({ postId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!postId) {
      console.error("Cannot fetch comments: postId is missing");
      setError("Unable to load comments - post ID is missing");
      setLoading(false);
      return;
    }

    const fetchComments = async () => {
      try {
        setLoading(true);
        console.log("Fetching comments for postId:", postId);

        const response = await fetch(`/api/v1/comments?postId=${postId}`, {
          credentials: "include",
        });

        const data = await response.json();
        console.log("Comments API response:", data);

        if (!response.ok) {
          console.error("Failed to fetch comments:", data);
          throw new Error(data.error || data.msg || "Failed to fetch comments");
        }

        setComments(Array.isArray(data.comments) ? data.comments : []);
        setError(null);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load comments";
        setError(errorMessage);
        console.error("Fetch comments error:", errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [postId]);

  // Separate function to refresh comments (e.g., after posting)
  const refreshComments = async () => {
    if (!postId) return;

    try {
      setLoading(true);
      console.log("Refreshing comments for postId:", postId);

      const response = await fetch(`/api/v1/comments?postId=${postId}`, {
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        setComments(Array.isArray(data.comments) ? data.comments : []);
        setError(null);
      }
    } catch (err) {
      console.error("Refresh comments error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;

    try {
      setSubmitting(true);
      setError(null); // Clear previous errors

      const payload: {
        content: string;
        postId: string;
        parentId?: string;
      } = {
        content: newComment.trim(),
        postId,
      };

      // Only include parentId if it's not null
      if (replyTo) {
        payload.parentId = replyTo;
      }

      console.log("Submitting comment with payload:", payload);

      const response = await fetch("/api/v1/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log("Comment response:", { status: response.status, data });

      if (!response.ok) {
        // Show detailed error from API
        if (data.details) {
          // Zod validation errors
          const errorMsg = data.details
            .map((d: any) => `${d.path.join(".")}: ${d.message}`)
            .join(", ");
          throw new Error(`Validation error: ${errorMsg}`);
        } else {
          throw new Error(data.error || "Failed to post comment");
        }
      }

      // Refresh comments
      await refreshComments();
      setNewComment("");
      setReplyTo(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to post comment";
      setError(errorMessage);
      console.error("Comment post error:", errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = (commentId: string) => {
    setReplyTo(commentId);
    // Focus on the input (you can add a ref if needed)
  };

  // Organize comments into tree structure
  const topLevelComments = comments.filter((c) => !c.parentId);
  const getReplies = (commentId: string) =>
    comments.filter((c) => c.parentId === commentId);

  return (
    <div className="mt-8">
      <h3 className="text-2xl font-bold text-white mb-6">
        Comments ({comments.length})
      </h3>

      {/* Add Comment Form */}
      <form onSubmit={handleSubmitComment} className="mb-8">
        <div className="bg-black/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-800/50">
          {replyTo && (
            <div className="mb-3 flex items-center gap-2">
              <span className="text-sm text-cyan-400">Replying to comment</span>
              <button
                type="button"
                onClick={() => setReplyTo(null)}
                className="text-xs text-gray-500 hover:text-white"
              >
                Cancel
              </button>
            </div>
          )}
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={replyTo ? "Write a reply..." : "Write a comment..."}
            className="w-full bg-transparent text-white placeholder-gray-500 resize-none outline-none min-h-[80px]"
            maxLength={500}
          />
          <div className="flex justify-between items-center mt-3">
            <span className="text-xs text-gray-500">
              {newComment.length}/500
            </span>
            <button
              type="submit"
              disabled={!newComment.trim() || submitting}
              className="px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/20 text-cyan-400 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? "Posting..." : "Post"}</span>
            </button>
          </div>
        </div>
      </form>

      {/* Error Display */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 text-red-400">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8 text-gray-500">
          Loading comments...
        </div>
      )}

      {/* Comments List */}
      {!loading && topLevelComments.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No comments yet. Be the first to comment!
        </div>
      )}

      {!loading &&
        topLevelComments.map((comment) => (
          <CommentCard
            key={comment.id}
            id={comment.id}
            content={comment.content}
            author={comment.author}
            createdAt={comment.createdAt}
            replies={getReplies(comment.id).map((reply) => ({
              id: reply.id,
              content: reply.content,
              author: reply.author,
              createdAt: reply.createdAt,
              onReply: handleReply,
            }))}
            onReply={handleReply}
          />
        ))}
    </div>
  );
}
