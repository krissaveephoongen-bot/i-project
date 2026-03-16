"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/components/AuthProvider";
import {
  Eye,
  EyeOff,

const { Title, Text } = Typography;

export const dynamic = 'force-dynamic';

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (values: { email: string; password: string; remember: boolean }) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      await signIn(values.email, values.password);
      // Wait a moment for auth context to update
      setTimeout(() => {
        router.push('/');
      }, 100);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => setShowPassword((v) => !v);

  /* ------------------------------------------------------------------ */

  const fieldBase =
    "w-full py-2.5 text-sm text-slate-900 placeholder-slate-400 bg-white border rounded-lg outline-none transition-all duration-150";
  const fieldNormal =
    "border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20";
  const fieldError =
    "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20";

  return (
    <div className="min-h-screen flex">
      {/* ═══════════════════════ LEFT PANEL ═══════════════════════ */}
      <div className="hidden lg:flex lg:w-[52%] xl:w-[55%] relative flex-col bg-[#0A0F1E] overflow-hidden">
        {/* Animated grid */}
        <div
          className="absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(99,102,241,0.4) 1px, transparent 1px)," +
              "linear-gradient(90deg, rgba(99,102,241,0.4) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
            animation: "gridScroll 18s linear infinite",
          }}
        />

        {/* Radial gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/60 via-transparent to-violet-950/40 pointer-events-none" />

        {/* Glowing orbs */}
        <div className="absolute -top-10 -left-10 w-80 h-80 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 -right-10 w-72 h-72 rounded-full bg-violet-600/15 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-indigo-800/10 blur-3xl pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full px-14 py-14 justify-between">
          {/* ── Top section ── */}
          <div>
            {/* Logo */}
            <div className="flex items-center gap-3 mb-16">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-600 shadow-lg shadow-indigo-600/40">
                <span className="text-white font-black text-xl leading-none select-none">
                  i
                </span>
              </div>
              <span className="text-white font-bold text-2xl tracking-tight select-none">
                i-<span className="text-indigo-400">PROJECT</span>
              </span>
            </div>

            {/* Tagline */}
            <p className="text-indigo-400 text-sm font-semibold uppercase tracking-widest mb-4">
              Enterprise Project Management
            </p>
            <h1 className="text-4xl xl:text-[2.75rem] font-bold text-white leading-tight mb-5">
              Everything your
              <br />
              team needs to
              <br />
              <span className="text-indigo-400">ship faster.</span>
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed mb-14 max-w-sm">
              Streamline your workflow, collaborate in real-time, and deliver
              projects on time — every time.
            </p>

            {/* Feature bullets */}
            <div className="space-y-4">
              {features.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center">
                    <Icon className="w-4.5 h-4.5 text-indigo-400" />
                  </div>
                  <span className="text-slate-300 text-sm font-medium">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Bottom section ── */}
          <div className="border-t border-white/10 pt-6">
            <p className="text-slate-500 text-xs font-medium uppercase tracking-widest mb-3">
              Trusted by teams worldwide
            </p>
            <div className="flex items-center gap-1.5">
              {[1, 0.8, 0.6, 0.4, 0.25].map((opacity, i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-indigo-400"
                  style={{ opacity }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Keyframe styles */}
        <style>{`
          @keyframes gridScroll {
            from { background-position: 0 0; }
            to   { background-position: 44px 44px; }
          }
        `}</style>
      </div>

      {/* ═══════════════════════ RIGHT PANEL ══════════════════════ */}
      <div className="flex-1 flex flex-col items-center justify-center bg-white px-6 sm:px-12 py-16 min-h-screen">
        {/* Mobile-only logo */}
        <div className="flex lg:hidden items-center gap-2 mb-10">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600">
            <span className="text-white font-black text-sm leading-none select-none">
              i
            </span>
          </div>
          <span className="text-slate-900 font-bold text-xl tracking-tight select-none">
            i-<span className="text-indigo-600">PROJECT</span>
          </span>
        </div>

        {/* Form card */}
        <div className="w-full max-w-[420px]">
          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-slate-900 font-bold text-3xl tracking-tight">
              Welcome back
            </h2>
            <p className="text-slate-500 text-sm mt-2">
              Sign in to your account to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* ── Email ── */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail
                    className={`h-4 w-4 ${error ? "text-red-400" : "text-slate-400"}`}
                  />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@company.com"
                  className={`${fieldBase} pl-10 pr-4 ${error ? fieldError : fieldNormal}`}
                />
              </div>
            </div>

            {/* ── Password ── */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock
                    className={`h-4 w-4 ${error ? "text-red-400" : "text-slate-400"}`}
                  />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`${fieldBase} pl-10 pr-11 ${error ? fieldError : fieldNormal}`}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Forgot password */}
              <div className="mt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => router.push("/forgot-password")}
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            </div>

            {/* ── Error alert ── */}
            {error && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-red-500" />
                <div>
                  <p className="text-sm font-semibold text-red-700">
                    Login failed
                  </p>
                  <p className="text-sm text-red-600 mt-0.5">{error}</p>
                </div>
              </div>
            )}

            {/* ── Submit ── */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="
                w-full flex items-center justify-center gap-2 mt-1
                bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800
                text-white text-sm font-semibold
                py-2.5 rounded-lg
                shadow-md shadow-indigo-500/25
                hover:shadow-lg hover:shadow-indigo-500/30
                transition-all duration-150
                focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
                disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none
              "
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Signing in…
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          {/* ── Divider ── */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-[10px] font-semibold text-slate-300 uppercase tracking-widest">
                Secure Login
              </span>
            </div>
          </div>

          {/* ── Footer ── */}
          <div className="text-center space-y-1">
            <p className="text-xs text-slate-400">
              © {new Date().getFullYear()} i-PROJECT. All rights reserved.
            </p>
            <p className="text-[10px] text-slate-300 font-mono">v1.0.0</p>
          </div>
        </div>
      </div>
    </div>
  );
}
