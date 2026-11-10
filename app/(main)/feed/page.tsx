import type { Metadata } from "next";
import FeedView from "@/components/feed/FeedView";

interface FeedPageProps {
  searchParams: Promise<{ tag?: string | string[]; q?: string | string[] }>;
}

export async function generateMetadata({ searchParams }: FeedPageProps): Promise<Metadata> {
  const { tag, q } = await searchParams;
  return { title: typeof q === "string" && q.trim() ? `Search: ${q.trim()}` : typeof tag === "string" && tag ? `#${tag}` : "Feed" };
}

export default async function FeedPage({ searchParams }: FeedPageProps) {
  const { tag, q } = await searchParams;
  const activeTag = typeof tag === "string" && tag ? tag.toLowerCase() : null;
  const query = typeof q === "string" ? q.trim() : "";
  return <FeedView key={JSON.stringify([activeTag, query])} tag={activeTag} query={query} />;
}
