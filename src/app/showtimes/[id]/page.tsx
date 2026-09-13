import React from "react";
import { notFound } from "next/navigation";
import { cinemaStore } from "@/lib/booking-service";
import { SeatPickerClient } from "./seat-picker-client";

export const dynamic = "force-dynamic";

export default async function ShowtimeSeatPage({
  params,
}: {
  params: { id: string };
}) {
  const details = cinemaStore.getShowtimeDetails(params.id);
  if (!details) {
    notFound();
  }

  return <SeatPickerClient initialData={details} />;
}
