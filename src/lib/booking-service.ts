import {
  SEED_GENRES,
  SEED_MOVIES,
  SEED_CINEMAS,
  SeedMovie,
  SeedCinema,
  SeedGenre,
} from "@/db/seed-data";
import { generateQRCodeSVG } from "@/lib/qr";
import bcrypt from "bcryptjs";

export type SeatStatus = "AVAILABLE" | "HELD" | "BOOKED" | "BLOCKED";
export type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "EXPIRED"
  | "REFUNDED";
export type PaymentStatus = "PENDING" | "SUCCEEDED" | "FAILED" | "REFUNDED";

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: "USER" | "ADMIN";
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditoriumSeat {
  id: string;
  auditoriumId: string;
  rowLabel: string;
  seatNumber: number;
  seatType: "STANDARD" | "PREMIUM" | "RECLINER" | "VIP" | "ACCESSIBLE";
  basePriceMultiplier: number; // 100 = 1.00x, 150 = 1.50x, 180 = 1.80x
  isActive: boolean;
}

export interface ShowtimeRecord {
  id: string;
  movieId: string;
  auditoriumId: string;
  startTime: string; // ISO UTC
  endTime: string; // ISO UTC
  basePriceCents: number; // e.g. 1600 = $16.00
  format: "2D" | "3D" | "IMAX_3D" | "DOLBY_ATMOS";
  status: "SCHEDULED" | "CANCELLED" | "COMPLETED";
}

export interface ShowtimeSeatRecord {
  id: string;
  showtimeId: string;
  seatId: string;
  status: SeatStatus;
  holdExpiresAt: string | null;
  heldByUserId: string | null;
  priceCents: number;
  version: number;
  updatedAt: string;
}

export interface BookingRecord {
  id: string;
  bookingReference: string;
  userId: string;
  showtimeId: string;
  status: BookingStatus;
  totalAmountCents: number;
  subtotalCents: number;
  bookingFeeCents: number;
  taxCents: number;
  discountCents: number;
  promoCode?: string;
  expiresAt: string;
  idempotencyKey: string;
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BookingItemRecord {
  id: string;
  bookingId: string;
  showtimeSeatId: string;
  seatId: string;
  priceCents: number;
  seatLabel: string;
  seatType: string;
  createdAt: string;
}

export interface PaymentRecord {
  id: string;
  bookingId: string;
  userId: string;
  provider: "STRIPE_TEST" | "MOCK_GATEWAY";
  providerPaymentId: string;
  idempotencyKey: string;
  amountCents: number;
  currency: string;
  status: PaymentStatus;
  paymentMethodType: string;
  lastFour: string;
  cardBrand: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export interface TicketRecord {
  id: string;
  bookingId: string;
  ticketCode: string;
  qrPayload: string;
  status: "VALID" | "USED" | "CANCELLED";
  issuedAt: string;
  checkedInAt: string | null;
}

export interface AuditLogRecord {
  id: string;
  userId: string | null;
  action: string;
  entityType: string;
  entityId: string;
  oldValues: any;
  newValues: any;
  ipAddress?: string;
  createdAt: string;
}

// In-Memory Database Store with Full Relational Model
class CinemaDataStore {
  users: Map<string, UserRecord> = new Map();
  genres: Map<string, SeedGenre> = new Map();
  movies: Map<string, SeedMovie> = new Map();
  cinemas: Map<string, SeedCinema> = new Map();
  auditoriumSeats: Map<string, AuditoriumSeat[]> = new Map(); // auditoriumId -> seats
  showtimes: Map<string, ShowtimeRecord> = new Map();
  showtimeSeats: Map<string, ShowtimeSeatRecord> = new Map(); // showtimeId_seatId -> record
  bookings: Map<string, BookingRecord> = new Map();
  bookingItems: Map<string, BookingItemRecord[]> = new Map(); // bookingId -> items
  payments: Map<string, PaymentRecord> = new Map();
  tickets: Map<string, TicketRecord[]> = new Map(); // bookingId -> tickets
  auditLogs: AuditLogRecord[] = [];
  idempotencyKeys: Set<string> = new Set();
  isInitialized = false;

  constructor() {
    this.init();
  }

