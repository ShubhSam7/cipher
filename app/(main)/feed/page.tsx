import type { Metadata } from "next";
import FeedView from "@/components/feed/FeedView";

interface FeedPageProps {
  searchParams: Promise<{ tag?: string | string[] }>;
}

export async function generateMetadata({ searchParams }: FeedPageProps): Promise<Metadata> {
  const { tag } = await searchParams;
  return { title: typeof tag === "string" && tag ? `#${tag}` : "Feed" };
}

export default async function FeedPage({ searchParams }: FeedPageProps) {
  const { tag } = await searchParams;
  const activeTag = typeof tag === "string" && tag ? tag.toLowerCase() : null;
  return <FeedView key={activeTag ?? ""} tag={activeTag} />;
}
