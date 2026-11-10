import { Skeleton } from "@/components/ui/skeleton";
export function PostSkeleton() { return <div className="post-entry" aria-hidden="true"><div className="flex items-center gap-3 mb-4"><Skeleton className="h-10 w-10 rounded-full"/><Skeleton className="h-4 w-40"/></div><Skeleton className="h-4 w-full mb-3"/><Skeleton className="h-4 w-4/5 mb-3"/><Skeleton className="h-4 w-1/2"/></div>; }
