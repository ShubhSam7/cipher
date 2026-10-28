"use client";

import { useState, useEffect, useCallback } from "react";
import TopBar from "@/components/feed/TopBar";
import Sidebar from "@/components/feed/Sidebar";
import MobileSidebar from "@/components/feed/MobileSidebar";
import PostCard from "@/components/feed/PostCard";
import CreatePostModal from "@/components/feed/CreatePostModal";

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
    bio: string | null;
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

interface PostsResponse {
  posts: Post[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalPosts: number;
    hasMore: boolean;
  };
}

export default function Feed() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [trendingTags, setTrendingTags] = useState<
    { id: string; name: string }[]
  >([]);
  const [trendingLoading, setTrendingLoading] = useState(true);
  const [trendingError, setTrendingError] = useState<string | null>(null);

  // Fetch posts
  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/v1/posts?page=${page}&limit=10`, {
        credentials: "include", // Important for auth cookies
      });

      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }

      const data: PostsResponse = await response.json();

      // Append new posts to existing ones (for "Load More")
      // Filter out duplicates based on post ID
      setPosts((prevPosts) => {
        const existingIds = new Set(prevPosts.map((p) => p.id));
        const newPosts = data.posts.filter((p) => !existingIds.has(p.id));
        return [...prevPosts, ...newPosts];
      });
      setHasMore(data.pagination.hasMore);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const fetchTrendingTags = useCallback(async () => {
    try {
      setTrendingLoading(true);
      const response = await fetch("/api/v1/trending", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch trending hashtags");
      }

      const data = await response.json();
      setTrendingTags(
        Array.isArray(data.tags)
          ? data.tags.map((tag: { id: string; name: string }) => ({
              id: tag.id,
              name: tag.name,
            }))
          : []
      );
      setTrendingError(null);
    } catch (err) {
      setTrendingError(
        err instanceof Error ? err.message : "Unable to load trending hashtags"
      );
    } finally {
      setTrendingLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrendingTags();
  }, [fetchTrendingTags]);

  const loadMore = () => {
    if (hasMore && !loading) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  // Format timestamp for display
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
      <TopBar 
        onCreatePost={() => setIsCreateModalOpen(true)} 
        onMenuClick={() => setIsMobileMenuOpen(true)}
      />
      
      <MobileSidebar 
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      <div className="flex">
        <Sidebar />

        {/* Main Feed Area */}
        <main className="flex-1 max-w-4xl mx-auto px-4 py-6 space-y-4">
          {/* Welcome Message */}
          

          {/* Error State */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-red-400">
              {error}
            </div>
          )}

          {/* Loading State (First Load) */}
          {loading && posts.length === 0 && (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="bg-black/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800/50 animate-pulse"
                >
                  <div className="h-4 bg-gray-800 rounded w-1/4 mb-4"></div>
                  <div className="h-20 bg-gray-800 rounded"></div>
                </div>
              ))}
            </div>
          )}

          {/* Posts Feed */}
          {posts.map((post) => (
            <PostCard
              key={post.id}
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
              // Optional: pass additional props if needed
              // avatar={post.author.avatar}
              // hashtags={post.hashtags}
              // media={post.mediaURL}
            />
          ))}

          {/* Empty State */}
          {!loading && posts.length === 0 && !error && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                No posts yet. Be the first to share something! 🚀
              </p>
            </div>
          )}

          {/* Load More Button */}
          {hasMore && posts.length > 0 && (
            <div className="flex justify-center pt-6">
              <button
                onClick={loadMore}
                disabled={loading}
                className="px-6 py-3 bg-black/50 hover:bg-gray-900 border border-gray-800 text-gray-400 hover:text-white rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Loading..." : "Load More Posts"}
              </button>
            </div>
          )}
        </main>

        {/* Right Sidebar */}
        <aside className="w-80 p-4 hidden lg:block">
          <div className="sticky top-20 space-y-4">
            {/* Trending Topics */}
            <div className="bg-black/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-800/50">
              <h3 className="text-white font-semibold mb-3">Trending on your campus</h3>
              <div className="space-y-2">
                {trendingLoading && (
                  <p className="text-sm text-gray-500">
                    Loading trending hashtags...
                  </p>
                )}
                {trendingError && (
                  <p className="text-sm text-red-400">{trendingError}</p>
                )}
                {!trendingLoading &&
                  !trendingError &&
                  trendingTags.length === 0 && (
                    <p className="text-sm text-gray-500">
                      No trending hashtags yet.
                    </p>
                  )}
                {trendingTags.map((hashtag) => (
                  <div
                    key={hashtag.id}
                    className="text-sm text-gray-500 hover:text-cyan-400 cursor-pointer transition-colors"
                  >
                    #{hashtag.name}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onPostCreated={() => {
          // Refresh posts after creating a new one
          setPosts([]);
          setPage(1);
          fetchPosts();
          fetchTrendingTags();
        }}
      />
    </div>
  );
}
