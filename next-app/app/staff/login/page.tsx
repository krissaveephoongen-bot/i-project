"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Eye,
  EyeOff,
  AlertCircle,
  Briefcase,
  Lock,
  Mail,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "../../components/AuthProvider";

export default function StaffLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const router = useRouter();

  const { signIn, forgotPassword } = useAuth();

  useEffect(() => {
    // Check for remembered email on component mount
    const rememberedEmail = localStorage.getItem("remembered_email");
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }

    // Listen for remembered email updates
    const handleRememberedEmail = (event: CustomEvent) => {
      setEmail(event.detail);
      setRememberMe(true);
    };

    window.addEventListener(
      "rememberedEmail",
      handleRememberedEmail as EventListener,
    );
    return () =>
      window.removeEventListener(
        "rememberedEmail",
        handleRememberedEmail as EventListener,
      );
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      await signIn(email, password, rememberMe);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (!email) {
      setError("กรุณาระบุอีเมลก่อนคลิกลืมรหัสผ่าน");
      return;
    }

    setForgotPasswordLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      await forgotPassword(email);
      setSuccessMessage(
        "ส่งอีเมลรีเซ็ตรหัสผ่านเรียบร้อยแล้ว กรุณาตรวจสอบอีเมลของคุณ",
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to send reset email",
      );
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 overflow-hidden">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 border-4 border-white rounded-full"></div>
          <div className="absolute bottom-20 right-20 w-24 h-24 border-4 border-white rounded-lg transform rotate-45"></div>
          <div className="absolute top-1/2 left-1/3 w-16 h-16 border-4 border-white rounded-full"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center text-white p-12">
          <div className="mb-8">
            <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center shadow-2xl">
              <span className="text-4xl font-bold text-slate-900">IP</span>
            </div>
          </div>

          <h1 className="text-6xl font-bold mb-6">I-PROJECT</h1>
          <p className="text-xl text-blue-200 mb-10">
            Enterprise Project Management System
          </p>

          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
              <span className="text-gray-200 font-medium text-lg">
                Robust Security & Authentication
              </span>
            </div>
            <div className="flex items-center gap-4">
              <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
              <span className="text-gray-200 font-medium text-lg">
                Real-time Project Visibility & Tracking
              </span>
            </div>
            <div className="flex items-center gap-4">
              <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
              <span className="text-gray-200 font-medium text-lg">
                Seamless Team Collaboration Tools
              </span>
            </div>
            <div className="flex items-center gap-4">
              <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
              <span className="text-gray-200 font-medium text-lg">
                Comprehensive Reporting & Analytics
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile: Logo and Branding */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <span className="text-3xl font-bold text-white">IP</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-3">
              I-PROJECT
            </h1>
            <p className="text-lg text-gray-600">
              Enterprise Project Management System
            </p>
          </div>

          {/* Login Header */}
          <div className="mb-10 text-center lg:text-left">
            <div className="hidden lg:flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center shadow-md">
                <User className="w-7 h-7 text-blue-600" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900">Sign In</h2>
            </div>
            <h2 className="lg:hidden text-3xl font-bold text-slate-900 mb-4">
              Sign In
            </h2>
            <p className="text-gray-600 text-lg">
              Welcome back! Please sign in to your account.
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error/Success Messages - Fixed Positioning */}
            {error && (
              <div className="fixed top-4 right-4 z-50 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 shadow-lg max-w-sm animate-in slide-in-from-top-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}

            {successMessage && (
              <div className="fixed top-4 right-4 z-50 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3 shadow-lg max-w-sm animate-in slide-in-from-top-2">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <p className="text-sm text-green-700 font-medium">
                  {successMessage}
                </p>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-700"
              >
                อีเมล
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all text-gray-900 placeholder-gray-400 shadow-sm"
                  placeholder="กรุณาระบุอีเมล"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-gray-700"
              >
                รหัสผ่าน
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all text-gray-900 placeholder-gray-400 shadow-sm"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-600 border-gray-300 rounded"
                />
                <label
                  htmlFor="remember"
                  className="ml-2 block text-sm text-gray-700 font-medium"
                >
                  จดจำฉันไว้
                </label>
              </div>
              <a
                href="#"
                onClick={handleForgotPassword}
                className="text-sm text-blue-600 hover:text-blue-700 font-semibold transition-colors"
              >
                {forgotPasswordLoading ? "กำลังส่ง..." : "ลืมรหัสผ่าน?"}
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-4 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl text-lg"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  กำลังเข้าสู่ระบบ...
                </span>
              ) : (
                "เข้าสู่ระบบ"
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-10 text-center">
            <p className="text-sm text-gray-600">
              มีปัญหาในการเข้าสู่ระบบ?{" "}
              <a
                href="#"
                className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
              >
                ติดต่อ IT Support
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
