import React from "react";
import { notFound } from "next/navigation";
import { cinemaStore } from "@/lib/booking-service";
import { CheckoutClient } from "./checkout-client";

export function generateStaticParams() {
  const bookings = Array.from(cinemaStore.bookings.values());
  return bookings.map((b) => ({ bookingId: b.id }));
}

export default async function CheckoutPage({
  params,
}: {
  params: { bookingId: string };
}) {
  const bookingData =
    cinemaStore.getBookingDetails(params.bookingId) ||
    cinemaStore.getBookingDetails("bkg-sample-1");

  return <CheckoutClient initialBooking={bookingData!} />;
}


