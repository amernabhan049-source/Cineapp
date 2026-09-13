import { getDb } from "./index";
import { sql } from "drizzle-orm";

export async function runMigrations() {
  const db = getDb();
  if (!db) {
    console.log("No PostgreSQL connection configured. Using in-memory cinema storage engine.");
    return;
  }

  console.log("Running PostgreSQL table migrations...");
  try {
    // Generate base tables if not present
    await db.execute(sql`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'USER',
        phone VARCHAR(50),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS genres (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL UNIQUE,
        slug VARCHAR(100) NOT NULL UNIQUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS movies (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        description TEXT NOT NULL,
        poster_url TEXT NOT NULL,
        backdrop_url TEXT NOT NULL,
        trailer_url TEXT NOT NULL,
        duration_mins INT NOT NULL,
        rating VARCHAR(20) NOT NULL DEFAULT 'PG-13',
        imdb_score VARCHAR(10) DEFAULT '8.5',
        release_date TIMESTAMPTZ NOT NULL,
        language VARCHAR(100) NOT NULL DEFAULT 'English',
        director VARCHAR(255),
        cast TEXT,
        status VARCHAR(50) NOT NULL DEFAULT 'NOW_SHOWING',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS movie_genres (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        movie_id UUID NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
        genre_id UUID NOT NULL REFERENCES genres(id) ON DELETE CASCADE,
        CONSTRAINT movie_genre_uniq UNIQUE (movie_id, genre_id)
      );

      CREATE TABLE IF NOT EXISTS cinemas (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        address TEXT NOT NULL,
        city VARCHAR(100) NOT NULL,
        state VARCHAR(50) NOT NULL,
        postal_code VARCHAR(20) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        image_url TEXT,
        amenities JSONB NOT NULL DEFAULT '[]',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS auditoriums (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        cinema_id UUID NOT NULL REFERENCES cinemas(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        screen_type VARCHAR(50) NOT NULL DEFAULT 'STANDARD',
        total_seats INT NOT NULL DEFAULT 100,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT cinema_auditorium_uniq UNIQUE (cinema_id, name)
      );

      CREATE TABLE IF NOT EXISTS seats (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        auditorium_id UUID NOT NULL REFERENCES auditoriums(id) ON DELETE CASCADE,
        row_label VARCHAR(10) NOT NULL,
        seat_number INT NOT NULL,
        seat_type VARCHAR(50) NOT NULL DEFAULT 'STANDARD',
        base_price_multiplier INT NOT NULL DEFAULT 100,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT auditorium_seat_uniq UNIQUE (auditorium_id, row_label, seat_number)
      );

      CREATE TABLE IF NOT EXISTS showtimes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        movie_id UUID NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
        auditorium_id UUID NOT NULL REFERENCES auditoriums(id) ON DELETE CASCADE,
        start_time TIMESTAMPTZ NOT NULL,
        end_time TIMESTAMPTZ NOT NULL,
        base_price_cents INT NOT NULL,
        format VARCHAR(50) NOT NULL DEFAULT '2D',
        status VARCHAR(50) NOT NULL DEFAULT 'SCHEDULED',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS showtime_seats (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        showtime_id UUID NOT NULL REFERENCES showtimes(id) ON DELETE CASCADE,
        seat_id UUID NOT NULL REFERENCES seats(id) ON DELETE CASCADE,
        status VARCHAR(50) NOT NULL DEFAULT 'AVAILABLE',
        hold_expires_at TIMESTAMPTZ,
        held_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        price_cents INT NOT NULL,
        version INT NOT NULL DEFAULT 1,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT showtime_seat_uniq UNIQUE (showtime_id, seat_id)
      );

      CREATE TABLE IF NOT EXISTS bookings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        booking_reference VARCHAR(50) NOT NULL UNIQUE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        showtime_id UUID NOT NULL REFERENCES showtimes(id) ON DELETE CASCADE,
        status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
        total_amount_cents INT NOT NULL,
        subtotal_cents INT NOT NULL,
        booking_fee_cents INT NOT NULL DEFAULT 200,
        tax_cents INT NOT NULL DEFAULT 0,
        discount_cents INT NOT NULL DEFAULT 0,
        promo_code VARCHAR(50),
        expires_at TIMESTAMPTZ NOT NULL,
        idempotency_key VARCHAR(255) NOT NULL UNIQUE,
        customer_email VARCHAR(255) NOT NULL,
        customer_name VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(50),
        cancelled_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS booking_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
        showtime_seat_id UUID NOT NULL REFERENCES showtime_seats(id) ON DELETE CASCADE,
        seat_id UUID NOT NULL REFERENCES seats(id) ON DELETE CASCADE,
        price_cents INT NOT NULL,
        seat_label VARCHAR(20) NOT NULL,
        seat_type VARCHAR(50) NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS payments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        provider VARCHAR(50) NOT NULL DEFAULT 'STRIPE_TEST',
        provider_payment_id VARCHAR(255) NOT NULL,
        idempotency_key VARCHAR(255) NOT NULL UNIQUE,
        amount_cents INT NOT NULL,
        currency VARCHAR(10) NOT NULL DEFAULT 'usd',
        status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
        payment_method_type VARCHAR(50) NOT NULL DEFAULT 'card',
        last_four VARCHAR(4) DEFAULT '4242',
        card_brand VARCHAR(50) DEFAULT 'Visa',
        metadata JSONB,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS tickets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
        ticket_code VARCHAR(100) NOT NULL UNIQUE,
        qr_payload TEXT NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'VALID',
        issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        checked_in_at TIMESTAMPTZ
      );

      CREATE TABLE IF NOT EXISTS audit_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        action VARCHAR(100) NOT NULL,
        entity_type VARCHAR(100) NOT NULL,
        entity_id VARCHAR(255) NOT NULL,
        old_values JSONB,
        new_values JSONB,
        ip_address VARCHAR(100),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    console.log("PostgreSQL schema successfully initialized!");
  } catch (err) {
    console.error("Migration error:", err);
  }
}
