import { Doodle } from "@/components/decor/Doodles";
import { AmbientBackground } from "@/components/decor/AmbientBackground";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <AmbientBackground intensity="public" /><Doodle name="Burst"/><p className="text-6xl font-bold gradient-text">404</p>
      <h1 className="text-2xl font-semibold">This page doesn&apos;t exist</h1>
      <p className="max-w-md text-muted-foreground">The link may be broken, or the post may have been removed.</p>
      <Button asChild className="mt-2">
        <Link href="/feed">Back to the feed</Link>
      </Button><Button asChild variant="outline"><Link href="/">Home</Link></Button>
    </main>
  );
}
