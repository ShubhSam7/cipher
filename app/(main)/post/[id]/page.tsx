import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "@/lib/session";
import { getPostById } from "@/lib/postQueries";
import PostCard from "@/components/feed/PostCard";
import CommentSection from "@/components/feed/CommentSection";
import BackButton from "@/components/BackButton";

interface PostPageProps {
  params: Promise<{ id: string }>;
}

async function loadPost(id: string) {
  const session = await getServerSession();
  if (!session.success) redirect("/signin");
  return getPostById(id, session.userId);
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const post = await loadPost((await params).id);
  if (!post) return { title: "Post not found" };
  const excerpt = post.content.length > 140 ? `${post.content.slice(0, 137)}…` : post.content;
  return {
    title: `u/${post.author.user_handle}: ${excerpt.slice(0, 50)}`,
    description: excerpt,
    openGraph: { title: `Post by u/${post.author.user_handle}`, description: excerpt },
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const post = await loadPost((await params).id);
  if (!post) notFound();

  return (
    <div className="reading-column">
      <BackButton label="Back" />
      <h1 className="sr-only">Post by u/{post.author.user_handle}</h1>
      <PostCard post={post} isDetail />
      <CommentSection key={post.id} postId={post.id} postAuthorId={post.author.id} />
    </div>
  );
}
