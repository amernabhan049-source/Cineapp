"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import {
  ShieldCheck,
  LayoutDashboard,
  Film,
  Calendar,
  Building2,
  Ticket,
  ScrollText,
  ChevronLeft,
  QrCode,
  Sparkles,
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, loginDemo } = useAuth();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "ADMIN")) {
      // Optional redirect or stay to prompt login
    }
  }, [user, isLoading]);

  const navItems = [
    { href: "/admin", label: "Overview & Analytics", icon: LayoutDashboard },
    { href: "/admin/movies", label: "Manage Movies", icon: Film },
    { href: "/admin/showtimes", label: "Showtime Scheduler", icon: Calendar },
    { href: "/admin/cinemas", label: "Cinemas & Auditoriums", icon: Building2 },
    { href: "/admin/bookings", label: "Bookings & QR Scanner", icon: QrCode },
    { href: "/admin/audit-logs", label: "Security & Audit Logs", icon: ScrollText },
  ];

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center text-xs text-slate-400">
        Loading admin console...
      </div>
    );
  }

  // If not logged in as Admin, show high-utility quick login card
  if (!user || user.role !== "ADMIN") {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-rose-500/20 border border-rose-500/30 text-rose-400 shadow-2xl">
          <ShieldCheck className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-white">
            Admin Access Required
          </h1>
          <p className="text-xs text-slate-400">
            You are currently signed in as {user?.email || "Guest"}. Please switch to an Administrator profile to manage movies, schedules, bookings, and audit logs.
          </p>
        </div>

        <button
          onClick={async () => {
            await loginDemo("ADMIN");
            router.refresh();
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 px-6 py-3 text-xs font-black text-white shadow-xl shadow-rose-500/20 hover:from-rose-400 hover:to-rose-500 transition-all cursor-pointer"
        >
          <Sparkles className="h-4 w-4" />
          <span>Login with 1-Click Admin Demo Account</span>
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                Admin Console
              </span>
              <span className="text-xs text-slate-400">• Authenticated as {user.name}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white mt-0.5">
              CineBook Management Suite
            </h1>
          </div>
        </div>

        <Link
          href="/"
          className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Back to Cinema App</span>
        </Link>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-white/5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? "bg-rose-500 text-white shadow-lg shadow-rose-500/25"
                  : "bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-white/5"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Admin View Area */}
      <div>{children}</div>
    </div>
  );
}
