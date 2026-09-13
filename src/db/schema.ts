import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// 1. Users
export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    role: varchar("role", { length: 50 }).notNull().default("USER"), // 'USER' | 'ADMIN'
    phone: varchar("phone", { length: 50 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    emailIdx: index("users_email_idx").on(table.email),
    roleIdx: index("users_role_idx").on(table.role),
  })
);

// 2. Genres
export const genres = pgTable(
  "genres",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 100 }).notNull().unique(),
    slug: varchar("slug", { length: 100 }).notNull().unique(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    slugIdx: index("genres_slug_idx").on(table.slug),
  })
);

// 3. Movies
export const movies = pgTable(
  "movies",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    description: text("description").notNull(),
    posterUrl: text("poster_url").notNull(),
    backdropUrl: text("backdrop_url").notNull(),
    trailerUrl: text("trailer_url").notNull(),
    durationMins: integer("duration_mins").notNull(),
    rating: varchar("rating", { length: 20 }).notNull().default("PG-13"), // PG-13, R, PG, G
    imdbScore: varchar("imdb_score", { length: 10 }).default("8.5"),
    releaseDate: timestamp("release_date", { withTimezone: true }).notNull(),
    language: varchar("language", { length: 100 }).notNull().default("English"),
    director: varchar("director", { length: 255 }),
    cast: text("cast"),
    status: varchar("status", { length: 50 }).notNull().default("NOW_SHOWING"), // 'NOW_SHOWING' | 'COMING_SOON'
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    statusIdx: index("movies_status_idx").on(table.status),
    releaseDateIdx: index("movies_release_date_idx").on(table.releaseDate),
    slugIdx: index("movies_slug_idx").on(table.slug),
  })
);

// 4. Movie Genres (Junction Table)
export const movieGenres = pgTable(
  "movie_genres",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    movieId: uuid("movie_id")
      .notNull()
      .references(() => movies.id, { onDelete: "cascade" }),
    genreId: uuid("genre_id")
      .notNull()
      .references(() => genres.id, { onDelete: "cascade" }),
  },
  (table) => ({
    movieGenreUniq: uniqueIndex("movie_genre_unique_idx").on(
      table.movieId,
      table.genreId
    ),
    movieIdIdx: index("movie_genres_movie_id_idx").on(table.movieId),
    genreIdIdx: index("movie_genres_genre_id_idx").on(table.genreId),
  })
);

// 5. Cinemas
export const cinemas = pgTable(
  "cinemas",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    address: text("address").notNull(),
    city: varchar("100").notNull(),
    state: varchar("50").notNull(),
    postalCode: varchar("postal_code", { length: 20 }).notNull(),
    phone: varchar("phone", { length: 50 }).notNull(),
    imageUrl: text("image_url"),
    amenities: jsonb("amenities").notNull().default([]), // ["IMAX", "Dolby Atmos", "Recliners", "Gourmet Bar"]
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    cityIdx: index("cinemas_city_idx").on(table.city),
    slugIdx: index("cinemas_slug_idx").on(table.slug),
  })
);

// 6. Auditoriums
export const auditoriums = pgTable(
  "auditoriums",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    cinemaId: uuid("cinema_id")
      .notNull()
      .references(() => cinemas.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 100 }).notNull(), // e.g., "Screen 1 - IMAX"
    screenType: varchar("screen_type", { length: 50 }).notNull().default("STANDARD"), // 'STANDARD' | 'IMAX' | 'DOLBY_CINEMA' | 'VIP_LUXE'
    totalSeats: integer("total_seats").notNull().default(100),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    cinemaAuditoriumUniq: uniqueIndex("cinema_auditorium_unique_idx").on(
      table.cinemaId,
      table.name
    ),
    cinemaIdIdx: index("auditoriums_cinema_id_idx").on(table.cinemaId),
  })
);

