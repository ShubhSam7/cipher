import { Skeleton } from "@/components/ui/skeleton";
import { PostSkeleton } from "@/components/feed/PostSkeleton";
export default function Loading() { return <div className="page-stack" aria-busy="true" aria-label="Loading"><Skeleton className="h-9 w-48"/><div>{[0,1,2].map(i => <PostSkeleton key={i}/>)}</div></div>; }
