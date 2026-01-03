"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { generateAnonymousHandle, cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";

type SignupStep = "email" | "otp" | "complete";

interface FormData {
  email: string;
  otp: string;
  user_handle: string;
  password: string;
  confirmPassword: string;
}

export default function SignupPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [currentStep, setCurrentStep] = useState<SignupStep>("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [otpTimer, setOtpTimer] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    email: "",
    otp: "",
    user_handle: "",
    password: "",
    confirmPassword: "",
  });

  const startOtpTimer = () => {
    setOtpTimer(600); // 10 minutes
    const interval = setInterval(() => {
      setOtpTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSendOtp = async () => {
    if (!formData.email.match(/^bt\d{2}[a-z]{3}\d{3}@iiitn\.ac\.in$/)) {
      setError("Please enter a valid IIITN email (format: bt22cse001@iiitn.ac.in)");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/v1/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          step: "send-otp",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`OTP sent to ${data.email}`);
        setCurrentStep("otp");
        startOtpTimer();
      } else {
        setError(data.error || "Failed to send OTP");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (formData.otp.length !== 6) {
      setError("Please enter a 6-digit OTP");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/v1/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          otp: formData.otp,
          step: "verify-otp",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Email verified successfully!");
        setCurrentStep("complete");
        // Generate a random username as suggestion
        setFormData(prev => ({
          ...prev,
          user_handle: generateAnonymousHandle()
        }));
      } else {
        setError(data.error || "Invalid OTP");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const checkPasswordStrength = (password: string) => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
    const score = Object.values(checks).filter(Boolean).length;
    return { checks, score };
  };

  const handleCompleteSignup = async () => {
    const { score } = checkPasswordStrength(formData.password);

    if (!formData.user_handle.match(/^[a-zA-Z0-9_]+$/)) {
      setError("Username can only contain letters, numbers, and underscores");
      return;
    }

    if (formData.user_handle.length < 3) {
      setError("Username must be at least 3 characters long");
      return;
    }

    if (score < 3) {
      setError("Password is too weak. Please include uppercase, lowercase, numbers, and special characters");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/v1/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          user_handle: formData.user_handle,
          password: formData.password,
          step: "complete-signup",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Account created successfully! Redirecting...");
        login(data.token, data.user);
        setTimeout(() => {
          router.push(data.redirectTo || "/feed");
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

  const renderStepIndicator = () => {
    const steps = [
      { id: "email", label: "Email", number: 1 },
      { id: "otp", label: "Verify", number: 2 },
      { id: "complete", label: "Create", number: 3 },
    ];

    return (
      <div className="flex items-center justify-center mb-8">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                currentStep === step.id
                  ? "bg-cyan-500 text-white"
                  : steps.findIndex(s => s.id === currentStep) > index
                  ? "bg-green-500 text-white"
                  : "bg-gray-300 text-gray-600"
              )}
            >
              {steps.findIndex(s => s.id === currentStep) > index ? "" : step.number}
            </div>
            <span className="ml-2 text-sm font-medium text-gray-700">
              {step.label}
            </span>
            {index < steps.length - 1 && (
              <div className="w-8 h-0.5 bg-gray-300 mx-4" />
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderEmailStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Enter your IIITN Email
        </h2>
        <p className="text-gray-600">
          We&apos;ll send you a verification code to confirm your identity
        </p>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          Email Address
        </label>
        <input
          type="email"
          id="email"
          placeholder="bt22cse001@iiitn.ac.in"
          className="w-full px-4 text-black py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
        <p className="text-xs text-gray-500 mt-1">
          Use your official IIITN email address
        </p>
      </div>

      <Button
        onClick={handleSendOtp}
        disabled={loading || !formData.email}
        className="w-full text-black border"
      >
        {loading ? "Sending..." : "Send Verification Code"}
      </Button>
    </div>
  );

  const renderOtpStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Verify Your Email
        </h2>
        <p className="text-gray-600">
          Enter the 6-digit code sent to your email
        </p>
        {otpTimer > 0 && (
          <p className="text-sm text-cyan-600 mt-2">
            Code expires in {formatTime(otpTimer)}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
          Verification Code
        </label>
        <input
          type="text"
          id="otp"
          placeholder="123456"
          maxLength={6}
          className="w-full px-4 py-3 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-center text-2xl tracking-widest"
          value={formData.otp}
          onChange={(e) => setFormData({ ...formData, otp: e.target.value.replace(/\D/g, '') })}
        />
      </div>

      <div className="flex gap-3">
        <Button
          onClick={handleVerifyOtp}
          disabled={loading || formData.otp.length !== 6}
          className="flex-1"
        >
          {loading ? "Verifying..." : "Verify Code"}
        </Button>
        <Button
          variant="outline"
          onClick={handleSendOtp}
          disabled={loading || otpTimer > 540} // Allow resend after 1 minute
        >
          Resend
        </Button>
      </div>
    </div>
  );

  const renderCompleteStep = () => {
    const { checks, score } = checkPasswordStrength(formData.password);

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Create Your Account
          </h2>
          <p className="text-gray-600">
            Choose a username and secure password for anonymity
          </p>
        </div>

        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
            Anonymous Username
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              id="username"
              placeholder="your_anonymous_handle"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              value={formData.user_handle}
              onChange={(e) => setFormData({ ...formData, user_handle: e.target.value })}
            />
            <Button
              variant="outline"
              onClick={() => setFormData(prev => ({ ...prev, user_handle: generateAnonymousHandle() }))}
            >
              Generate
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            This will be your public identity. Choose wisely for anonymity.
          </p>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <input
            type="password"
            id="password"
            placeholder="Create a strong password"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
          {formData.password && (
            <div className="mt-2">
              <div className="flex gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className={cn(
                      "h-1 flex-1 rounded",
                      i <= score
                        ? score <= 2 ? "bg-red-500" : score <= 3 ? "bg-yellow-500" : "bg-green-500"
                        : "bg-gray-200"
                    )}
                  />
                ))}
              </div>
              <div className="text-xs space-y-1">
                <div className={checks.length ? "text-green-600" : "text-gray-400"}>
                   At least 8 characters
                </div>
                <div className={checks.uppercase ? "text-green-600" : "text-gray-400"}>
                   Uppercase letter
                </div>
                <div className={checks.lowercase ? "text-green-600" : "text-gray-400"}>
                   Lowercase letter
                </div>
                <div className={checks.number ? "text-green-600" : "text-gray-400"}>
                   Number
                </div>
                <div className={checks.special ? "text-green-600" : "text-gray-400"}>
                   Special character
                </div>
              </div>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
            Confirm Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            placeholder="Confirm your password"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
          />
          {formData.confirmPassword && formData.password !== formData.confirmPassword && (
            <p className="text-red-500 text-xs mt-1">Passwords do not match</p>
          )}
        </div>

        <Button
          onClick={handleCompleteSignup}
          disabled={loading || score < 3 || formData.password !== formData.confirmPassword || !formData.user_handle}
          className="w-full"
        >
          {loading ? "Creating Account..." : "Create Account"}
        </Button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {renderStepIndicator()}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
              {success}
            </div>
          )}

          {currentStep === "email" && renderEmailStep()}
          {currentStep === "otp" && renderOtpStep()}
          {currentStep === "complete" && renderCompleteStep()}

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <button
                onClick={() => router.push("/signin")}
                className="text-cyan-600 hover:text-cyan-500 font-medium"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}