"use client";

import React from "react";
import { X, Film } from "lucide-react";

interface TrailerModalProps {
  isOpen: boolean;
  onClose: () => void;
  trailerUrl: string;
  movieTitle: string;
}

export function TrailerModal({
  isOpen,
  onClose,
  trailerUrl,
  movieTitle,
}: TrailerModalProps) {
  if (!isOpen) return null;

  // Convert youtube watch URL to embed URL
  const getEmbedUrl = (url: string) => {
    try {
      if (url.includes("youtube.com/watch?v=")) {
        const id = url.split("v=")[1]?.split("&")[0];
        return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
      }
      if (url.includes("youtu.be/")) {
        const id = url.split("youtu.be/")[1]?.split("?")[0];
        return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
      }
      return url;
    } catch {
      return url;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
      <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl border border-white/20 bg-slate-950 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5 bg-slate-900/90">
          <div className="flex items-center gap-2">
            <Film className="h-4 w-4 text-amber-400" />
            <h3 className="font-bold text-white text-sm sm:text-base">
              Official Trailer: {movieTitle}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Video Embed */}
        <div className="relative aspect-video w-full bg-black">
          <iframe
            src={getEmbedUrl(trailerUrl)}
            title={`${movieTitle} Official Trailer`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="absolute inset-0 h-full w-full border-0"
          />
        </div>
      </div>
    </div>
  );
}
