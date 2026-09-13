"use client";

import React, { createContext, useContext, useState } from "react";

interface BookingContextType {
  selectedCinemaId: string;
  setSelectedCinemaId: (id: string) => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  selectedMovieId: string;
  setSelectedMovieId: (id: string) => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [selectedCinemaId, setSelectedCinemaId] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedMovieId, setSelectedMovieId] = useState("");

  return (
    <BookingContext.Provider
      value={{
        selectedCinemaId,
        setSelectedCinemaId,
        selectedDate,
        setSelectedDate,
        selectedMovieId,
        setSelectedMovieId,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error("useBooking must be used within a BookingProvider");
  }
  return context;
}