// 7. Seats (Permanent layout per auditorium)
export const seats = pgTable(
  "seats",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    auditoriumId: uuid("auditorium_id")
      .notNull()
      .references(() => auditoriums.id, { onDelete: "cascade" }),
    rowLabel: varchar("row_label", { length: 10 }).notNull(), // 'A', 'B', 'C', etc.
    seatNumber: integer("seat_number").notNull(), // 1, 2, 3, etc.
    seatType: varchar("seat_type", { length: 50 }).notNull().default("STANDARD"), // 'STANDARD' | 'PREMIUM' | 'RECLINER' | 'VIP' | 'ACCESSIBLE'
    basePriceMultiplier: integer("base_price_multiplier").notNull().default(100), // 100 = 1.00x, 150 = 1.50x
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    auditoriumSeatUniq: uniqueIndex("auditorium_seat_unique_idx").on(
      table.auditoriumId,
      table.rowLabel,
      table.seatNumber
    ),
    auditoriumIdIdx: index("seats_auditorium_id_idx").on(table.auditoriumId),
  })
);

// 8. Showtimes
export const showtimes = pgTable(
  "showtimes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    movieId: uuid("movie_id")
      .notNull()
      .references(() => movies.id, { onDelete: "cascade" }),
    auditoriumId: uuid("auditorium_id")
      .notNull()
      .references(() => auditoriums.id, { onDelete: "cascade" }),
    startTime: timestamp("start_time", { withTimezone: true }).notNull(),
    endTime: timestamp("end_time", { withTimezone: true }).notNull(),
    basePriceCents: integer("base_price_cents").notNull(), // e.g. 1500 = $15.00
    format: varchar("format", { length: 50 }).notNull().default("2D"), // '2D' | '3D' | 'IMAX_3D' | 'DOLBY_ATMOS'
    status: varchar("status", { length: 50 }).notNull().default("SCHEDULED"), // 'SCHEDULED' | 'CANCELLED' | 'COMPLETED'
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    movieShowtimeIdx: index("showtimes_movie_id_idx").on(table.movieId),
    auditoriumShowtimeIdx: index("showtimes_auditorium_id_idx").on(table.auditoriumId),
    startTimeIdx: index("showtimes_start_time_idx").on(table.startTime),
  })
);

// 9. Showtime Seats (Dynamic availability per showtime)
export const showtimeSeats = pgTable(
  "showtime_seats",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    showtimeId: uuid("showtime_id")
      .notNull()
      .references(() => showtimes.id, { onDelete: "cascade" }),
    seatId: uuid("seat_id")
      .notNull()
      .references(() => seats.id, { onDelete: "cascade" }),
    status: varchar("status", { length: 50 }).notNull().default("AVAILABLE"), // 'AVAILABLE' | 'HELD' | 'BOOKED' | 'BLOCKED'
    holdExpiresAt: timestamp("hold_expires_at", { withTimezone: true }),
    heldByUserId: uuid("held_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    priceCents: integer("price_cents").notNull(),
    version: integer("version").notNull().default(1),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    showtimeSeatUniq: uniqueIndex("showtime_seat_unique_idx").on(
      table.showtimeId,
      table.seatId
    ),
    showtimeIdIdx: index("showtime_seats_showtime_id_idx").on(table.showtimeId),
    statusIdx: index("showtime_seats_status_idx").on(table.status),
    holdExpiresIdx: index("showtime_seats_hold_expires_idx").on(table.holdExpiresAt),
  })
);

// 10. Bookings
export const bookings = pgTable(
  "bookings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    bookingReference: varchar("booking_reference", { length: 50 }).notNull().unique(), // e.g. 'CB-7392-81'
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    showtimeId: uuid("showtime_id")
      .notNull()
      .references(() => showtimes.id, { onDelete: "cascade" }),
    status: varchar("status", { length: 50 }).notNull().default("PENDING"), // 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'EXPIRED' | 'REFUNDED'
    totalAmountCents: integer("total_amount_cents").notNull(),
    subtotalCents: integer("subtotal_cents").notNull(),
    bookingFeeCents: integer("booking_fee_cents").notNull().default(200),
    taxCents: integer("tax_cents").notNull().default(0),
    discountCents: integer("discount_cents").notNull().default(0),
    promoCode: varchar("promo_code", { length: 50 }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    idempotencyKey: varchar("idempotency_key", { length: 255 }).notNull().unique(),
    customerEmail: varchar("customer_email", { length: 255 }).notNull(),
    customerName: varchar("customer_name", { length: 255 }).notNull(),
    customerPhone: varchar("customer_phone", { length: 50 }),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("bookings_user_id_idx").on(table.userId),
    showtimeIdIdx: index("bookings_showtime_id_idx").on(table.showtimeId),
    statusIdx: index("bookings_status_idx").on(table.status),
    refIdx: index("bookings_ref_idx").on(table.bookingReference),
    idempotencyIdx: index("bookings_idempotency_idx").on(table.idempotencyKey),
  })
);

