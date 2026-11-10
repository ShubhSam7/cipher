"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { apiJSON } from "@/lib/apiFetch";

export function useApi<T>(url: string | null) {
  const [revision, setRevision] = useState(0);
  const request = useMemo(() => ({ url, revision }), [url, revision]);
  const [result, setResult] = useState<{ request: typeof request; data: T | null; error: string | null } | null>(null);
  const refresh = useCallback(() => setRevision(value => value + 1), []);

  useEffect(() => {
    if (!request.url) return;
    const controller = new AbortController();
    apiJSON<T>(request.url, { signal: controller.signal }).then(data => {
      if (!controller.signal.aborted) setResult({ request, data, error: null });
    }).catch(error => {
      if (!controller.signal.aborted) setResult(previous => ({
        request, data: previous?.request.url === request.url ? previous.data : null,
        error: error instanceof Error ? error.message : "Request failed",
      }));
    });
    return () => controller.abort();
  }, [request]);

  const current = result?.request.url === url ? result : null;
  const loading = !!url && current?.request !== request;
  return { data: current?.data ?? null, error: loading ? null : current?.error ?? null, loading, refresh };
}
