import React from "react";
import Link from "next/link";
import { cinemaStore } from "@/lib/booking-service";
import {
  Building2,
  MapPin,
  Phone,
  Sparkles,
  ChevronRight,
  Tv,
} from "lucide-react";


export default function CinemasPage() {
  const cinemas = cinemaStore.getCinemas();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
          <Building2 className="h-4 w-4" />
          <span>Locations & Screen Types</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white mt-1">
          CineBook Premier Cinemas
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Explore our premier flagship cinema destinations equipped with IMAX Laser, Dolby Cinema, and Luxury VIP Recliners.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cinemas.map((cinema) => (
          <div
            key={cinema.id}
            className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/40 hover:shadow-2xl"
          >
            {/* Cinema Image */}
            <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
              <img
                src={cinema.imageUrl}
                alt={cinema.name}
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
              <div className="absolute top-3 left-3 rounded-md bg-black/70 px-2.5 py-1 text-[11px] font-bold text-amber-400 backdrop-blur-md border border-white/10">
                {cinema.screens.length} Premium Screens
              </div>
            </div>

            {/* Details */}
            <div className="flex flex-1 flex-col p-5 space-y-4">
              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                  {cinema.name}
                </h3>
                <div className="mt-1.5 flex items-start gap-2 text-xs text-slate-400">
                  <MapPin className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
                  <span>
                    {cinema.address}, {cinema.city}, {cinema.state} {cinema.postalCode}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                  <Phone className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                  <span>{cinema.phone}</span>
                </div>
              </div>

              {/* Amenities */}
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Featured Amenities
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {cinema.amenities.map((amenity) => (
                    <span
                      key={amenity}
                      className="rounded-md bg-slate-950 px-2.5 py-1 text-[11px] text-slate-300 border border-white/5"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="pt-2 mt-auto border-t border-white/5">
                <Link
                  href={`/cinemas/${cinema.id}`}
                  className="flex items-center justify-between rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-bold text-amber-400 hover:bg-amber-500 hover:text-slate-950 transition-all group-hover:border group-hover:border-amber-500/40"
                >
                  <span>View Screenings & Schedules</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
