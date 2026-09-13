import React from "react";
import { notFound } from "next/navigation";
import { cinemaStore } from "@/lib/booking-service";
import { TicketDisplayClient } from "./ticket-client";

import { generateQRCodeSVG } from "@/lib/qr";

export function generateStaticParams() {
  const tickets = Array.from(cinemaStore.tickets.values()).flat();
  return tickets.map((t) => ({ ticketId: t.id }));
}

export default async function TicketPage({
  params,
}: {
  params: { ticketId: string };
}) {
  let ticketData = cinemaStore.getTicketDetails(params.ticketId);

  // If ticketId matches a booking ID, load the first ticket of that booking
  if (!ticketData) {
    const bookingData = cinemaStore.getBookingDetails(params.ticketId);
    if (bookingData && bookingData.tickets && bookingData.tickets.length > 0) {
      ticketData = cinemaStore.getTicketDetails(bookingData.tickets[0].id);
    }
  }

  if (!ticketData) {
    ticketData = cinemaStore.getTicketDetails("tkt-sample-1");
  }

  return <TicketDisplayClient ticketData={ticketData!} />;
}


