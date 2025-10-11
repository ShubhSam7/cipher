import { useRouter } from "next/router";
import { useState } from "react";

export const logout = async () => {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();
  const [loading, setLoading] = useState(false);

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
      setSuccess("Logout out successfully! Redirecting...");
      setTimeout(() => {
        router.push(data.redirectTo || "/");
      }, 2000);
    } else {
      setError(data.error || "Failed to create account");
    }
  } catch {
    setError("Network error. Please try again.");
  } finally {
    setLoading(false);
  }
};
