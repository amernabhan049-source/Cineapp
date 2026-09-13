"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  DollarSign,
  Ticket,
  Percent,
  Film,
  Building2,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  QrCode,
  Clock,
} from "lucide-react";

import { cinemaStore } from "@/lib/booking-service";

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    function loadStats() {
      try {
        const data = cinemaStore.getAdminStats();
        setStats(data);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    loadStats();
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-28 rounded-2xl bg-slate-900/60 animate-pulse border border-white/5"
          />
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Box Office Revenue",
      value: `$${((stats?.totalRevenueCents || 0) / 100).toFixed(2)}`,
      icon: DollarSign,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      title: "Confirmed Bookings",
      value: stats?.totalBookingsCount || 0,
      icon: Ticket,
      color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    },
    {
      title: "Tickets Issued",
      value: stats?.totalTicketsSold || 0,
      icon: TrendingUp,
      color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    },
    {
      title: "Auditorium Occupancy Rate",
      value: `${stats?.occupancyRate || 0}%`,
      icon: Percent,
      color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 shadow-xl backdrop-blur-xl space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">
                  {card.title}
                </span>
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg border ${card.color}`}
                >
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-white">{card.value}</div>
            </div>
          );
        })}
      </div>

      {/* Quick Action Hub */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/admin/movies"
          className="group flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/60 p-5 hover:bg-slate-900 hover:border-amber-500/40 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 group-hover:scale-105 transition-transform">
              <Film className="h-5 w-5" />
            </div>
            <div>
              <div className="font-bold text-white text-sm">Add New Movie</div>
              <div className="text-xs text-slate-400">Upload poster & details</div>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          href="/admin/showtimes"
          className="group flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/60 p-5 hover:bg-slate-900 hover:border-cyan-500/40 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 group-hover:scale-105 transition-transform">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <div className="font-bold text-white text-sm">Schedule Showtime</div>
              <div className="text-xs text-slate-400">Assign halls & base pricing</div>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          href="/admin/bookings"
          className="group flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/60 p-5 hover:bg-slate-900 hover:border-rose-500/40 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 group-hover:scale-105 transition-transform">
              <QrCode className="h-5 w-5" />
            </div>
            <div>
              <div className="font-bold text-white text-sm">Scan QR Ticket</div>
              <div className="text-xs text-slate-400">Gate check-in validator</div>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-rose-400 group-hover:translate-x-1 transition-all" />
        </Link>
      </div>

      {/* Recent Bookings Ledger Table */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-6 shadow-xl backdrop-blur-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Live Booking Ledger
          </h3>
          <Link
            href="/admin/bookings"
            className="text-xs font-semibold text-rose-400 hover:underline"
          >
            View All Bookings
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/70 text-[11px] uppercase font-bold text-slate-400 border-b border-white/10">
              <tr>
                <th className="p-3">Ref Code</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Movie</th>
                <th className="p-3">Seats</th>
                <th className="p-3">Total</th>
                <th className="p-3">Status</th>
                <th className="p-3">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {stats?.recentBookings?.map((b: any) => (
                <tr key={b.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-3 font-mono font-bold text-amber-400">
                    {b.bookingReference}
                  </td>
                  <td className="p-3 font-medium text-white">
                    {b.customerName}
                  </td>
                  <td className="p-3 text-slate-200">{b.movie?.title}</td>
                  <td className="p-3 font-semibold text-slate-300">
                    {b.items?.map((i: any) => i.seatLabel).join(", ")}
                  </td>
                  <td className="p-3 font-bold text-emerald-400">
                    ${(b.totalAmountCents / 100).toFixed(2)}
                  </td>
                  <td className="p-3">
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                        b.status === "CONFIRMED"
                          ? "bg-emerald-500/20 text-emerald-300"
                          : b.status === "CANCELLED"
                          ? "bg-rose-500/20 text-rose-300"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {b.status}
                    </span>
                  </td>
                  <td className="p-3 text-slate-400">
                    {new Date(b.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