// 11. Booking Items
export const bookingItems = pgTable(
  "booking_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    bookingId: uuid("booking_id")
      .notNull()
      .references(() => bookings.id, { onDelete: "cascade" }),
    showtimeSeatId: uuid("showtime_seat_id")
      .notNull()
      .references(() => showtimeSeats.id, { onDelete: "cascade" }),
    seatId: uuid("seat_id")
      .notNull()
      .references(() => seats.id, { onDelete: "cascade" }),
    priceCents: integer("price_cents").notNull(),
    seatLabel: varchar("seat_label", { length: 20 }).notNull(), // 'D-8'
    seatType: varchar("seat_type", { length: 50 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    bookingIdIdx: index("booking_items_booking_id_idx").on(table.bookingId),
    seatIdIdx: index("booking_items_seat_id_idx").on(table.seatId),
  })
);

// 12. Payments
export const payments = pgTable(
  "payments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    bookingId: uuid("booking_id")
      .notNull()
      .references(() => bookings.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    provider: varchar("provider", { length: 50 }).notNull().default("STRIPE_TEST"), // 'STRIPE_TEST' | 'MOCK_GATEWAY'
    providerPaymentId: varchar("provider_payment_id", { length: 255 }).notNull(),
    idempotencyKey: varchar("idempotency_key", { length: 255 }).notNull().unique(),
    amountCents: integer("amount_cents").notNull(),
    currency: varchar("currency", { length: 10 }).notNull().default("usd"),
    status: varchar("status", { length: 50 }).notNull().default("PENDING"), // 'PENDING' | 'SUCCEEDED' | 'FAILED' | 'REFUNDED'
    paymentMethodType: varchar("payment_method_type", { length: 50 }).notNull().default("card"),
    lastFour: varchar("last_four", { length: 4 }).default("4242"),
    cardBrand: varchar("card_brand", { length: 50 }).default("Visa"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    bookingIdIdx: index("payments_booking_id_idx").on(table.bookingId),
    idempotencyIdx: index("payments_idempotency_idx").on(table.idempotencyKey),
    statusIdx: index("payments_status_idx").on(table.status),
  })
);

// 13. Tickets
export const tickets = pgTable(
  "tickets",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    bookingId: uuid("booking_id")
      .notNull()
      .references(() => bookings.id, { onDelete: "cascade" }),
    ticketCode: varchar("ticket_code", { length: 100 }).notNull().unique(), // e.g. 'TKT-CB-7392-81-D8'
    qrPayload: text("qr_payload").notNull(),
    status: varchar("status", { length: 50 }).notNull().default("VALID"), // 'VALID' | 'USED' | 'CANCELLED'
    issuedAt: timestamp("issued_at", { withTimezone: true }).defaultNow().notNull(),
    checkedInAt: timestamp("checked_in_at", { withTimezone: true }),
  },
  (table) => ({
    bookingIdIdx: index("tickets_booking_id_idx").on(table.bookingId),
    ticketCodeIdx: index("tickets_ticket_code_idx").on(table.ticketCode),
    statusIdx: index("tickets_status_idx").on(table.status),
  })
);

