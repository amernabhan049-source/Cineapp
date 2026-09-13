"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import {
  Ticket,
  Film,
  Building2,
  Calendar,
  Clock,
  ArrowRight,
  AlertCircle,
  XCircle,
  CheckCircle2,
  Sparkles,
  QrCode,
  RotateCcw,
} from "lucide-react";

import { cinemaStore } from "@/lib/booking-service";

export default function BookingsPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"ALL" | "UPCOMING" | "PAST">("UPCOMING");

  // Cancellation modal state
  const [cancellingBooking, setCancellingBooking] = useState<any | null>(null);
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [cancelSuccessMsg, setCancelSuccessMsg] = useState<string | null>(null);

  const fetchBookings = () => {
    try {
      const userBookings = cinemaStore.getUserBookings(user?.id || "u-customer-0001");
      setBookings(userBookings || []);
    } catch (e) {
      setBookings([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthLoading) {
      if (!user) {
        router.push("/auth/login?redirect=/bookings");
      } else {
        fetchBookings();
      }
    }
  }, [user, isAuthLoading]);

  const handleCancelBooking = async () => {
    if (!cancellingBooking) return;
    setIsSubmittingCancel(true);
    setCancelError(null);

    try {
      const cancelRes = cinemaStore.cancelBooking({
        bookingId: cancellingBooking.id,
        userId: user?.id || "u-customer-0001",
        reason: "User requested refund and cancellation",
      });

      if (!cancelRes.success) {
        setCancelError(cancelRes.error || "Failed to cancel booking.");
        setIsSubmittingCancel(false);
        return;
      }

      setCancelSuccessMsg(
        `Booking cancelled successfully. Refund of $${(
          (cancelRes.refundAmountCents || 0) / 100
        ).toFixed(2)} processed to original payment method.`
      );
      setCancellingBooking(null);
      setIsSubmittingCancel(false);
      fetchBookings();
    } catch (e: any) {
      setCancelError(e.message || "Cancellation error");
      setIsSubmittingCancel(false);
    }
  };

  const now = new Date();
  const filteredBookings = bookings.filter((b) => {
    const showtimeStart = b.showtime?.startTime ? new Date(b.showtime.startTime) : new Date(b.createdAt);
    const isUpcoming = showtimeStart >= now && b.status === "CONFIRMED";

    if (activeTab === "UPCOMING") return isUpcoming;
    if (activeTab === "PAST") return !isUpcoming;
    return true;
  });

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
            <Ticket className="h-4 w-4" />
            <span>Customer Account</span>
          </div>
          <h1 className="text-3xl font-black text-white mt-1">
            My Cinema Bookings
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            View active digital tickets, check entry passes, or manage cancellations and refunds.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-xl bg-slate-900 p-1 border border-white/10">
          {[
            { label: "Upcoming", value: "UPCOMING" },
            { label: "Past & Cancelled", value: "PAST" },
            { label: "All History", value: "ALL" },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value as any)}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === tab.value
                  ? "bg-amber-500 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Success Notification */}
      {cancelSuccessMsg && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs font-semibold text-emerald-300 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{cancelSuccessMsg}</span>
          </div>
          <button
            onClick={() => setCancelSuccessMsg(null)}
            className="text-emerald-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* Bookings List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-40 rounded-2xl bg-slate-900/60 animate-pulse border border-white/5"
            />
          ))}
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-12 text-center space-y-3">
          <Ticket className="mx-auto h-12 w-12 text-slate-600" />
          <h3 className="text-base font-bold text-white">No Bookings Found</h3>
          <p className="text-xs text-slate-400">
            You don't have any {activeTab.toLowerCase()} cinema bookings yet.
          </p>
          <Link
            href="/movies"
            className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-400"
          >
            <span>Browse Movies & Book Now</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredBookings.map((b) => {
            const movie = b.movie;
            const cinema = b.cinema;
            const showtime = b.showtime;
            const items = b.items || [];
            const tickets = b.tickets || [];

            const showtimeStart = showtime?.startTime
              ? new Date(showtime.startTime)
              : new Date();
            const hoursUntilShow =
              (showtimeStart.getTime() - now.getTime()) / (1000 * 60 * 60);
            const isEligibleForCancel =
              b.status === "CONFIRMED" && hoursUntilShow >= 2;

            return (
              <div
                key={b.id}
                className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80 p-5 sm:p-6 shadow-xl backdrop-blur-xl flex flex-col md:flex-row gap-6 items-start justify-between"
              >
                {/* Left Side: Movie Poster & Details */}
                <div className="flex gap-4 items-start">
                  <img
                    src={movie?.posterUrl}
                    alt={movie?.title}
                    className="w-20 sm:w-24 aspect-[2/3] object-cover rounded-xl border border-white/10 shadow-md shrink-0"
                  />
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        REF: {b.bookingReference}
                      </span>
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                          b.status === "CONFIRMED"
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : b.status === "CANCELLED" || b.status === "REFUNDED"
                            ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {b.status}
                      </span>
                    </div>

                    <h3 className="text-lg sm:text-xl font-bold text-white">
                      {movie?.title}
                    </h3>

                    <div className="space-y-1 text-xs text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-amber-400" />
                        <span>{cinema?.name} ({b.screen?.name})</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-amber-400" />
                        <span>
                          {new Date(showtime?.startTime).toLocaleString([], {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
                          ({showtime?.format})
                        </span>
                      </div>
                    </div>

                    <div className="pt-1 flex flex-wrap items-center gap-2 text-xs">
                      <span className="text-slate-400">Seats:</span>
                      <span className="font-bold text-white">
                        {items.map((i: any) => i.seatLabel).join(", ")}
                      </span>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-400">Total:</span>
                      <span className="font-bold text-amber-400">
                        ${(b.totalAmountCents / 100).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Side: Actions */}
                <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-3 pt-4 md:pt-0 border-t md:border-t-0 border-white/10">
                  {b.status === "CONFIRMED" && tickets.length > 0 && (
                    <Link
                      href={`/tickets/${tickets[0].id}`}
                      className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-md hover:from-amber-400 hover:to-amber-500 transition-all whitespace-nowrap"
                    >
                      <QrCode className="h-4 w-4" />
                      <span>View Digital Pass</span>
                    </Link>
                  )}

                  {isEligibleForCancel && (
                    <button
                      onClick={() => setCancellingBooking(b)}
                      className="flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition-all cursor-pointer"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span>Cancel & Refund</span>
                    </button>
                  )}

                  {!isEligibleForCancel && b.status === "CONFIRMED" && (
                    <span className="text-[10px] text-slate-500 text-right max-w-[140px]">
                      Cancellation closed (&lt;2h to showtime)
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancellation Confirmation Modal */}
      {cancellingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-white/15 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2 text-rose-400">
                <AlertCircle className="h-5 w-5" />
                <h3 className="font-bold text-white text-base">
                  Confirm Booking Cancellation
                </h3>
              </div>
              <button
                onClick={() => setCancellingBooking(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to cancel booking{" "}
              <strong className="text-white">
                {cancellingBooking.bookingReference}
              </strong>{" "}
              for <strong className="text-white">{cancellingBooking.movie?.title}</strong>?
            </p>

            <div className="rounded-xl bg-slate-950 p-3.5 border border-white/5 space-y-1 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Seats to be released:</span>
                <span className="font-bold text-white">
                  {cancellingBooking.items?.map((i: any) => i.seatLabel).join(", ")}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Total Refund Amount:</span>
                <span className="font-black text-emerald-400">
                  ${(cancellingBooking.totalAmountCents / 100).toFixed(2)}
                </span>
              </div>
            </div>

            {cancelError && (
              <div className="text-xs text-rose-400 font-semibold">
                {cancelError}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCancellingBooking(null)}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Keep Booking
              </button>
              <button
                type="button"
                disabled={isSubmittingCancel}
                onClick={handleCancelBooking}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-500 disabled:opacity-50"
              >
                {isSubmittingCancel ? "Processing Refund..." : "Confirm Cancellation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
