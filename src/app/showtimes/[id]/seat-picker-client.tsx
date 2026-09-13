"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import {
  ChevronLeft,
  Clock,
  Building2,
  Film,
  Sparkles,
  Ticket,
  ShieldCheck,
  AlertCircle,
  Armchair,
  CheckCircle2,
  Lock,
} from "lucide-react";

interface SeatPickerClientProps {
  initialData: any;
}

export function SeatPickerClient({ initialData }: SeatPickerClientProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { showtime, movie, cinema, screen, seats } = initialData;

  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [customerEmail, setCustomerEmail] = useState(user?.email || "");
  const [customerName, setCustomerName] = useState(user?.name || "");
  const [customerPhone, setCustomerPhone] = useState(user?.phone || "");
  const [isHolding, setIsHolding] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Group seats by rowLabel
  const rowsMap: Record<string, any[]> = {};
  for (const s of seats) {
    if (!rowsMap[s.rowLabel]) {
      rowsMap[s.rowLabel] = [];
    }
    rowsMap[s.rowLabel].push(s);
  }

  // Sort rows and seats
  const rowLabels = Object.keys(rowsMap).sort();
  for (const r of rowLabels) {
    rowsMap[r].sort((a, b) => a.seatNumber - b.seatNumber);
  }

  const handleSeatClick = (seat: any) => {
    if (seat.status === "BOOKED" || seat.status === "BLOCKED") return;

    if (seat.status === "HELD" && seat.heldByUserId !== user?.id) {
      setErrorMessage("This seat is currently held by another customer.");
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }

    if (selectedSeatIds.includes(seat.id)) {
      setSelectedSeatIds(selectedSeatIds.filter((id) => id !== seat.id));
    } else {
      if (selectedSeatIds.length >= 8) {
        setErrorMessage("Maximum 8 seats allowed per reservation.");
        setTimeout(() => setErrorMessage(null), 3000);
        return;
      }
      setSelectedSeatIds([...selectedSeatIds, seat.id]);
    }
  };

  // Calculations
  const selectedSeatsList = seats.filter((s: any) =>
    selectedSeatIds.includes(s.id)
  );
  const subtotalCents = selectedSeatsList.reduce(
    (sum: number, s: any) => sum + s.priceCents,
    0
  );
  const bookingFeeCents = selectedSeatsList.length > 0 ? 200 : 0;
  const taxCents = Math.round(subtotalCents * 0.08875);
  const totalAmountCents = subtotalCents + bookingFeeCents + taxCents;

  const handleHoldAndProceed = async () => {
    if (selectedSeatIds.length === 0) {
      setErrorMessage("Please select at least one seat.");
      return;
    }

    const emailToUse = customerEmail || user?.email;
    const nameToUse = customerName || user?.name;

    if (!emailToUse) {
      setErrorMessage("Please enter your email to reserve your tickets.");
      return;
    }

    setIsHolding(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/bookings/hold", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          showtimeId: showtime.id,
          seatIds: selectedSeatIds,
          customerEmail: emailToUse,
          customerName: nameToUse || "Valued Guest",
          customerPhone: customerPhone || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || "Failed to hold seats. Please try again.");
        setIsHolding(false);
        return;
      }

      router.push(`/checkout/${data.booking.id}`);
    } catch (e: any) {
      setErrorMessage(e.message || "Network error. Please try again.");
      setIsHolding(false);
    }
  };

  const startTimeStr = new Date(showtime.startTime).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const dateStr = new Date(showtime.startTime).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-32">
      {/* Top Bar / Movie Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div className="flex items-center gap-4">
          <Link
            href={`/movies/${movie.id}`}
            className="flex items-center gap-1 rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Back</span>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                {screen.name} ({showtime.format})
              </span>
              <span className="rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-bold border border-white/15">
                {movie.rating}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white mt-0.5">
              {movie.title}
            </h1>
          </div>
        </div>

        {/* Screening Meta */}
        <div className="flex flex-wrap items-center gap-3 text-xs bg-slate-900/80 border border-white/10 px-4 py-2 rounded-xl">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Building2 className="h-4 w-4 text-amber-400" />
            <span>{cinema.name}</span>
          </div>
          <span className="text-slate-500">•</span>
          <div className="flex items-center gap-1.5 text-slate-300">
            <Clock className="h-4 w-4 text-amber-400" />
            <span>
              {dateStr} at {startTimeStr}
            </span>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs font-semibold text-rose-300 flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Auditorium Seat Map Canvas & Screen */}
      <div className="rounded-3xl border border-white/10 bg-slate-900/90 p-6 sm:p-10 shadow-2xl backdrop-blur-xl space-y-10 overflow-x-auto">
        {/* Cinema Curved Screen Visual */}
        <div className="text-center">
          <div className="cinema-screen-curve" />
          <div className="cinema-screen-glow" />
          <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 block -mt-6">
            SCREEN THIS WAY
          </span>
        </div>

        {/* Seat Layout Grid */}
        <div className="min-w-[600px] flex flex-col items-center gap-3">
          {rowLabels.map((rowLabel) => {
            const rowSeats = rowsMap[rowLabel];
            return (
              <div key={rowLabel} className="flex items-center gap-3">
                {/* Row Label Left */}
                <span className="w-5 text-center text-xs font-bold text-slate-500">
                  {rowLabel}
                </span>

                {/* Seat Buttons */}
                <div className="flex items-center gap-2">
                  {rowSeats.map((seat: any) => {
                    const isSelected = selectedSeatIds.includes(seat.id);
                    const isBooked = seat.status === "BOOKED";
                    const isHeldByOther =
                      seat.status === "HELD" && seat.heldByUserId !== user?.id;
                    const isHeldByMe =
                      seat.status === "HELD" && seat.heldByUserId === user?.id;

                    // Seat color styling based on type and status
                    let seatClasses =
                      "relative flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg text-[11px] font-bold transition-all cursor-pointer ";

                    if (isSelected) {
                      seatClasses +=
                        "bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/40 scale-110 ring-2 ring-white";
                    } else if (isBooked) {
                      seatClasses +=
                        "bg-slate-800/50 text-slate-600 border border-white/5 cursor-not-allowed opacity-40";
                    } else if (isHeldByOther) {
                      seatClasses +=
                        "bg-rose-500/20 text-rose-400 border border-rose-500/30 cursor-not-allowed animate-pulse";
                    } else if (isHeldByMe) {
                      seatClasses +=
                        "bg-amber-500/30 text-amber-300 border border-amber-500/50";
                    } else {
                      // Available seats by tier
                      if (seat.seatType === "VIP") {
                        seatClasses +=
                          "bg-purple-950/80 text-purple-200 border border-purple-500/40 hover:bg-purple-600 hover:text-white";
                      } else if (seat.seatType === "RECLINER") {
                        seatClasses +=
                          "bg-cyan-950/80 text-cyan-200 border border-cyan-500/40 hover:bg-cyan-600 hover:text-white";
                      } else if (seat.seatType === "PREMIUM") {
                        seatClasses +=
                          "bg-slate-800 text-slate-200 border border-amber-500/30 hover:bg-amber-500/30 hover:text-amber-300";
                      } else {
                        seatClasses +=
                          "bg-slate-800/80 text-slate-300 border border-white/10 hover:bg-slate-700 hover:text-white";
                      }
                    }

                    // Separate aisle gap in the middle
                    const isAisle =
                      seat.seatNumber === Math.floor(rowSeats.length / 2);

                    return (
                      <React.Fragment key={seat.id}>
                        <button
                          type="button"
                          onClick={() => handleSeatClick(seat)}
                          disabled={isBooked || isHeldByOther}
                          className={seatClasses}
                          title={`${rowLabel}-${seat.seatNumber} (${seat.seatType}) - $${(
                            seat.priceCents / 100
                          ).toFixed(2)}`}
                        >
                          {isBooked ? (
                            "✕"
                          ) : isHeldByOther ? (
                            <Lock className="h-3 w-3" />
                          ) : (
                            seat.seatNumber
                          )}
                        </button>
                        {isAisle && <div className="w-4 sm:w-6" />}
                      </React.Fragment>
                    );
                  })}
                </div>

                {/* Row Label Right */}
                <span className="w-5 text-center text-xs font-bold text-slate-500">
                  {rowLabel}
                </span>
              </div>
            );
          })}
        </div>

        {/* Seat Legend */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-6 border-t border-white/10 text-xs">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded bg-slate-800 border border-white/10" />
            <span className="text-slate-400">Standard ($14-$15)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded bg-slate-800 border border-amber-500/40" />
            <span className="text-slate-400">Premium ($17-$19)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded bg-cyan-950 border border-cyan-500/40" />
            <span className="text-slate-400">Recliner ($22-$24)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded bg-purple-950 border border-purple-500/40" />
            <span className="text-slate-400">VIP Luxe ($28)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded bg-amber-500 shadow-sm" />
            <span className="text-amber-400 font-bold">Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded bg-slate-800/40 border border-white/5 opacity-50 flex items-center justify-center text-[10px] text-slate-600">
              ✕
            </div>
            <span className="text-slate-500">Occupied</span>
          </div>
        </div>
      </div>

      {/* Guest Contact Information (if not signed in) */}
      {!user && selectedSeatIds.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 shadow-xl backdrop-blur-xl">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-2">
            <Ticket className="h-4 w-4" />
            <span>Customer Contact For Digital Tickets</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                Your Email Address *
              </label>
              <input
                type="email"
                required
                placeholder="alex@example.com"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                Full Name
              </label>
              <input
                type="text"
                placeholder="Alex Morgan"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Fixed Sticky Bottom Reservation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-white/15 bg-slate-950/95 p-4 backdrop-blur-xl shadow-2xl">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Selected Seats Summary */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <div className="text-xs">
              <span className="text-slate-400">Selected Seats: </span>
              {selectedSeatsList.length === 0 ? (
                <span className="font-semibold text-slate-500">None</span>
              ) : (
                <span className="font-bold text-white">
                  {selectedSeatsList
                    .map((s: any) => `${s.rowLabel}${s.seatNumber}`)
                    .join(", ")}
                </span>
              )}
            </div>
            {selectedSeatsList.length > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
                <Clock className="h-3 w-3" />
                <span>10 Min Hold Lock on Checkout</span>
              </div>
            )}
          </div>

          {/* Price Breakdown & Hold Button */}
          <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">
                Total (Inc. Tax & Fee)
              </span>
              <span className="text-xl font-black text-amber-400">
                ${(totalAmountCents / 100).toFixed(2)}
              </span>
            </div>

            <button
              onClick={handleHoldAndProceed}
              disabled={selectedSeatIds.length === 0 || isHolding}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3 text-sm font-black text-slate-950 shadow-xl shadow-amber-500/25 hover:from-amber-400 hover:to-amber-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              {isHolding ? (
                <span>Locking Seats...</span>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  <span>Reserve & Checkout</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
