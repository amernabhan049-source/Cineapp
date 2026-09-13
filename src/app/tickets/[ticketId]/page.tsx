import React from "react";
import { notFound } from "next/navigation";
import { cinemaStore } from "@/lib/booking-service";
import { TicketDisplayClient } from "./ticket-client";

export const dynamic = "force-dynamic";

export default async function TicketPage({
  params,
}: {
  params: { ticketId: string };
}) {
  const ticketData = cinemaStore.getTicketDetails(params.ticketId);

  // If ticketId matches a booking ID, load the first ticket of that booking
  if (!ticketData) {
    const bookingData = cinemaStore.getBookingDetails(params.ticketId);
    if (bookingData && bookingData.tickets && bookingData.tickets.length > 0) {
      const firstTicketData = cinemaStore.getTicketDetails(
        bookingData.tickets[0].id
      );
      if (firstTicketData) {
        return <TicketDisplayClient ticketData={firstTicketData} />;
      }
    }
    notFound();
  }

  return <TicketDisplayClient ticketData={ticketData} />;
}
