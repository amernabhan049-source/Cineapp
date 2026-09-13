"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import {
  Film,
  Lock,
  Mail,
  Sparkles,
  ShieldCheck,
  User,
  ArrowRight,
  AlertCircle,
} from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/";

  const { login, loginDemo } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const res = await login(email, password);
    if (!res.success) {
      setErrorMessage(res.error || "Invalid credentials");
      setIsSubmitting(false);
    } else {
      router.push(redirectUrl);
    }
  };

  const handleDemoLogin = async (role: "USER" | "ADMIN") => {
    setIsSubmitting(true);
    setErrorMessage(null);
    const res = await loginDemo(role);
    if (!res.success) {
      setErrorMessage(res.error || "Demo login failed");
      setIsSubmitting(false);
    } else {
      router.push(role === "ADMIN" ? "/admin" : redirectUrl);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16 space-y-8">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-rose-600 shadow-xl shadow-amber-500/20">
            <Film className="h-6 w-6 text-slate-950 font-bold" />
          </div>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Welcome to CineBook
        </h1>
        <p className="text-xs text-slate-400">
          Sign in to access your digital tickets, booking history, and VIP perks.
        </p>
      </div>

      {/* 1-Click Instant Demo Login Box */}
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 space-y-3 backdrop-blur-xl">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-300">
          <Sparkles className="h-4 w-4 text-amber-400 animate-pulse" />
          <span>Quick 1-Click Demo Profiles</span>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => handleDemoLogin("USER")}
            disabled={isSubmitting}
            className="flex flex-col items-start rounded-xl border border-amber-500/30 bg-slate-950/80 p-3 text-left hover:bg-amber-500/20 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-white">
              <User className="h-3.5 w-3.5 text-amber-400" />
              <span>Customer Demo</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5">
              customer@cinebook.com
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleDemoLogin("ADMIN")}
            disabled={isSubmitting}
            className="flex flex-col items-start rounded-xl border border-rose-500/30 bg-slate-950/80 p-3 text-left hover:bg-rose-500/20 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-white">
              <ShieldCheck className="h-3.5 w-3.5 text-rose-400" />
              <span>Admin Demo</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5">
              admin@cinebook.com
            </span>
          </button>
        </div>
      </div>

      {/* Standard Credentials Form */}
      <div className="rounded-3xl border border-white/10 bg-slate-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-5">
        {errorMessage && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-semibold text-rose-300 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="customer@cinebook.com"
                className="w-full rounded-xl border border-white/10 bg-slate-950 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-white/10 bg-slate-950 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 py-3 text-xs font-black text-slate-950 shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 transition-all cursor-pointer"
          >
            <span>{isSubmitting ? "Signing in..." : "Sign In with Password"}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-white/5">
          <span className="text-xs text-slate-400">
            Don't have an account?{" "}
            <Link
              href="/auth/register"
              className="font-bold text-amber-400 hover:underline"
            >
              Create an Account
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-400">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