// 14. Audit Logs
export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    action: varchar("action", { length: 100 }).notNull(), // 'SEAT_HOLD_CREATED', 'PAYMENT_SUCCEEDED', 'BOOKING_CONFIRMED', etc.
    entityType: varchar("entity_type", { length: 100 }).notNull(), // 'BOOKING', 'SHOWTIME_SEAT', 'PAYMENT', etc.
    entityId: varchar("entity_id", { length: 255 }).notNull(),
    oldValues: jsonb("old_values"),
    newValues: jsonb("new_values"),
    ipAddress: varchar("ip_address", { length: 100 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    actionIdx: index("audit_logs_action_idx").on(table.action),
    entityTypeIdx: index("audit_logs_entity_type_idx").on(table.entityType),
    createdAtIdx: index("audit_logs_created_at_idx").on(table.createdAt),
  })
);

// Relations definitions
export const usersRelations = relations(users, ({ many }) => ({
  bookings: many(bookings),
  payments: many(payments),
  auditLogs: many(auditLogs),
}));

export const moviesRelations = relations(movies, ({ many }) => ({
  movieGenres: many(movieGenres),
  showtimes: many(showtimes),
}));

export const genresRelations = relations(genres, ({ many }) => ({
  movieGenres: many(movieGenres),
}));

export const movieGenresRelations = relations(movieGenres, ({ one }) => ({
  movie: one(movies, {
    fields: [movieGenres.movieId],
    references: [movies.id],
  }),
  genre: one(genres, {
    fields: [movieGenres.genreId],
    references: [genres.id],
  }),
}));

export const cinemasRelations = relations(cinemas, ({ many }) => ({
  auditoriums: many(auditoriums),
}));

export const auditoriumsRelations = relations(auditoriums, ({ one, many }) => ({
  cinema: one(cinemas, {
    fields: [auditoriums.cinemaId],
    references: [cinemas.id],
  }),
  seats: many(seats),
  showtimes: many(showtimes),
}));

export const seatsRelations = relations(seats, ({ one, many }) => ({
  auditorium: one(auditoriums, {
    fields: [seats.auditoriumId],
    references: [auditoriums.id],
  }),
  showtimeSeats: many(showtimeSeats),
  bookingItems: many(bookingItems),
}));

export const showtimesRelations = relations(showtimes, ({ one, many }) => ({
  movie: one(movies, {
    fields: [showtimes.movieId],
    references: [movies.id],
  }),
  auditorium: one(auditoriums, {
    fields: [showtimes.auditoriumId],
    references: [auditoriums.id],
  }),
  showtimeSeats: many(showtimeSeats),
  bookings: many(bookings),
}));

export const showtimeSeatsRelations = relations(showtimeSeats, ({ one, many }) => ({
  showtime: one(showtimes, {
    fields: [showtimeSeats.showtimeId],
    references: [showtimes.id],
  }),
  seat: one(seats, {
    fields: [showtimeSeats.seatId],
    references: [seats.id],
  }),
  heldByUser: one(users, {
    fields: [showtimeSeats.heldByUserId],
    references: [users.id],
  }),
  bookingItems: many(bookingItems),
}));

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  user: one(users, {
    fields: [bookings.userId],
    references: [users.id],
  }),
  showtime: one(showtimes, {
    fields: [bookings.showtimeId],
    references: [showtimes.id],
  }),
  bookingItems: many(bookingItems),
  payments: many(payments),
  tickets: many(tickets),
}));

export const bookingItemsRelations = relations(bookingItems, ({ one }) => ({
  booking: one(bookings, {
    fields: [bookingItems.bookingId],
    references: [bookings.id],
  }),
  showtimeSeat: one(showtimeSeats, {
    fields: [bookingItems.showtimeSeatId],
    references: [showtimeSeats.id],
  }),
  seat: one(seats, {
    fields: [bookingItems.seatId],
    references: [seats.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  booking: one(bookings, {
    fields: [payments.bookingId],
    references: [bookings.id],
  }),
  user: one(users, {
    fields: [payments.userId],
    references: [users.id],
  }),
}));

export const ticketsRelations = relations(tickets, ({ one }) => ({
  booking: one(bookings, {
    fields: [tickets.bookingId],
    references: [bookings.id],
  }),
}));
