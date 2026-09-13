"use client";

import React, { useState, useEffect } from "react";
import {
  QrCode,
  ShieldCheck,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Ticket,
  Building2,
  Clock,
  Sparkles,
} from "lucide-react";

export default function AdminBookingsAndScannerPage() {
  const [ticketCodeInput, setTicketCodeInput] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  const [bookings, setBookings] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadAllBookings = async () => {
    try {
      const res = await fetch("/api/admin/stats");
      const data = await res.json();
      setBookings(data.recentBookings || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllBookings();
  }, []);

  const handleVerifyTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketCodeInput.trim()) return;

    setIsScanning(true);
    setScanResult(null);
    setScanError(null);

    try {
      const res = await fetch("/api/admin/verify-ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketCode: ticketCodeInput.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        setScanError(data.error || "Ticket verification failed.");
      } else {
        setScanResult(data);
      }
      loadAllBookings();
    } catch (e: any) {
      setScanError(e.message || "Network error");
    } finally {
      setIsScanning(false);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      b.bookingReference?.toLowerCase().includes(q) ||
      b.customerName?.toLowerCase().includes(q) ||
      b.customerEmail?.toLowerCase().includes(q) ||
      b.movie?.title?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8">
      {/* QR Ticket Verification Card */}
      <div className="rounded-3xl border border-rose-500/30 bg-slate-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
        <div className="flex items-center gap-3 pb-3 border-b border-white/10">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400">
            <QrCode className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">
              Gate Admission QR Ticket Scanner
            </h2>
            <p className="text-xs text-slate-400">
              Verify customer digital passes, validate ticket authenticity, and record instant check-in.
            </p>
          </div>
        </div>

        <form onSubmit={handleVerifyTicket} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Ticket className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Paste or scan ticket code (e.g. TKT-CB-7392-D8)..."
              value={ticketCodeInput}
              onChange={(e) => setTicketCodeInput(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-slate-950 pl-10 pr-4 py-3 text-xs text-white uppercase placeholder-slate-500 focus:border-rose-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={isScanning || !ticketCodeInput.trim()}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-rose-500/20 hover:from-rose-400 hover:to-rose-500 disabled:opacity-50 transition-all cursor-pointer whitespace-nowrap"
          >
            {isScanning ? "Validating..." : "Verify & Admit"}
          </button>
        </form>

        {/* Scan Results */}
        {scanResult && (
          <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-5 space-y-3 animate-in fade-in">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <CheckCircle2 className="h-5 w-5" />
              <span>{scanResult.message}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-300">
              <div className="rounded-xl bg-slate-950/80 p-3 border border-white/5">
                <span className="text-slate-400 block mb-0.5">Movie</span>
                <span className="font-bold text-white">{scanResult.booking?.movie?.title}</span>
              </div>
              <div className="rounded-xl bg-slate-950/80 p-3 border border-white/5">
                <span className="text-slate-400 block mb-0.5">Customer</span>
                <span className="font-bold text-white">{scanResult.booking?.customerName}</span>
              </div>
              <div className="rounded-xl bg-slate-950/80 p-3 border border-white/5">
                <span className="text-slate-400 block mb-0.5">Auditorium & Seats</span>
                <span className="font-bold text-amber-400">
                  {scanResult.booking?.screen?.name} (Seat {scanResult.ticket?.ticketCode?.split("-")?.pop()})
                </span>
              </div>
              <div className="rounded-xl bg-slate-950/80 p-3 border border-white/5">
                <span className="text-slate-400 block mb-0.5">Status</span>
                <span className="font-bold text-emerald-400">ADMISSION GRANTED</span>
              </div>
            </div>
          </div>
        )}

        {scanError && (
          <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-4 text-xs font-semibold text-rose-300 flex items-center gap-2 animate-in fade-in">
            <XCircle className="h-5 w-5 shrink-0 text-rose-400" />
            <span>{scanError}</span>
          </div>
        )}
      </div>

      {/* Bookings Ledger */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-6 shadow-xl backdrop-blur-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-white/10">
          <div>
            <h3 className="text-base font-bold text-white">All Active Bookings</h3>
            <p className="text-xs text-slate-400">Filter across customer reservations</p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search reference, customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-950 pl-9 pr-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[11px] uppercase font-bold text-slate-400 border-b border-white/10">
              <tr>
                <th className="p-3">Reference</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Movie</th>
                <th className="p-3">Cinema</th>
                <th className="p-3">Seats</th>
                <th className="p-3">Total</th>
                <th className="p-3">Status</th>
                <th className="p-3">Quick Scan Code</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredBookings.map((b) => (
                <tr key={b.id} className="hover:bg-white/5">
                  <td className="p-3 font-mono font-bold text-amber-400">
                    {b.bookingReference}
                  </td>
                  <td className="p-3 font-semibold text-white">
                    {b.customerName}
                    <span className="text-[11px] font-normal text-slate-400 block">
                      {b.customerEmail}
                    </span>
                  </td>
                  <td className="p-3 text-slate-200">{b.movie?.title}</td>
                  <td className="p-3 text-slate-400">{b.cinema?.name}</td>
                  <td className="p-3 font-bold text-amber-300">
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
                  <td className="p-3">
                    {b.tickets?.[0] ? (
                      <button
                        onClick={() => {
                          setTicketCodeInput(b.tickets[0].ticketCode);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="rounded bg-slate-800 px-2 py-1 text-[10px] font-mono text-cyan-300 hover:bg-slate-700 cursor-pointer"
                      >
                        {b.tickets[0].ticketCode}
                      </button>
                    ) : (
                      "—"
                    )}
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
