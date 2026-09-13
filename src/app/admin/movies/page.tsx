"use client";

import React, { useState, useEffect } from "react";
import { Film, Plus, Sparkles, AlertCircle, CheckCircle2, Clock, Star } from "lucide-react";
import { SeedMovie } from "@/db/seed-data";

export default function AdminMoviesPage() {
  const [movies, setMovies] = useState<SeedMovie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [posterUrl, setPosterUrl] = useState("");
  const [backdropUrl, setBackdropUrl] = useState("");
  const [trailerUrl, setTrailerUrl] = useState("");
  const [durationMins, setDurationMins] = useState("140");
  const [rating, setRating] = useState("PG-13");
  const [imdbScore, setImdbScore] = useState("8.5");
  const [language, setLanguage] = useState("English");
  const [director, setDirector] = useState("");
  const [cast, setCast] = useState("");
  const [status, setStatus] = useState<"NOW_SHOWING" | "COMING_SOON">("NOW_SHOWING");
  const [genreSlugs, setGenreSlugs] = useState<string[]>(["action"]);

  const loadMovies = async () => {
    try {
      const res = await fetch("/api/admin/movies");
      const data = await res.json();
      setMovies(data.movies || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMovies();
  }, []);

  const handleCreateMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/movies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          posterUrl: posterUrl || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80",
          backdropUrl: backdropUrl || "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1920&q=80",
          trailerUrl: trailerUrl || "https://www.youtube.com/watch?v=Way9Dexny3w",
          durationMins: Number(durationMins),
          rating,
          imdbScore,
          language,
          director,
          cast,
          status,
          genreSlugs,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Failed to create movie" });
        setIsSubmitting(false);
        return;
      }

      setMessage({ type: "success", text: `Movie "${title}" successfully added!` });
      setIsModalOpen(false);
      setIsSubmitting(false);
      // Reset
      setTitle("");
      setDescription("");
      loadMovies();
    } catch (e: any) {
      setMessage({ type: "error", text: e.message || "Network error" });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Movie Titles & Catalog</h2>
          <p className="text-xs text-slate-400">
            Add new releases, update media links, and configure genre categories.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-rose-500/20 hover:from-rose-400 hover:to-rose-500 transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Movie</span>
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

      {/* Movies Table */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 shadow-xl backdrop-blur-xl overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/80 text-[11px] uppercase font-bold text-slate-400 border-b border-white/10">
            <tr>
              <th className="p-3">Poster</th>
              <th className="p-3">Title</th>
              <th className="p-3">Rating</th>
              <th className="p-3">Duration</th>
              <th className="p-3">Language</th>
              <th className="p-3">Status</th>
              <th className="p-3">Director</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {movies.map((m) => (
              <tr key={m.id} className="hover:bg-white/5">
                <td className="p-3">
                  <img
                    src={m.posterUrl}
                    alt={m.title}
                    className="w-10 aspect-[2/3] object-cover rounded shadow border border-white/10"
                  />
                </td>
                <td className="p-3 font-bold text-white">{m.title}</td>
                <td className="p-3">
                  <span className="rounded bg-black/60 px-1.5 py-0.5 font-bold border border-white/10">
                    {m.rating}
                  </span>
                </td>
                <td className="p-3">{m.durationMins}m</td>
                <td className="p-3">{m.language}</td>
                <td className="p-3">
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                      m.status === "NOW_SHOWING"
                        ? "bg-emerald-500/20 text-emerald-300"
                        : "bg-amber-500/20 text-amber-300"
                    }`}
                  >
                    {m.status}
                  </span>
                </td>
                <td className="p-3 text-slate-400">{m.director}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Movie Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl border border-white/15 bg-slate-900 p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Film className="h-4 w-4 text-rose-400" />
                <span>Add New Movie Release</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateMovie} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">
                    Movie Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Mission: Impossible - Dead Reckoning"
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-white focus:border-rose-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">
                    Release Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-white focus:border-rose-500 focus:outline-none"
                  >
                    <option value="NOW_SHOWING">Now Showing</option>
                    <option value="COMING_SOON">Coming Soon</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-semibold">
                  Synopsis / Description *
                </label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter detailed plot synopsis..."
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-white focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">
                    Poster URL (or Vercel Blob)
                  </label>
                  <input
                    type="url"
                    value={posterUrl}
                    onChange={(e) => setPosterUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-white focus:border-rose-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">
                    Backdrop / Hero URL
                  </label>
                  <input
                    type="url"
                    value={backdropUrl}
                    onChange={(e) => setBackdropUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-white focus:border-rose-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">
                    Duration (Mins)
                  </label>
                  <input
                    type="number"
                    value={durationMins}
                    onChange={(e) => setDurationMins(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-white focus:border-rose-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">
                    Rating
                  </label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-white focus:border-rose-500 focus:outline-none"
                  >
                    <option value="PG-13">PG-13</option>
                    <option value="R">R</option>
                    <option value="PG">PG</option>
                    <option value="G">G</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">
                    IMDb Score
                  </label>
                  <input
                    type="text"
                    value={imdbScore}
                    onChange={(e) => setImdbScore(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-white focus:border-rose-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">
                    Director
                  </label>
                  <input
                    type="text"
                    value={director}
                    onChange={(e) => setDirector(e.target.value)}
                    placeholder="Christopher Nolan"
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-white focus:border-rose-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">
                    Starring Cast
                  </label>
                  <input
                    type="text"
                    value={cast}
                    onChange={(e) => setCast(e.target.value)}
                    placeholder="Actor 1, Actor 2, Actor 3"
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
                  {isSubmitting ? "Creating..." : "Save Movie"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
