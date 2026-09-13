"use client";

import React, { useState, useEffect } from "react";
import { Calendar, Plus, Clock, Building2, Film, CheckCircle2, AlertCircle } from "lucide-react";

export default function AdminShowtimesPage() {
  const [showtimes, setShowtimes] = useState<any[]>([]);
  const [movies, setMovies] = useState<any[]>([]);
  const [cinemas, setCinemas] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form
  const [selectedMovieId, setSelectedMovieId] = useState("");
  const [selectedCinemaId, setSelectedCinemaId] = useState("");
  const [selectedScreenId, setSelectedScreenId] = useState("");
  const [startTime, setStartTime] = useState("");
  const [basePriceDollars, setBasePriceDollars] = useState("18.00");
  const [format, setFormat] = useState("IMAX_3D");

  const loadData = async () => {
    try {
      const [stRes, mRes, cRes] = await Promise.all([
        fetch("/api/admin/showtimes"),
        fetch("/api/movies"),
        fetch("/api/cinemas"),
      ]);
      const stData = await stRes.json();
      const mData = await mRes.json();
      const cData = await cRes.json();

      setShowtimes(stData.showtimes || []);
      setMovies(mData.movies || []);
      setCinemas(cData.cinemas || []);

      if (mData.movies?.length > 0) setSelectedMovieId(mData.movies[0].id);
      if (cData.cinemas?.length > 0) {
        setSelectedCinemaId(cData.cinemas[0].id);
        if (cData.cinemas[0].screens?.length > 0) {
          setSelectedScreenId(cData.cinemas[0].screens[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Default start time: tomorrow at 7pm
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(19, 0, 0, 0);
    setStartTime(tomorrow.toISOString().slice(0, 16));
  }, []);

  const handleCinemaChange = (cId: string) => {
    setSelectedCinemaId(cId);
    const cinema = cinemas.find((c) => c.id === cId);
    if (cinema && cinema.screens?.length > 0) {
      setSelectedScreenId(cinema.screens[0].id);
    }
  };

  const handleScheduleShowtime = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const basePriceCents = Math.round(parseFloat(basePriceDollars) * 100);

      const res = await fetch("/api/admin/showtimes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          movieId: selectedMovieId,
          auditoriumId: selectedScreenId,
          startTime: new Date(startTime).toISOString(),
          basePriceCents,
          format,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Failed to schedule showtime" });
        setIsSubmitting(false);
        return;
      }

      setMessage({ type: "success", text: "Showtime successfully scheduled with all seat matrices generated!" });
      setIsModalOpen(false);
      setIsSubmitting(false);
      loadData();
    } catch (e: any) {
      setMessage({ type: "error", text: e.message || "Network error" });
      setIsSubmitting(false);
    }
  };

  const currentCinema = cinemas.find((c) => c.id === selectedCinemaId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Showtime Schedule Master</h2>
          <p className="text-xs text-slate-400">
            Schedule screenings across IMAX, Dolby Cinema, and Standard auditoriums.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-rose-500/20 hover:from-rose-400 hover:to-rose-500 transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Schedule Showtime</span>
        </button>
      </div>

      {message && (
        <div
          className={`rounded-xl p-4 text-xs font-semibold flex items-center gap-2 ${
            message.type === "success"
              ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
              : "bg-rose-500/10 border border-rose-500/30 text-rose-300"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Showtimes Table */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 shadow-xl backdrop-blur-xl overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/80 text-[11px] uppercase font-bold text-slate-400 border-b border-white/10">
            <tr>
              <th className="p-3">Movie</th>
              <th className="p-3">Cinema</th>
              <th className="p-3">Auditorium</th>
              <th className="p-3">Format</th>
              <th className="p-3">Start Time</th>
              <th className="p-3">Base Price</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {showtimes.map((st) => (
              <tr key={st.id} className="hover:bg-white/5">
                <td className="p-3 font-bold text-white">{st.movie?.title}</td>
                <td className="p-3">{st.cinema?.name}</td>
                <td className="p-3 font-semibold text-slate-300">{st.screen?.name}</td>
                <td className="p-3">
                  <span className="rounded bg-cyan-950 px-2 py-0.5 text-[10px] font-bold text-cyan-400 border border-cyan-500/30">
                    {st.format}
                  </span>
                </td>
                <td className="p-3 text-amber-400 font-medium">
                  {new Date(st.startTime).toLocaleString([], {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td className="p-3 font-bold text-white">
                  ${(st.basePriceCents / 100).toFixed(2)}
                </td>
                <td className="p-3">
                  <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                    {st.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Schedule Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="w-full max-w-lg rounded-2xl border border-white/15 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar className="h-4 w-4 text-rose-400" />
                <span>Schedule New Screening</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleScheduleShowtime} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1 font-semibold">
                  Select Movie
                </label>
                <select
                  value={selectedMovieId}
                  onChange={(e) => setSelectedMovieId(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-white focus:border-rose-500 focus:outline-none"
                >
                  {movies.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title} ({m.rating})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">
                    Select Cinema
                  </label>
                  <select
                    value={selectedCinemaId}
                    onChange={(e) => handleCinemaChange(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-white focus:border-rose-500 focus:outline-none"
                  >
                    {cinemas.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">
                    Select Auditorium / Screen
                  </label>
                  <select
                    value={selectedScreenId}
                    onChange={(e) => setSelectedScreenId(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-white focus:border-rose-500 focus:outline-none"
                  >
                    {currentCinema?.screens?.map((scr: any) => (
                      <option key={scr.id} value={scr.id}>
                        {scr.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">
                    Start Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-white focus:border-rose-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">
                    Screen Format
                  </label>
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-white focus:border-rose-500 focus:outline-none"
                  >
                    <option value="2D">2D Digital</option>
                    <option value="3D">3D RealD</option>
                    <option value="IMAX_3D">IMAX 3D Laser</option>
                    <option value="DOLBY_ATMOS">Dolby Atmos</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">
                    Base Ticket Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.50"
                    required
                    value={basePriceDollars}
                    onChange={(e) => setBasePriceDollars(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-white focus:border-rose-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-rose-600 px-5 py-2 font-bold text-white hover:bg-rose-500"
                >
                  {isSubmitting ? "Generating Seats..." : "Schedule Screening"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
