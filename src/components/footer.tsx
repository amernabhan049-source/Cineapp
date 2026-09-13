import React from "react";
import Link from "next/link";
import { Film, ShieldCheck, Heart, Sparkles, CreditCard, Clock } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-white/10 bg-[#07090e] pt-14 pb-8 text-slate-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-white/5">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-rose-600 shadow-md">
                <Film className="h-4 w-4 text-slate-950 font-bold" />
              </div>
              <span className="text-lg font-black tracking-tight text-white">
                CINE<span className="text-amber-400">BOOK</span>
              </span>
            </Link>
            <p className="text-xs leading-relaxed text-slate-400">
              The premier next-generation cinema ticketing ecosystem. Ultra-luxury screens, IMAX Laser, Dolby Atmos, and instantaneous digital passes.
            </p>
            <div className="flex items-center gap-2 text-xs text-amber-400/90 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg w-fit">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Production-Ready on Vercel & Neon</span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">
              Cinema Experience
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/movies" className="hover:text-amber-400 transition-colors">
                  Now Showing Movies
                </Link>
              </li>
              <li>
                <Link href="/movies?status=COMING_SOON" className="hover:text-amber-400 transition-colors">
                  Coming Soon
                </Link>
              </li>
              <li>
                <Link href="/cinemas" className="hover:text-amber-400 transition-colors">
                  Cinemas & Auditoriums
                </Link>
              </li>
              <li>
                <Link href="/bookings" className="hover:text-amber-400 transition-colors">
                  Manage My Bookings
                </Link>
              </li>
            </ul>
          </div>

          {/* Experience Formats */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">
              Premium Formats
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400"></span>
                <span>IMAX with Laser 70mm</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-400"></span>
                <span>Dolby Cinema 128-ch Atmos</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400"></span>
                <span>VIP Royale Recliners</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-purple-400"></span>
                <span>Gourmet Dine-In Butler</span>
              </li>
            </ul>
          </div>

          {/* Security & System Status */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">
              Enterprise Architecture
            </h4>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center gap-2 text-emerald-400">
                <ShieldCheck className="h-4 w-4" />
                <span>Neon PostgreSQL Serverless</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <CreditCard className="h-4 w-4 text-amber-400" />
                <span>Test Payment Gateway Active</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Clock className="h-4 w-4 text-cyan-400" />
                <span>10-Minute Atomic Hold Locks</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} CineBook Inc. All rights reserved.
          </div>
          <div className="flex items-center gap-1">
            <span>Engineered with Next.js App Router, Tailwind CSS, & Drizzle ORM</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
