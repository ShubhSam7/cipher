"use client";
import { useCallback, useEffect, useState } from "react";
import { apiJSON } from "@/lib/apiFetch";
export function useApi<T>(url: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState(0);
  const refresh = useCallback(() => { setLoading(true); setRevision(value => value + 1); }, []);
  useEffect(() => {
    if (!url) return;
    const controller = new AbortController();
    apiJSON<T>(url, { signal: controller.signal }).then(value => {
      if (!controller.signal.aborted) { setData(value); setError(null); }
    }).catch(error => { if (!controller.signal.aborted) setError(error instanceof Error ? error.message : "Request failed"); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [url, revision]);
  return { data, error, loading, refresh };
}