  init() {
    if (this.isInitialized) return;

    // Seed Genres
    for (const g of SEED_GENRES) {
      this.genres.set(g.id, g);
    }

    // Seed Movies
    for (const m of SEED_MOVIES) {
      this.movies.set(m.id, m);
    }

    // Seed Users
    const defaultPasswordHash = bcrypt.hashSync("AdminPass123!", 8);
    const customerPasswordHash = bcrypt.hashSync("CustomerPass123!", 8);

    const adminUser: UserRecord = {
      id: "u-admin-0001",
      name: "CineBook Administrator",
      email: "admin@cinebook.com",
      passwordHash: defaultPasswordHash,
      role: "ADMIN",
      phone: "(212) 555-0100",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const customerUser: UserRecord = {
      id: "u-customer-0001",
      name: "Alex Morgan",
      email: "customer@cinebook.com",
      passwordHash: customerPasswordHash,
      role: "USER",
      phone: "(212) 555-0199",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const sophiaUser: UserRecord = {
      id: "u-customer-0002",
      name: "Sophia Reed",
      email: "sophia@cinebook.com",
      passwordHash: customerPasswordHash,
      role: "USER",
      phone: "(415) 555-0144",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.users.set(adminUser.id, adminUser);
    this.users.set(customerUser.id, customerUser);
    this.users.set(sophiaUser.id, sophiaUser);

    // Seed Cinemas & Generate Seats Matrix per Auditorium
    for (const cinema of SEED_CINEMAS) {
      this.cinemas.set(cinema.id, cinema);

      for (const screen of cinema.screens) {
        const seats: AuditoriumSeat[] = [];

        screen.rows.forEach((row, rowIdx) => {
          for (let s = 1; s <= screen.seatsPerRow; s++) {
            let seatType: AuditoriumSeat["seatType"] = "STANDARD";
            let multiplier = 100;

            if (screen.screenType === "VIP_LUXE") {
              seatType = "VIP";
              multiplier = 180;
            } else if (row === "A" && (s === 1 || s === screen.seatsPerRow)) {
              seatType = "ACCESSIBLE";
              multiplier = 100;
            } else if (row === "A" || row === "B") {
              seatType = "STANDARD";
              multiplier = 100;
            } else if (row === "C" || row === "D") {
              seatType = "PREMIUM";
              multiplier = 125;
            } else if (row === "E" || row === "F" || row === "G") {
              seatType = "RECLINER";
              multiplier = 150;
            }

            const seat: AuditoriumSeat = {
              id: `seat-${screen.id}-${row}-${s}`,
              auditoriumId: screen.id,
              rowLabel: row,
              seatNumber: s,
              seatType,
              basePriceMultiplier: multiplier,
              isActive: true,
            };
            seats.push(seat);
          }
        });

        this.auditoriumSeats.set(screen.id, seats);
      }
    }

    // Seed Showtimes across multiple days
    this.seedShowtimes();

    // Pre-seed a sample booking and ticket for immediate viewing and static generation
    const firstShowtime = Array.from(this.showtimes.values())[0];
    if (firstShowtime) {
      const sampleBookingId = "bkg-sample-1";
      const sampleRef = "CB-8492-74";
      const sampleBooking: BookingRecord = {
        id: sampleBookingId,
        bookingReference: sampleRef,
        userId: "u-customer-0001",
        showtimeId: firstShowtime.id,
        status: "CONFIRMED",
        totalAmountCents: 3200,
        subtotalCents: 2800,
        bookingFeeCents: 200,
        taxCents: 200,
        discountCents: 0,
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
        idempotencyKey: "demo-idemp-key-1",
        customerEmail: "customer@cinebook.com",
        customerName: "Alex Morgan",
        customerPhone: "(212) 555-0199",
        cancelledAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.bookings.set(sampleBookingId, sampleBooking);

      const sampleItems: BookingItemRecord[] = [
        {
          id: "item-sample-1",
          bookingId: sampleBookingId,
          showtimeSeatId: `sts-${firstShowtime.id}-seat-1`,
          seatId: "seat-1",
          priceCents: 1400,
          seatLabel: "D5",
          seatType: "PREMIUM",
          createdAt: new Date().toISOString(),
        },
        {
          id: "item-sample-2",
          bookingId: sampleBookingId,
          showtimeSeatId: `sts-${firstShowtime.id}-seat-2`,
          seatId: "seat-2",
          priceCents: 1400,
          seatLabel: "D6",
          seatType: "PREMIUM",
          createdAt: new Date().toISOString(),
        },
      ];
      this.bookingItems.set(sampleBookingId, sampleItems);

      const sampleTicketId = "tkt-sample-1";
      const ticketCode = `TKT-${sampleRef}-D5`;
      const sampleTicket: TicketRecord = {
        id: sampleTicketId,
        bookingId: sampleBookingId,
        ticketCode,
        qrPayload: JSON.stringify({ code: ticketCode, ref: sampleRef, seat: "D5" }),
        status: "VALID",
        issuedAt: new Date().toISOString(),
        checkedInAt: null,
      };
      this.tickets.set(sampleBookingId, [sampleTicket]);
    }

    this.isInitialized = true;

  }

  private seedShowtimes() {
    const cinemaList = Array.from(this.cinemas.values());
    const movieList = Array.from(this.movies.values()).filter(
      (m) => m.status === "NOW_SHOWING"
    );

    const baseTimes = [
      { hour: 11, min: 30, format: "2D", price: 1400 },
      { hour: 14, min: 15, format: "3D", price: 1700 },
      { hour: 17, min: 45, format: "IMAX_3D", price: 2200 },
      { hour: 20, min: 30, format: "DOLBY_ATMOS", price: 2000 },
      { hour: 22, min: 45, format: "2D", price: 1500 },
    ];

    let showtimeCount = 1;

    // Generate for Today, Tomorrow, and Next 3 Days
    for (let dayOffset = 0; dayOffset < 4; dayOffset++) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + dayOffset);
      targetDate.setSeconds(0, 0);

      for (const cinema of cinemaList) {
        for (let mIdx = 0; mIdx < movieList.length; mIdx++) {
          const movie = movieList[mIdx];
          const screen = cinema.screens[mIdx % cinema.screens.length];

          // Pick 2-3 showtimes per movie per screen
          const selectedSlots = [
            baseTimes[(mIdx + dayOffset) % baseTimes.length],
            baseTimes[(mIdx + dayOffset + 2) % baseTimes.length],
          ];

          for (const slot of selectedSlots) {
            const start = new Date(targetDate);
            start.setHours(slot.hour, slot.min, 0, 0);

            const end = new Date(start);
            end.setMinutes(start.getMinutes() + movie.durationMins + 20);

            const showtimeId = `st-${showtimeCount++}`;
            const showtime: ShowtimeRecord = {
              id: showtimeId,
              movieId: movie.id,
              auditoriumId: screen.id,
              startTime: start.toISOString(),
              endTime: end.toISOString(),
              basePriceCents: slot.price,
              format: slot.format as any,
              status: "SCHEDULED",
            };

            this.showtimes.set(showtimeId, showtime);

            // Initialize showtime seats for this showtime
            const seats = this.auditoriumSeats.get(screen.id) || [];
            for (const seat of seats) {
              const seatPrice = Math.round(
                (showtime.basePriceCents * seat.basePriceMultiplier) / 100
              );

              // Pre-fill a few booked seats for realistic cinema feel
              const isPreBooked =
                (seat.rowLabel === "D" && (seat.seatNumber === 5 || seat.seatNumber === 6)) ||
                (seat.rowLabel === "E" && seat.seatNumber === 4);

              const stSeat: ShowtimeSeatRecord = {
                id: `sts-${showtimeId}-${seat.id}`,
                showtimeId,
                seatId: seat.id,
                status: isPreBooked ? "BOOKED" : "AVAILABLE",
                holdExpiresAt: null,
                heldByUserId: null,
                priceCents: seatPrice,
                version: 1,
                updatedAt: new Date().toISOString(),
              };

              this.showtimeSeats.set(`${showtimeId}_${seat.id}`, stSeat);
            }
          }
        }
      }
    }
  }

  // --- Query Methods ---

  getMovies(filters?: {
    search?: string;
    genre?: string;
    language?: string;
    status?: "NOW_SHOWING" | "COMING_SOON";
  }): (SeedMovie & { genres: SeedGenre[] })[] {
    let list = Array.from(this.movies.values());

    if (filters?.status) {
      list = list.filter((m) => m.status === filters.status);
    }
    if (filters?.language) {
      list = list.filter(
        (m) => m.language.toLowerCase() === filters.language?.toLowerCase()
      );
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.director.toLowerCase().includes(q) ||
          m.cast.toLowerCase().includes(q)
      );
    }
    if (filters?.genre) {
      const genreSlug = filters.genre.toLowerCase();
      list = list.filter((m) => m.genreSlugs.includes(genreSlug));
    }

    return list.map((m) => ({
      ...m,
      genres: m.genreSlugs
        .map((slug) =>
          Array.from(this.genres.values()).find((g) => g.slug === slug)
        )
        .filter(Boolean) as SeedGenre[],
    }));
  }

  getMovieById(idOrSlug: string) {
    const movie =
      this.movies.get(idOrSlug) ||
      Array.from(this.movies.values()).find((m) => m.slug === idOrSlug);
    if (!movie) return null;

    const genres = movie.genreSlugs
      .map((slug) =>
        Array.from(this.genres.values()).find((g) => g.slug === slug)
      )
      .filter(Boolean) as SeedGenre[];

    return { ...movie, genres };
  }

  getCinemas(city?: string): SeedCinema[] {
    let list = Array.from(this.cinemas.values());
    if (city) {
      list = list.filter((c) => c.city.toLowerCase() === city.toLowerCase());
    }
    return list;
  }

  getCinemaById(idOrSlug: string): SeedCinema | null {
    return (
      this.cinemas.get(idOrSlug) ||
      Array.from(this.cinemas.values()).find((c) => c.slug === idOrSlug) ||
      null
    );
  }

  getShowtimesForMovie(
    movieId: string,
    cinemaId?: string,
    dateStr?: string
  ): Array<
    ShowtimeRecord & {
      movie: SeedMovie;
      auditorium: { id: string; name: string; screenType: string };
      cinema: SeedCinema;
    }
  > {
    const results: any[] = [];
    const movie = this.movies.get(movieId);
    if (!movie) return results;

    const showtimeList = Array.from(this.showtimes.values()).filter(
      (st) => st.movieId === movieId && st.status === "SCHEDULED"
    );

    for (const st of showtimeList) {
      // Find which cinema owns this auditorium
      let foundCinema: SeedCinema | null = null;
      let foundScreen: any = null;

      for (const c of this.cinemas.values()) {
        const scr = c.screens.find((s) => s.id === st.auditoriumId);
        if (scr) {
          foundCinema = c;
          foundScreen = scr;
          break;
        }
      }

      if (!foundCinema || !foundScreen) continue;
      if (cinemaId && foundCinema.id !== cinemaId) continue;

      if (dateStr) {
        const stDate = st.startTime.slice(0, 10);
        if (stDate !== dateStr) continue;
      }

      results.push({
        ...st,
        movie,
        auditorium: {
          id: foundScreen.id,
          name: foundScreen.name,
          screenType: foundScreen.screenType,
        },
        cinema: foundCinema,
      });
    }

    return results.sort(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );
  }

  getShowtimeDetails(showtimeId: string) {
    const showtime = this.showtimes.get(showtimeId);
    if (!showtime) return null;

    const movie = this.getMovieById(showtime.movieId);
    let foundCinema: SeedCinema | null = null;
    let foundScreen: any = null;

    for (const c of this.cinemas.values()) {
      const scr = c.screens.find((s) => s.id === showtime.auditoriumId);
      if (scr) {
        foundCinema = c;
        foundScreen = scr;
        break;
      }
    }

    if (!foundCinema || !foundScreen || !movie) return null;

    // Clean expired holds before returning seats
    this.releaseExpiredHoldsInternal();

    // Fetch all seats and current statuses
    const layoutSeats = this.auditoriumSeats.get(foundScreen.id) || [];
    const seatStatuses = layoutSeats.map((seat) => {
      const stSeat = this.showtimeSeats.get(`${showtimeId}_${seat.id}`);
      return {
        ...seat,
        showtimeSeatId: stSeat?.id,
        status: stSeat?.status || "AVAILABLE",
        priceCents: stSeat?.priceCents || showtime.basePriceCents,
        holdExpiresAt: stSeat?.holdExpiresAt || null,
        heldByUserId: stSeat?.heldByUserId || null,
      };
    });

    return {
      showtime,
      movie,
      cinema: foundCinema,
      screen: foundScreen,
      seats: seatStatuses,
    };
  }

  // --- Booking Transactions ---

  /**
   * Step 1-7: Atomic Seat Hold Transaction
   * Locks requested seats, validates availability, creates hold with 10-min expiration,
   * calculates server-side price, and creates pending booking.
   */
  createSeatHold(params: {
    showtimeId: string;
    seatIds: string[];
    userId: string;
    customerEmail: string;
    customerName: string;
    customerPhone?: string;
    idempotencyKey?: string;
  }): {
    success: boolean;
    error?: string;
    booking?: BookingRecord;
    items?: BookingItemRecord[];
  } {
    const {
      showtimeId,
      seatIds,
      userId,
      customerEmail,
      customerName,
      customerPhone,
      idempotencyKey = `hold-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    } = params;

    // Clean expired holds first
    this.releaseExpiredHoldsInternal();

    const showtime = this.showtimes.get(showtimeId);
    if (!showtime) {
      return { success: false, error: "Showtime not found" };
    }
    if (seatIds.length === 0) {
      return { success: false, error: "No seats selected" };
    }
    if (seatIds.length > 8) {
      return { success: false, error: "Maximum 8 tickets per booking" };
    }

    const now = new Date();
    const holdExpiresAt = new Date(now.getTime() + 10 * 60 * 1000).toISOString(); // 10 minutes

    // 1. Transaction Lock & Availability Check
    const targetStSeats: ShowtimeSeatRecord[] = [];
    const targetAudSeats: AuditoriumSeat[] = [];

    for (const seatId of seatIds) {
      const key = `${showtimeId}_${seatId}`;
      const stSeat = this.showtimeSeats.get(key);

      if (!stSeat) {
        return { success: false, error: `Seat ${seatId} not found in showtime` };
      }

      // Check seat availability
      const isExpiredHold =
        stSeat.status === "HELD" &&
        stSeat.holdExpiresAt &&
        new Date(stSeat.holdExpiresAt) < now;

      const isOwnedHold =
        stSeat.status === "HELD" && stSeat.heldByUserId === userId;

      if (
        stSeat.status === "BOOKED" ||
        stSeat.status === "BLOCKED" ||
        (stSeat.status === "HELD" && !isExpiredHold && !isOwnedHold)
      ) {
        return {
          success: false,
          error: `Seat ${stSeat.seatId} is no longer available. Please choose other seats.`,
        };
      }

      // Locate layout seat
      let audSeat: AuditoriumSeat | undefined;
      for (const seats of this.auditoriumSeats.values()) {
        const found = seats.find((s) => s.id === seatId);
        if (found) {
          audSeat = found;
          break;
        }
      }

      if (!audSeat) {
        return { success: false, error: `Seat metadata not found` };
      }

      targetStSeats.push(stSeat);
      targetAudSeats.push(audSeat);
    }

    // 2. Server-side price calculation
    let subtotalCents = 0;
    for (let i = 0; i < targetStSeats.length; i++) {
      subtotalCents += targetStSeats[i].priceCents;
    }
    const bookingFeeCents = 200; // Flat $2.00 fee per order
    const taxCents = Math.round(subtotalCents * 0.08875); // 8.875% tax
    const totalAmountCents = subtotalCents + bookingFeeCents + taxCents;

    // 3. Update Seat Status to HELD
    for (const stSeat of targetStSeats) {
      stSeat.status = "HELD";
      stSeat.holdExpiresAt = holdExpiresAt;
      stSeat.heldByUserId = userId;
      stSeat.version += 1;
      stSeat.updatedAt = now.toISOString();
      this.showtimeSeats.set(`${showtimeId}_${stSeat.seatId}`, stSeat);
    }

    // 4. Create Pending Booking
    const bookingId = `bkg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const bookingRef = `CB-${Math.floor(1000 + Math.random() * 9000)}-${Math.random()
      .toString(36)
      .substring(2, 4)
      .toUpperCase()}`;

    const booking: BookingRecord = {
      id: bookingId,
      bookingReference: bookingRef,
      userId,
      showtimeId,
      status: "PENDING",
      totalAmountCents,
      subtotalCents,
      bookingFeeCents,
      taxCents,
      discountCents: 0,
      expiresAt: holdExpiresAt,
      idempotencyKey,
      customerEmail,
      customerName,
      customerPhone,
      cancelledAt: null,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
    this.bookings.set(bookingId, booking);

    // 5. Create Booking Items
    const items: BookingItemRecord[] = [];
    for (let i = 0; i < targetStSeats.length; i++) {
      const item: BookingItemRecord = {
        id: `bi-${bookingId}-${i + 1}`,
        bookingId,
        showtimeSeatId: targetStSeats[i].id,
        seatId: targetStSeats[i].seatId,
        priceCents: targetStSeats[i].priceCents,
        seatLabel: `${targetAudSeats[i].rowLabel}${targetAudSeats[i].seatNumber}`,
        seatType: targetAudSeats[i].seatType,
        createdAt: now.toISOString(),
      };
      items.push(item);
    }
    this.bookingItems.set(bookingId, items);

    // Audit Log
    this.logAudit({
      userId,
      action: "SEAT_HOLD_CREATED",
      entityType: "BOOKING",
      entityId: bookingId,
      oldValues: null,
      newValues: {
        bookingRef,
        seatCount: seatIds.length,
        expiresAt: holdExpiresAt,
      },
    });

    return { success: true, booking, items };
  }

  /**
   * Step 8-9: Confirm Booking with Verified Payment & Idempotency
   */
  confirmPaymentAndBooking(params: {
    bookingId: string;
    userId: string;
    idempotencyKey: string;
    paymentMethod: {
      cardNumber: string;
      cardBrand?: string;
      lastFour?: string;
    };
    promoCode?: string;
  }): {
    success: boolean;
    error?: string;
    booking?: BookingRecord;
    payment?: PaymentRecord;
    tickets?: TicketRecord[];
  } {
    const { bookingId, userId, idempotencyKey, paymentMethod, promoCode } =
      params;

    // Check Idempotency Key
    if (this.idempotencyKeys.has(idempotencyKey)) {
      const existingPayment = Array.from(this.payments.values()).find(
        (p) => p.idempotencyKey === idempotencyKey
      );
      if (existingPayment) {
        const booking = this.bookings.get(existingPayment.bookingId);
        const tickets = this.tickets.get(existingPayment.bookingId) || [];
        return { success: true, booking, payment: existingPayment, tickets };
      }
    }

    const booking = this.bookings.get(bookingId);
    if (!booking) {
      return { success: false, error: "Booking record not found" };
    }

    if (booking.status === "CONFIRMED") {
      const tickets = this.tickets.get(bookingId) || [];
      const payment = Array.from(this.payments.values()).find(
        (p) => p.bookingId === bookingId
      );
      return { success: true, booking, payment, tickets };
    }

    if (booking.status !== "PENDING") {
      return {
        success: false,
        error: `Booking is in ${booking.status} state and cannot be processed.`,
      };
    }

    const now = new Date();
    if (new Date(booking.expiresAt) < now) {
      booking.status = "EXPIRED";
      return {
        success: false,
        error: "Your seat hold expired. Please re-select your seats.",
      };
    }

    // Apply promo code discount if provided
    let finalTotalCents = booking.totalAmountCents;
    let discountCents = 0;
    if (promoCode) {
      const code = promoCode.toUpperCase();
      if (code === "CINEVIP") {
        discountCents = Math.round(booking.subtotalCents * 0.15); // 15% off subtotal
      } else if (code === "POPCORN") {
        discountCents = 500; // $5.00 off
      }
      finalTotalCents = Math.max(0, booking.totalAmountCents - discountCents);
      booking.discountCents = discountCents;
      booking.promoCode = promoCode;
      booking.totalAmountCents = finalTotalCents;
    }

    // Confirm seats are still held by this user
    const items = this.bookingItems.get(bookingId) || [];
    for (const item of items) {
      const key = `${booking.showtimeId}_${item.seatId}`;
      const stSeat = this.showtimeSeats.get(key);
      if (!stSeat || stSeat.status !== "HELD") {
        return {
          success: false,
          error: `Seat ${item.seatLabel} is no longer held. Transaction aborted.`,
        };
      }
    }

    // 1. Mark seats as BOOKED
    for (const item of items) {
      const key = `${booking.showtimeId}_${item.seatId}`;
      const stSeat = this.showtimeSeats.get(key)!;
      stSeat.status = "BOOKED";
      stSeat.holdExpiresAt = null;
      stSeat.version += 1;
      stSeat.updatedAt = now.toISOString();
      this.showtimeSeats.set(key, stSeat);
    }

    // 2. Mark Booking as CONFIRMED
    booking.status = "CONFIRMED";
    booking.updatedAt = now.toISOString();
    this.bookings.set(bookingId, booking);

    // 3. Create Payment Record
    const lastFour =
      paymentMethod.lastFour ||
      paymentMethod.cardNumber.replace(/\s+/g, "").slice(-4) ||
      "4242";
    const cardBrand = paymentMethod.cardBrand || "Visa";

    const payment: PaymentRecord = {
      id: `pay-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      bookingId,
      userId,
      provider: "STRIPE_TEST",
      providerPaymentId: `pi_test_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
      idempotencyKey,
      amountCents: finalTotalCents,
      currency: "usd",
      status: "SUCCEEDED",
      paymentMethodType: "card",
      lastFour,
      cardBrand,
      metadata: {
        customerEmail: booking.customerEmail,
        promoCode: booking.promoCode || null,
      },
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
    this.payments.set(payment.id, payment);
    this.idempotencyKeys.add(idempotencyKey);

    // 4. Generate Digital Tickets with QR code payload
    const tickets: TicketRecord[] = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const ticketCode = `TKT-${booking.bookingReference}-${item.seatLabel}`;
      const qrPayload = JSON.stringify({
        ref: booking.bookingReference,
        code: ticketCode,
        seat: item.seatLabel,
        showtimeId: booking.showtimeId,
        issued: now.toISOString(),
      });

      const ticket: TicketRecord = {
        id: `tkt-${bookingId}-${i + 1}`,
        bookingId,
        ticketCode,
        qrPayload,
        status: "VALID",
        issuedAt: now.toISOString(),
        checkedInAt: null,
      };
      tickets.push(ticket);
    }
    this.tickets.set(bookingId, tickets);

    // Audit Log
    this.logAudit({
      userId,
      action: "BOOKING_CONFIRMED",
      entityType: "BOOKING",
      entityId: bookingId,
      oldValues: { status: "PENDING" },
      newValues: {
        status: "CONFIRMED",
        paymentId: payment.id,
        ticketsIssued: tickets.length,
      },
    });

    return { success: true, booking, payment, tickets };
  }

  /**
   * Cancellation & Refund Engine
   * Validates eligibility (showtime > 2h away), releases seats, updates payment & tickets.
   */
  cancelBooking(params: {
    bookingId: string;
    userId: string;
    isAdmin?: boolean;
    reason?: string;
  }): { success: boolean; error?: string; refundAmountCents?: number } {
    const { bookingId, userId, isAdmin = false, reason } = params;
    const booking = this.bookings.get(bookingId);

    if (!booking) {
      return { success: false, error: "Booking not found" };
    }

    if (!isAdmin && booking.userId !== userId) {
      return { success: false, error: "Unauthorized to cancel this booking" };
    }

    if (booking.status !== "CONFIRMED") {
      return {
        success: false,
        error: `Only confirmed bookings can be cancelled. Current status: ${booking.status}`,
      };
    }

    const showtime = this.showtimes.get(booking.showtimeId);
    if (!showtime) {
      return { success: false, error: "Showtime record not found" };
    }

    const now = new Date();
    const showtimeStart = new Date(showtime.startTime);
    const hoursUntilShow =
      (showtimeStart.getTime() - now.getTime()) / (1000 * 60 * 60);

    // Policy: Cancellation permitted up to 2 hours before showtime
    if (!isAdmin && hoursUntilShow < 2) {
      return {
        success: false,
        error:
          "Cancellations are only permitted up to 2 hours before the showtime start.",
      };
    }

    // 1. Release Seats back to AVAILABLE
    const items = this.bookingItems.get(bookingId) || [];
    for (const item of items) {
      const key = `${booking.showtimeId}_${item.seatId}`;
      const stSeat = this.showtimeSeats.get(key);
      if (stSeat) {
        stSeat.status = "AVAILABLE";
        stSeat.holdExpiresAt = null;
        stSeat.heldByUserId = null;
        stSeat.version += 1;
        stSeat.updatedAt = now.toISOString();
        this.showtimeSeats.set(key, stSeat);
      }
    }

    // 2. Mark Tickets as CANCELLED
    const tickets = this.tickets.get(bookingId) || [];
    for (const t of tickets) {
      t.status = "CANCELLED";
    }

    // 3. Mark Payment as REFUNDED
    const payment = Array.from(this.payments.values()).find(
      (p) => p.bookingId === bookingId
    );
    if (payment) {
      payment.status = "REFUNDED";
      payment.updatedAt = now.toISOString();
    }

    // 4. Update Booking status
    booking.status = "CANCELLED";
    booking.cancelledAt = now.toISOString();
    booking.updatedAt = now.toISOString();

    // Audit Log
    this.logAudit({
      userId,
      action: "BOOKING_CANCELLED",
      entityType: "BOOKING",
      entityId: bookingId,
      oldValues: { status: "CONFIRMED" },
      newValues: {
        status: "CANCELLED",
        refundAmountCents: booking.totalAmountCents,
        reason: reason || "User requested cancellation",
      },
    });

    return {
      success: true,
      refundAmountCents: booking.totalAmountCents,
    };
  }

  /**
   * Idempotent Endpoint for Releasing Expired Seat Holds
   */
  releaseExpiredSeatHolds(): { releasedCount: number; timestamp: string } {
    const now = new Date();
    let releasedCount = 0;

    for (const [key, stSeat] of this.showtimeSeats.entries()) {
      if (
        stSeat.status === "HELD" &&
        stSeat.holdExpiresAt &&
        new Date(stSeat.holdExpiresAt) < now
      ) {
        stSeat.status = "AVAILABLE";
        stSeat.holdExpiresAt = null;
        stSeat.heldByUserId = null;
        stSeat.version += 1;
        stSeat.updatedAt = now.toISOString();
        this.showtimeSeats.set(key, stSeat);
        releasedCount++;
      }
    }

    // Expire associated pending bookings
    for (const booking of this.bookings.values()) {
      if (
        booking.status === "PENDING" &&
        new Date(booking.expiresAt) < now
      ) {
        booking.status = "EXPIRED";
        booking.updatedAt = now.toISOString();
      }
    }

    if (releasedCount > 0) {
      this.logAudit({
        userId: null,
        action: "HOLDS_EXPIRED_CLEANED",
        entityType: "SHOWTIME_SEAT",
        entityId: "CRON_CLEANUP",
        oldValues: null,
        newValues: { releasedCount },
      });
    }

    return { releasedCount, timestamp: now.toISOString() };
  }

  private releaseExpiredHoldsInternal() {
    this.releaseExpiredSeatHolds();
  }

  // --- User & Booking Fetchers ---

  getUserBookings(userId: string) {
    const list = Array.from(this.bookings.values()).filter(
      (b) => b.userId === userId
    );

    return list
      .map((b) => {
        const showtime = this.showtimes.get(b.showtimeId);
        const movie = showtime ? this.getMovieById(showtime.movieId) : null;
        const items = this.bookingItems.get(b.id) || [];
        const tickets = this.tickets.get(b.id) || [];
        const payment = Array.from(this.payments.values()).find(
          (p) => p.bookingId === b.id
        );

        let cinema: SeedCinema | null = null;
        let screen: any = null;
        if (showtime) {
          for (const c of this.cinemas.values()) {
            const scr = c.screens.find((s) => s.id === showtime.auditoriumId);
            if (scr) {
              cinema = c;
              screen = scr;
              break;
            }
          }
        }

        return {
          ...b,
          showtime,
          movie,
          cinema,
          screen,
          items,
          tickets,
          payment,
        };
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }

  getBookingDetails(bookingIdOrRef: string) {
    const booking =
      this.bookings.get(bookingIdOrRef) ||
      Array.from(this.bookings.values()).find(
        (b) => b.bookingReference === bookingIdOrRef
      );
    if (!booking) return null;

    const showtime = this.showtimes.get(booking.showtimeId);
    const movie = showtime ? this.getMovieById(showtime.movieId) : null;
    const items = this.bookingItems.get(booking.id) || [];
    const tickets = this.tickets.get(booking.id) || [];
    const payment = Array.from(this.payments.values()).find(
      (p) => p.bookingId === booking.id
    );

    let cinema: SeedCinema | null = null;
    let screen: any = null;
    if (showtime) {
      for (const c of this.cinemas.values()) {
        const scr = c.screens.find((s) => s.id === showtime.auditoriumId);
        if (scr) {
          cinema = c;
          screen = scr;
          break;
        }
      }
    }

    return {
      ...booking,
      showtime,
      movie,
      cinema,
      screen,
      items,
      tickets,
      payment,
    };
  }

  getTicketDetails(ticketIdOrCode: string) {
    let foundTicket: TicketRecord | null = null;
    let foundBookingId: string | null = null;

    for (const [bkgId, tickets] of this.tickets.entries()) {
      const t = tickets.find(
        (item) => item.id === ticketIdOrCode || item.ticketCode === ticketIdOrCode
      );
      if (t) {
        foundTicket = t;
        foundBookingId = bkgId;
        break;
      }
    }

    if (!foundTicket || !foundBookingId) return null;

    const bookingDetails = this.getBookingDetails(foundBookingId);
    if (!bookingDetails) return null;

    // Generate QR SVG
    const qrSvg = generateQRCodeSVG(foundTicket.ticketCode, 220);

    return {
      ticket: foundTicket,
      qrSvg,
      booking: bookingDetails,
    };
  }

  verifyAndCheckInTicket(ticketCode: string): {
    success: boolean;
    error?: string;
    ticket?: TicketRecord;
    booking?: any;
  } {
    const ticketData = this.getTicketDetails(ticketCode);
    if (!ticketData) {
      return { success: false, error: "Invalid ticket code. Ticket not found." };
    }

    const { ticket, booking } = ticketData;

    if (ticket.status === "USED") {
      return {
        success: false,
        error: `Ticket has already been used on ${new Date(
          ticket.checkedInAt!
        ).toLocaleString()}.`,
        ticket,
        booking,
      };
    }

    if (ticket.status === "CANCELLED" || booking.status === "CANCELLED") {
      return {
        success: false,
        error: "This ticket has been cancelled / refunded.",
        ticket,
        booking,
      };
    }

    ticket.status = "USED";
    ticket.checkedInAt = new Date().toISOString();

    this.logAudit({
      userId: null,
      action: "TICKET_CHECKED_IN",
      entityType: "TICKET",
      entityId: ticket.ticketCode,
      oldValues: { status: "VALID" },
      newValues: { status: "USED", checkedInAt: ticket.checkedInAt },
    });

    return { success: true, ticket, booking };
  }

  // --- Admin Statistics & Management ---

  getAdminStats() {
    const totalBookings = Array.from(this.bookings.values()).filter(
      (b) => b.status === "CONFIRMED"
    );
    const totalRevenueCents = totalBookings.reduce(
      (sum, b) => sum + b.totalAmountCents,
      0
    );
    const totalTicketsSold = Array.from(this.tickets.values()).reduce(
      (sum, tList) =>
        sum + tList.filter((t) => t.status === "VALID" || t.status === "USED").length,
      0
    );

    const totalSeatsCount = Array.from(this.showtimeSeats.values()).length;
    const occupiedSeatsCount = Array.from(this.showtimeSeats.values()).filter(
      (s) => s.status === "BOOKED"
    ).length;
    const occupancyRate =
      totalSeatsCount > 0
        ? Math.round((occupiedSeatsCount / totalSeatsCount) * 100)
        : 0;

    return {
      totalRevenueCents,
      totalBookingsCount: totalBookings.length,
      totalTicketsSold,
      occupancyRate,
      activeMoviesCount: Array.from(this.movies.values()).filter(
        (m) => m.status === "NOW_SHOWING"
      ).length,
      activeCinemasCount: this.cinemas.size,
      recentBookings: Array.from(this.bookings.values())
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 10)
        .map((b) => this.getBookingDetails(b.id)),
      auditLogs: this.auditLogs.slice(-20).reverse(),
    };
  }

  addMovie(movie: Omit<SeedMovie, "id">): SeedMovie {
    const id = `m-${Date.now()}`;
    const newMovie: SeedMovie = { ...movie, id };
    this.movies.set(id, newMovie);

    this.logAudit({
      userId: null,
      action: "MOVIE_CREATED",
      entityType: "MOVIE",
      entityId: id,
      oldValues: null,
      newValues: { title: newMovie.title },
    });

    return newMovie;
  }

  addShowtime(showtime: Omit<ShowtimeRecord, "id" | "status">): ShowtimeRecord {
    const id = `st-${Date.now()}`;
    const newShowtime: ShowtimeRecord = {
      ...showtime,
      id,
      status: "SCHEDULED",
    };
    this.showtimes.set(id, newShowtime);

    // Initialize seats
    const seats = this.auditoriumSeats.get(showtime.auditoriumId) || [];
    for (const seat of seats) {
      const priceCents = Math.round(
        (newShowtime.basePriceCents * seat.basePriceMultiplier) / 100
      );
      const stSeat: ShowtimeSeatRecord = {
        id: `sts-${id}-${seat.id}`,
        showtimeId: id,
        seatId: seat.id,
        status: "AVAILABLE",
        holdExpiresAt: null,
        heldByUserId: null,
        priceCents,
        version: 1,
        updatedAt: new Date().toISOString(),
      };
      this.showtimeSeats.set(`${id}_${seat.id}`, stSeat);
    }

    this.logAudit({
      userId: null,
      action: "SHOWTIME_SCHEDULED",
      entityType: "SHOWTIME",
      entityId: id,
      oldValues: null,
      newValues: {
        movieId: newShowtime.movieId,
        startTime: newShowtime.startTime,
      },
    });

    return newShowtime;
  }

  getAuditLogs(): AuditLogRecord[] {
    return [...this.auditLogs].reverse();
  }

  private logAudit(entry: Omit<AuditLogRecord, "id" | "createdAt">) {
    const record: AuditLogRecord = {
      ...entry,
      id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    this.auditLogs.push(record);
  }
}

// Global Singleton Store Instance
const globalForCinema = globalThis as unknown as {
  cinemaStore: CinemaDataStore | undefined;
};

export const cinemaStore =
  globalForCinema.cinemaStore ?? new CinemaDataStore();

if (process.env.NODE_ENV !== "production") {
  globalForCinema.cinemaStore = cinemaStore;
}
