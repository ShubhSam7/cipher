"use client";

import { ReactElement, useState } from "react";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";

type step_type = "email" | "username";

export default function SignInPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [currentStep, setCurrentStep] = useState<step_type>("email");
  const [formData, setFormData] = useState({
    user_handle: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

////////////////////////////////////////////////////////////////

  const handleSignInwithEmail = async () => {
    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/v1/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          step: "email",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        login(data.token, data.user);
        router.push("/feed");
      } else {
        setError(data.error || "Sign in failed");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignInwithUsername = async () => {
      if (!formData.user_handle || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/v1/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_handle: formData.user_handle,
          password: formData.password,
          step: "username",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        login(data.token, data.user);
        router.push("/feed");
      } else {
        setError(data.error || "Sign in failed");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const choose_email = ():ReactElement => {
    return(<div className="space-y-6 text-black">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                placeholder="your.email@iiitn.ac.in"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                placeholder="Enter your password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>

            <Button
              onClick={handleSignInwithEmail}
              disabled={loading || !formData.email || !formData.password}
              className="w-full"
            >
              {loading ? "Signing In..." : "Sign In"}
            </Button>
          </div>)
  }

  const choose_username = ():ReactElement => {
    return(<div className="space-y-6 text-black">
            <div>
              <label
                htmlFor="Username"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Username
              </label>
              <input
                type="text"
                id="username"
                placeholder="Your unique username"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                value={formData.user_handle}
                onChange={(e) =>
                  setFormData({ ...formData, user_handle: e.target.value })
                }
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                placeholder="Enter your password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>

            <Button
              onClick={handleSignInwithUsername}
              disabled={loading || !formData.user_handle || !formData.password}
              className="w-full"
            >
              {loading ? "Signing In..." : "Sign In"}
            </Button>
          </div>)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome Back
            </h2>
            <p className="text-gray-600">Sign in to your account</p>
          </div>

          <div className="text-black">
            Choose to signin with Email or Username
            <div className="flex justify-center space-x-2">
              <Button 
                className="border-2 border-b-4"
                onClick={(e) => {
                  setCurrentStep("email");
                }}
              >
                Email
              </Button>
              <Button
                className="border-2 border-b-4"
                onClick={(e) => {
                  setCurrentStep("username");
                }}
              >
                Username
              </Button>
            </div>
          </div>

          

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {currentStep === "email" && choose_email()}
          {currentStep === "username" && choose_username()}
          
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Dont have an account?{" "}
              <button
                onClick={() => router.push("/signup")}
                className="text-cyan-600 hover:text-cyan-500 font-medium"
              >
                Sign Up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
