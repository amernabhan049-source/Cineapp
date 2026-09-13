"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Film, Lock, Mail, User, Phone, ArrowRight, AlertCircle } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const res = await register({ name, email, password, phone });
    if (!res.success) {
      setErrorMessage(res.error || "Registration failed");
      setIsSubmitting(false);
    } else {
      router.push("/");
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16 space-y-8">
      <div className="text-center space-y-2">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-rose-600 shadow-xl shadow-amber-500/20">
            <Film className="h-6 w-6 text-slate-950 font-bold" />
          </div>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Create CineBook Account
        </h1>
        <p className="text-xs text-slate-400">
          Join CineBook to enjoy early access ticketing, seat holds, and rewards.
        </p>
      </div>

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
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Morgan"
                className="w-full rounded-xl border border-white/10 bg-slate-950 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

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
                placeholder="alex@example.com"
                className="w-full rounded-xl border border-white/10 bg-slate-950 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">
              Phone Number (Optional)
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(555) 019-2834"
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
            <span>{isSubmitting ? "Creating Account..." : "Create Free Account"}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-white/5">
          <span className="text-xs text-slate-400">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="font-bold text-amber-400 hover:underline"
            >
              Sign In
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
}
