"use client";
import { ErrorState } from "./ErrorState";
import { PostSkeleton } from "./feed/PostSkeleton";
export default function ResourceState({ error, retry }: { error: string | null; retry: () => void }) { return error ? <ErrorState body={error} retry={retry} compact/> : <div aria-label="Loading" aria-busy="true"><PostSkeleton/><PostSkeleton/></div>; }
