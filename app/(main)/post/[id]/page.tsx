"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import TopBar from "@/components/feed/TopBar";
import Sidebar from "@/components/feed/Sidebar";
import PostCard from "@/components/feed/PostCard";
import CommentSection from "@/components/feed/CommentSection";

interface Post {
  id: string;
  content: string;
  mediaURL: string[];
  mediaType: string[];
  createdAt: string;
  author: {
    id: string;
    user_handle: string;
    avatar: string | null;
  };
  community: {
    id: string;
    name: string;
    slug: string;
    avatar: string | null;
  } | null;
  likeCount: number;
  isLikedByUser: boolean;
  commentCount: number;
  hashtags: {
    id: string;
    name: string;
  }[];
}

export default function SinglePostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params?.id as string;

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!postId) return;

    // Reset state when postId changes
    setPost(null);
    setError(null);
    setLoading(true);

    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/v1/posts?postId=${postId}`, {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Post not found");
        }

        const data = await response.json();

        // Handle both single post and array response
        if (data.post) {
          setPost(data.post);
        } else if (data.posts && data.posts.length > 0) {
          setPost(data.posts[0]);
        } else {
          throw new Error("Post not found");
        }

        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load post");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

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
    <div className="min-h-screen bg-black">
      <TopBar onCreatePost={() => {}} />

      <div className="flex">
        <Sidebar />

        {/* Main Content Area */}
        <main className="flex-1 max-w-4xl mx-auto px-4 py-6">
          {/* Back Button */}
          <button
            onClick={() => router.push("/feed")}
            className="mb-6 flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Feed</span>
          </button>

          {/* Loading State */}
          {loading && (
            <div className="bg-black/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800/50 animate-pulse">
              <div className="h-4 bg-gray-800 rounded w-1/4 mb-4"></div>
              <div className="h-20 bg-gray-800 rounded"></div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-red-400 text-center">
              <p className="mb-4">{error}</p>
              <button
                onClick={() => router.push("/feed")}
                className="px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/20 text-cyan-400 rounded-xl transition-all duration-200"
              >
                Return to Feed
              </button>
            </div>
          )}

          {/* Post Display */}
          {!loading && !error && post && (
            <>
              <PostCard
                username={
                  post.community
                    ? `c/${post.community.name}`
                    : `u/${post.author.user_handle}`
                }
                timestamp={formatTimestamp(post.createdAt)}
                content={post.content}
                initialLikes={post.likeCount}
                initialComments={post.commentCount}
                id={post.id}
              />

              {/* Comment Section */}
              <CommentSection postId={post.id} />
            </>
          )}
        </main>

        {/* Right Sidebar Placeholder */}
        <aside className="w-80 p-4 hidden lg:block"></aside>
      </div>
    </div>
  );
}
