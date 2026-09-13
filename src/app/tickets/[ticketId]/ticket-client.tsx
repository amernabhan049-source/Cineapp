"use client";

import React from "react";
import Link from "next/link";
import {
  Film,
  Building2,
  Calendar,
  Clock,
  Ticket as TicketIcon,
  CheckCircle2,
  Download,
  Share2,
  Printer,
  ChevronLeft,
  Sparkles,
  QrCode,
} from "lucide-react";
import { generateBarcodeSVG } from "@/lib/qr";

interface TicketClientProps {
  ticketData: any;
}

export function TicketDisplayClient({ ticketData }: TicketClientProps) {
  const { ticket, qrSvg, booking } = ticketData;
  const movie = booking.movie;
  const cinema = booking.cinema;
  const showtime = booking.showtime;
  const items = booking.items || [];

  const barcodeSvg = generateBarcodeSVG(ticket.ticketCode, 260, 42);

  const startTimeStr = new Date(showtime?.startTime).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const dateStr = new Date(showtime?.startTime).toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadICS = () => {
    const start = new Date(showtime?.startTime);
    const end = new Date(showtime?.endTime);

    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//CineBook//Cinema Pass//EN",
      "BEGIN:VEVENT",
      `SUMMARY:🎬 ${movie?.title} (${showtime?.format}) at ${cinema?.name}`,
      `DESCRIPTION:Booking Ref: ${booking.bookingReference}\\nTicket: ${ticket.ticketCode}\\nSeats: ${items.map((i: any) => i.seatLabel).join(", ")}`,
      `LOCATION:${cinema?.name}, ${cinema?.address}, ${cinema?.city}`,
      `DTSTART:${start.toISOString().replace(/[-:]/g, "").split(".")[0]}Z`,
      `DTEND:${end.toISOString().replace(/[-:]/g, "").split(".")[0]}Z`,
      "STATUS:CONFIRMED",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `cinebook-${booking.bookingReference}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 space-y-8">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10 print:hidden">
        <Link
          href="/bookings"
          className="flex items-center gap-1 text-xs font-semibold text-slate-300 hover:text-white"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>View All My Bookings</span>
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadICS}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 transition-all cursor-pointer"
          >
            <Calendar className="h-3.5 w-3.5 text-amber-400" />
            <span>Add to Calendar</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2 text-xs font-bold text-slate-950 shadow-md shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition-all cursor-pointer"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print Pass</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-300 flex items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <div>
            <h4 className="font-bold text-sm text-white">
              Booking Confirmed & Digital Pass Ready!
            </h4>
            <p className="text-xs text-emerald-300/80">
              A confirmation email was sent to {booking.customerEmail}. Present this digital pass or QR code at cinema admission gates.
            </p>
          </div>
        </div>
        <span className="rounded-md bg-emerald-500/20 px-2.5 py-1 text-xs font-black text-emerald-300 border border-emerald-500/30">
          CONFIRMED
        </span>
      </div>

      {/* Boarding Pass Cinema Ticket Container */}
      <div className="overflow-hidden rounded-3xl border border-white/20 bg-slate-900/90 shadow-2xl backdrop-blur-2xl glow-gold">
        {/* Ticket Header */}
        <div className="flex items-center justify-between bg-gradient-to-r from-amber-500 to-rose-600 px-6 sm:px-8 py-4 text-slate-950">
          <div className="flex items-center gap-2">
            <Film className="h-5 w-5 fill-slate-950" />
            <span className="font-black text-lg tracking-tight">CINEBOOK DIGITAL PASS</span>
          </div>
          <span className="font-mono text-xs font-bold tracking-wider bg-black/20 px-2.5 py-1 rounded-md">
            REF: {booking.bookingReference}
          </span>
        </div>

        {/* Ticket Body */}
        <div className="grid grid-cols-1 md:grid-cols-12 p-6 sm:p-8 gap-8 items-center">
          {/* Left Column: Movie & Showtime Information */}
          <div className="md:col-span-8 space-y-6">
            <div className="flex gap-5 items-start">
              <img
                src={movie?.posterUrl}
                alt={movie?.title}
                className="w-24 sm:w-28 aspect-[2/3] object-cover rounded-xl border border-white/10 shadow-lg shrink-0"
              />
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded bg-amber-500 px-2 py-0.5 text-[10px] font-black text-slate-950">
                    {movie?.rating}
                  </span>
                  <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-cyan-400 border border-white/10">
                    {showtime?.format}
                  </span>
                  <span className="text-xs text-slate-400">
                    {movie?.durationMins} Mins
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white">
                  {movie?.title}
                </h2>
                <p className="text-xs text-slate-400">
                  {cinema?.name}
                </p>
              </div>
            </div>

            {/* Grid of Showtime / Hall / Seats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-white/10 text-xs">
              <div className="rounded-xl bg-slate-950/70 p-3 border border-white/5">
                <span className="text-slate-400 block mb-0.5">Date</span>
                <span className="font-bold text-white block truncate">{dateStr.split(",")[1]}</span>
              </div>
              <div className="rounded-xl bg-slate-950/70 p-3 border border-white/5">
                <span className="text-slate-400 block mb-0.5">Showtime</span>
                <span className="font-bold text-amber-400 text-sm block">{startTimeStr}</span>
              </div>
              <div className="rounded-xl bg-slate-950/70 p-3 border border-white/5">
                <span className="text-slate-400 block mb-0.5">Auditorium</span>
                <span className="font-bold text-white block truncate">
                  {booking.screen?.name?.split("-")[0] || "Screen 1"}
                </span>
              </div>
              <div className="rounded-xl bg-slate-950/70 p-3 border border-white/5">
                <span className="text-slate-400 block mb-0.5">Seats ({items.length})</span>
                <span className="font-black text-amber-400 text-sm block">
                  {items.map((i: any) => i.seatLabel).join(", ")}
                </span>
              </div>
            </div>

            {/* Customer & Ticket ID Details */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/10 text-xs text-slate-400">
              <div>
                <span className="text-slate-500 block">Ticket Holder</span>
                <span className="font-semibold text-white">
                  {booking.customerName} ({booking.customerEmail})
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 block">Security Ticket Code</span>
                <span className="font-mono font-bold text-slate-300">
                  {ticket.ticketCode}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Scannable QR Code & Barcode */}
          <div className="md:col-span-4 flex flex-col items-center justify-center p-4 bg-slate-950/80 rounded-2xl border border-white/10 space-y-4 text-center">
            <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400">
              Admit One Gate Scan
            </span>

            {/* Dynamic QR SVG */}
            <div
              className="p-1 rounded-xl shadow-inner bg-white"
              dangerouslySetInnerHTML={{ __html: qrSvg }}
            />

            <span className="text-[10px] font-mono font-semibold text-slate-400">
              {ticket.ticketCode}
            </span>

            {/* Barcode representation */}
            <div
              className="w-full bg-white p-2 rounded-lg"
              dangerouslySetInnerHTML={{ __html: barcodeSvg }}
            />

            <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">
              Scan at cinema turnstiles
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
