"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import {
  Film,
  Compass,
  Building2,
  Ticket,
  ShieldCheck,
  User,
  LogOut,
  Search,
  Sparkles,
  Menu,
  X,
  Calendar,
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, loginDemo } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDemoMenuOpen, setIsDemoMenuOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      router.push(`/movies?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const navLinks = [
    { href: "/movies", label: "Movies", icon: Film },
    { href: "/cinemas", label: "Cinemas", icon: Building2 },
    { href: "/bookings", label: "My Bookings", icon: Ticket, requiresAuth: true },
    ...(user?.role === "ADMIN"
      ? [{ href: "/admin", label: "Admin Portal", icon: ShieldCheck, isAdmin: true }]
      : []),
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#0c1017]/85 backdrop-blur-xl transition-all">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand Logo */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-rose-600 shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
                <Film className="h-5 w-5 text-slate-950 font-bold" />
                <div className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tight text-white flex items-center gap-1">
                  CINE<span className="text-amber-400">BOOK</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 -mt-1">
                  Premier Cinemas
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 lg:gap-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive =
                  pathname === link.href ||
                  (link.href !== "/" && pathname.startsWith(link.href));

                if (link.requiresAuth && !user) return null;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? link.isAdmin
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                          : "bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm"
                        : "text-slate-300 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Actions: Search + Demo Quick Auth + User Menu */}
          <div className="flex items-center gap-3">
            {/* Search Trigger */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/60 px-3.5 py-1.5 text-xs text-slate-400 hover:border-amber-500/40 hover:text-slate-200 transition-all cursor-pointer"
            >
              <Search className="h-3.5 w-3.5 text-amber-400" />
              <span className="hidden sm:inline">Search movies, cinemas...</span>
              <kbd className="hidden sm:inline rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-400 border border-white/5">
                ⌘K
              </kbd>
            </button>

            {/* Quick Demo Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsDemoMenuOpen(!isDemoMenuOpen)}
                className="flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-500/20 transition-all"
                title="Quick Demo Role Switcher"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
                <span className="hidden lg:inline">Demo Switcher</span>
              </button>

              {isDemoMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl border border-white/10 bg-slate-900 p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-white/5">
                    1-Click Demo Profiles
                  </div>
                  <button
                    onClick={async () => {
                      await loginDemo("USER");
                      setIsDemoMenuOpen(false);
                      router.refresh();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg text-left text-xs text-slate-200 hover:bg-amber-500/20 hover:text-amber-300 transition-all mt-1"
                  >
                    <div>
                      <div className="font-semibold text-white">Customer Demo</div>
                      <div className="text-[11px] text-slate-400">customer@cinebook.com</div>
                    </div>
                    <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                      User
                    </span>
                  </button>
                  <button
                    onClick={async () => {
                      await loginDemo("ADMIN");
                      setIsDemoMenuOpen(false);
                      router.refresh();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg text-left text-xs text-slate-200 hover:bg-rose-500/20 hover:text-rose-300 transition-all"
                  >
                    <div>
                      <div className="font-semibold text-white">Admin Demo</div>
                      <div className="text-[11px] text-slate-400">admin@cinebook.com</div>
                    </div>
                    <span className="rounded bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-300">
                      Admin
                    </span>
                  </button>
                </div>
              )}
            </div>

            {/* User Session Menu or Login Button */}
            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/bookings"
                  className="flex items-center gap-2 rounded-lg border border-white/10 bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-amber-500/40 hover:text-amber-300 transition-all"
                >
                  <User className="h-3.5 w-3.5 text-amber-400" />
                  <span className="max-w-[100px] truncate">{user.name}</span>
                </Link>
                <button
                  onClick={async () => {
                    await logout();
                    router.push("/");
                    router.refresh();
                  }}
                  className="rounded-lg border border-white/10 bg-slate-900 p-2 text-slate-400 hover:text-rose-400 hover:border-rose-500/30 transition-all"
                  title="Sign Out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/auth/login"
                  className="rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-1.5 text-xs font-bold text-slate-950 shadow-md shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 hover:scale-[1.02] transition-all"
                >
                  Sign In
                </Link>
              </div>
            )}

            {/* Mobile Menu Trigger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden rounded-lg border border-white/10 bg-slate-900 p-2 text-slate-300 hover:text-white"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 bg-slate-950/95 px-4 py-4 space-y-2 animate-in slide-in-from-top-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-200 hover:bg-white/10"
                >
                  <Icon className="h-4 w-4 text-amber-400" />
                  {link.label}
                </Link>
              );
            })}
          </div>
        )}
      </header>

      {/* Global Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 backdrop-blur-md pt-20 px-4 animate-in fade-in">
          <div className="w-full max-w-2xl rounded-2xl border border-white/15 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <Search className="h-5 w-5 text-amber-400" />
                <span className="font-bold text-white text-lg">Search Cinema Catalog</span>
              </div>
              <button
                onClick={() => setIsSearchOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSearchSubmit} className="mt-4">
              <input
                type="text"
                autoFocus
                placeholder="Search by movie title, actor, director, or cinema..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3.5 text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-400">
                <span className="text-slate-500">Popular:</span>
                {["Dune", "Oppenheimer", "IMAX", "Cyberpunk", "Interstellar"].map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => {
                      setSearchQuery(term);
                      setIsSearchOpen(false);
                      router.push(`/movies?search=${encodeURIComponent(term)}`);
                    }}
                    className="rounded-full bg-slate-800 px-3 py-1 text-slate-300 hover:bg-amber-500/20 hover:text-amber-300 transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(false)}
                  className="rounded-lg px-4 py-2 text-sm text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-amber-500 px-5 py-2 text-sm font-bold text-slate-950 hover:bg-amber-400"
                >
                  Search
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
