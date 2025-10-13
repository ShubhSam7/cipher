"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

// Custom hook for logout functionality
export const useLogout = () => {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const logout = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/v1/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Logged out successfully! Redirecting...");
        setTimeout(() => {
          router.push(data.redirectTo || "/");
        }, 2000);
      } else {
        setError(data.error || "Failed to logout");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return { logout, loading, error, success };
};
