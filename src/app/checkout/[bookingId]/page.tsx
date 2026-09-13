import React from "react";
import { notFound } from "next/navigation";
import { cinemaStore } from "@/lib/booking-service";
import { CheckoutClient } from "./checkout-client";

export const dynamic = "force-dynamic";

export default async function CheckoutPage({
  params,
}: {
  params: { bookingId: string };
}) {
  const bookingData = cinemaStore.getBookingDetails(params.bookingId);
  if (!bookingData) {
    notFound();
  }

  return <CheckoutClient initialBooking={bookingData} />;
}
