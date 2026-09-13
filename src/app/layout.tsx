import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/auth-context";
import { BookingProvider } from "@/context/booking-context";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "CineBook | Premier Cinema Experience & Ticket Booking",
  description:
    "Experience movies in IMAX with Laser, Dolby Atmos, and ultra-plush luxury recliners. Real-time seat selection, instant digital tickets, and seamless reservations.",
  keywords: [
    "cinema tickets",
    "movie tickets",
    "IMAX",
    "Dolby Cinema",
    "ticket booking",
    "CineBook",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="min-h-screen flex flex-col bg-[#080b11] text-slate-100 antialiased selection:bg-amber-500 selection:text-slate-950">
        <AuthProvider>
          <BookingProvider>
            {/* Ambient Background Glows */}
            <div className="fixed top-0 left-1/2 -translate-x-1/2 -z-10 h-[400px] w-full max-w-7xl bg-gradient-radial from-amber-500/10 via-rose-500/5 to-transparent blur-3xl pointer-events-none" />
            <Navbar />
            <main className="flex-1 w-full">{children}</main>
            <Footer />
          </BookingProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
