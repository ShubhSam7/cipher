"use client";
import { useEffect } from "react";
import { ErrorState } from "@/components/ErrorState";
export default function MainError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) { useEffect(() => { console.error(error); }, [error]); return <ErrorState body="This page could not load. Please try again." retry={reset}/>; }
