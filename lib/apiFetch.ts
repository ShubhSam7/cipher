"use client";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/store/authStore";
let redirecting = false;
export async function apiFetch(input: RequestInfo | URL, init?: RequestInit) {
  const response = await fetch(input, { credentials: "include", ...init });
  if (response.status === 401 && typeof window !== "undefined") {
    useAuthStore.getState().clear();
    if (!redirecting) {
      redirecting = true;
      toast.error("Session expired");
      window.location.assign(`/signin?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
    }
  }
  return response;
}
export async function apiJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await apiFetch(url, init);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Request failed");
  return data as T;
}
export function jsonBody(method: string, body?: unknown): RequestInit {
  return { method, headers: { "Content-Type": "application/json" }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) };
}
