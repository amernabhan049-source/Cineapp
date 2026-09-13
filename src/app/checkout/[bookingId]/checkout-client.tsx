"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Clock,
  ShieldCheck,
  CreditCard,
  Building2,
  Film,
  Ticket,
  AlertCircle,
  Tag,
  CheckCircle2,
  Lock,
  ChevronLeft,
  Sparkles,
} from "lucide-react";
import { cinemaStore } from "@/lib/booking-service";

interface CheckoutClientProps {
  initialBooking: any;
}

export function CheckoutClient({ initialBooking }: CheckoutClientProps) {
  const router = useRouter();
  const [booking, setBooking] = useState(initialBooking);
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [discountCents, setDiscountCents] = useState(0);
  const [promoMessage, setPromoMessage] = useState<string | null>(null);

  // Payment Form States
  const [cardNumber, setCardNumber] = useState("4242 4242 4242 4242");
  const [expiry, setExpiry] = useState("12/28");
  const [cvc, setCvc] = useState("123");
  const [zip, setZip] = useState("10001");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Countdown timer for 10-minute seat hold
  const [timeLeftSecs, setTimeLeftSecs] = useState<number>(() => {
    const expires = new Date(initialBooking.expiresAt).getTime();
    const now = Date.now();
    return Math.max(0, Math.floor((expires - now) / 1000));
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeftSecs((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const code = promoCodeInput.trim().toUpperCase();
    if (code === "CINEVIP") {
      const disc = Math.round(booking.subtotalCents * 0.15);
      setDiscountCents(disc);
      setAppliedPromo("CINEVIP");
      setPromoMessage("15% VIP Patron discount applied!");
    } else if (code === "POPCORN") {
      setDiscountCents(500);
      setAppliedPromo("POPCORN");
      setPromoMessage("$5.00 Concession bonus applied!");
    } else {
      setPromoMessage("Invalid promo code. Try 'CINEVIP' or 'POPCORN'.");
      setTimeout(() => setPromoMessage(null), 3500);
    }
  };

  const handleQuickFillCard = () => {
    setCardNumber("4242 4242 4242 4242");
    setExpiry("12/28");
    setCvc("123");
    setZip("10001");
  };

  const totalPayableCents = Math.max(
    0,
    booking.totalAmountCents - discountCents
  );

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (timeLeftSecs <= 0) {
      setErrorMessage("Your seat hold has expired. Please re-select your seats.");
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    // Generate unique idempotency key
    const idempotencyKey = `pay-${booking.id}-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 6)}`;

    try {
      const payRes = cinemaStore.confirmPaymentAndBooking({
        bookingId: booking.id,
        userId: booking.userId || "u-customer-0001",
        idempotencyKey,
        promoCode: appliedPromo || undefined,
        paymentMethod: {
          cardNumber,
          lastFour: cardNumber.replace(/\s+/g, "").slice(-4) || "4242",
          cardBrand: "Visa Test",
        },
      });

      if (!payRes.success) {
        setErrorMessage(payRes.error || "Payment failed. Please try again.");
        setIsProcessing(false);
        return;
      }

      const firstTicketId = payRes.tickets?.[0]?.id || payRes.booking?.id || booking.id;
      router.push(`/tickets/${firstTicketId}`);
    } catch (e: any) {
      setErrorMessage(e.message || "Network error. Please try again.");
      setIsProcessing(false);
    }
  };

  const movie = booking.movie;
  const cinema = booking.cinema;
  const showtime = booking.showtime;
  const items = booking.items || [];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Breadcrumb */}
      <div className="flex items-center gap-4">
        <Link
          href={`/showtimes/${showtime?.id}`}
          className="flex items-center gap-1 rounded-xl border border-white/10 bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Change Seats</span>
        </Link>
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
            Order Reference: {booking.bookingReference}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Secure Checkout
          </h1>
        </div>
      </div>

      {/* Seat Hold Expiration Countdown Banner */}
      <div
        className={`rounded-2xl border p-4 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-4 transition-all ${
          timeLeftSecs <= 120
            ? "border-rose-500/50 bg-rose-500/15 text-rose-200 animate-pulse"
            : "border-amber-500/30 bg-amber-500/10 text-amber-300"
        }`}
      >
        <div className="flex items-center gap-3">
          <Clock className="h-5 w-5 text-amber-400" />
          <div>
            <span className="font-bold text-sm">
              Seats Temporarily Held for Checkout
            </span>
            <p className="text-xs opacity-80">
              Complete your payment before the timer expires to secure your reservation.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2 border border-white/15">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
            Time Left:
          </span>
          <span className="text-lg font-black tracking-widest text-amber-400">
            {formatTimer(timeLeftSecs)}
          </span>
        </div>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs font-semibold text-rose-300 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Checkout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Payment Details & Card Form */}
        <div className="lg:col-span-7 space-y-6">
          {/* Customer Confirmation */}
          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-6 shadow-xl backdrop-blur-xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              <span>Ticket Recipient Details</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="rounded-xl bg-slate-950 p-3 border border-white/5">
                <span className="text-slate-400 block mb-0.5">Name</span>
                <span className="font-bold text-white">
                  {booking.customerName}
                </span>
              </div>
              <div className="rounded-xl bg-slate-950 p-3 border border-white/5">
                <span className="text-slate-400 block mb-0.5">Email Delivery</span>
                <span className="font-bold text-white">
                  {booking.customerEmail}
                </span>
              </div>
            </div>
          </div>

          {/* Test Payment Gateway Form */}
          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-6 shadow-xl backdrop-blur-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-amber-400" />
                <h3 className="font-bold text-white text-base">
                  Payment Method (Test Mode)
                </h3>
              </div>
              <button
                type="button"
                onClick={handleQuickFillCard}
                className="flex items-center gap-1 rounded-lg bg-amber-500/20 border border-amber-500/30 px-2.5 py-1 text-[11px] font-bold text-amber-300 hover:bg-amber-500/30 transition-all cursor-pointer"
              >
                <Sparkles className="h-3 w-3" />
                <span>Fill 4242 Test Card</span>
              </button>
            </div>

            <form onSubmit={handleProcessPayment} className="space-y-4">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Card Number
                </label>
                <input
                  type="text"
                  required
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="4242 4242 4242 4242"
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 text-sm text-white font-mono placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Expires (MM/YY)
                  </label>
                  <input
                    type="text"
                    required
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    placeholder="12/28"
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 text-sm text-white font-mono placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    CVC
                  </label>
                  <input
                    type="text"
                    required
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value)}
                    placeholder="123"
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 text-sm text-white font-mono placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    required
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    placeholder="10001"
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 text-sm text-white font-mono placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isProcessing || timeLeftSecs <= 0}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 py-3.5 text-sm font-black text-slate-950 shadow-xl shadow-amber-500/25 hover:from-amber-400 hover:to-amber-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  {isProcessing ? (
                    <span>Verifying Payment & Issuing Tickets...</span>
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
                      <span>
                        Pay ${(totalPayableCents / 100).toFixed(2)} & Get Tickets
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Order Summary & Promo Code */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-6 shadow-xl backdrop-blur-xl space-y-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2 pb-3 border-b border-white/10">
              <Ticket className="h-4 w-4" />
              <span>Order Summary</span>
            </h3>

            {/* Movie Info Snippet */}
            <div className="flex gap-4 items-start">
              <img
                src={movie?.posterUrl}
                alt={movie?.title}
                className="w-16 aspect-[2/3] object-cover rounded-lg border border-white/10 shadow-md"
              />
              <div className="space-y-1">
                <h4 className="font-bold text-white text-sm line-clamp-1">
                  {movie?.title}
                </h4>
                <p className="text-xs text-slate-400">
                  {cinema?.name}
                </p>
                <p className="text-xs text-amber-400 font-medium">
                  {showtime?.format} • {new Date(showtime?.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>

            {/* Individual Seats Breakdown */}
            <div className="space-y-2 pt-2 border-t border-white/5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Reserved Seats ({items.length})
              </span>
              <div className="space-y-1.5">
                {items.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between text-xs rounded-lg bg-slate-950/60 p-2 border border-white/5"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">
                        Seat {item.seatLabel}
                      </span>
                      <span className="text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                        {item.seatType}
                      </span>
                    </div>
                    <span className="font-semibold text-slate-300">
                      ${(item.priceCents / 100).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Promo Code Input */}
            <form onSubmit={handleApplyPromo} className="space-y-2 pt-2 border-t border-white/5">
              <label className="text-[11px] font-semibold text-slate-400 block">
                Promo or Discount Code
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. CINEVIP or POPCORN"
                  value={promoCodeInput}
                  onChange={(e) => setPromoCodeInput(e.target.value)}
                  className="flex-1 rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white uppercase placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-slate-800 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-slate-700 hover:text-white"
                >
                  Apply
                </button>
              </div>
              {promoMessage && (
                <span
                  className={`text-[11px] block font-semibold ${
                    appliedPromo ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {promoMessage}
                </span>
              )}
            </form>

            {/* Price Calculations Ledger */}
            <div className="space-y-2 pt-3 border-t border-white/10 text-xs text-slate-300">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${(booking.subtotalCents / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Booking Processing Fee</span>
                <span>${(booking.bookingFeeCents / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Sales Tax</span>
                <span>${(booking.taxCents / 100).toFixed(2)}</span>
              </div>
              {discountCents > 0 && (
                <div className="flex justify-between text-emerald-400 font-semibold">
                  <span>Promo Discount ({appliedPromo})</span>
                  <span>-${(discountCents / 100).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-white/10 text-base font-black text-white">
                <span>Final Total</span>
                <span className="text-amber-400">
                  ${(totalPayableCents / 100).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
