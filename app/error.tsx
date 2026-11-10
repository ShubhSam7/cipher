"use client";
import { ErrorState } from "@/components/ErrorState";
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) { return <main className="page-stack p-8"><ErrorState body="This page could not load. Please try again." retry={reset}/></main>; }
