import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="reading-column" aria-busy="true" aria-label="Loading">
      {[0, 1, 2].map((i) => (
        <div key={i} className="post-entry">
          <div className="mb-4 flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="mb-2 h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      ))}
    </div>
  );
}
