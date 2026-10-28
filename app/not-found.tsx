import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center">
      <p className="text-6xl font-bold text-primary">404</p>
      <h1 className="text-2xl font-semibold">This page doesn&apos;t exist</h1>
      <p className="max-w-md text-muted-foreground">The link may be broken, or the post may have been removed.</p>
      <Button asChild className="mt-2 bg-primary text-primary-foreground hover:bg-primary/90">
        <Link href="/feed">Back to the feed</Link>
      </Button>
    </main>
  );
}
