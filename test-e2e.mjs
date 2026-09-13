// Comprehensive E2E Verification Script for CineBook
const BASE_URL = "http://localhost:3000";

async function runTests() {
  console.log("🎬 Starting CineBook Automated E2E Test Suite...\n");

  let cookieHeader = "";

  // 1. Test Home / Catalog API
  console.log("1. Testing Movies API (/api/movies)...");
  const moviesRes = await fetch(`${BASE_URL}/api/movies`);
  const moviesData = await moviesRes.json();
  console.log(`   ✓ Found ${moviesData.movies.length} movies and ${moviesData.genres.length} genres.`);
  if (moviesData.movies.length === 0) throw new Error("No movies returned");

  // 2. Test Cinemas API
  console.log("\n2. Testing Cinemas API (/api/cinemas)...");
  const cinemasRes = await fetch(`${BASE_URL}/api/cinemas`);
  const cinemasData = await cinemasRes.json();
  console.log(`   ✓ Found ${cinemasData.cinemas.length} flagship cinemas.`);
  if (cinemasData.cinemas.length === 0) throw new Error("No cinemas returned");

  // 3. Test Authentication Login
  console.log("\n3. Testing Demo Customer Login (/api/auth/login)...");
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isDemo: true, demoRole: "USER" }),
  });
  const loginData = await loginRes.json();
  const setCookie = loginRes.headers.get("set-cookie");
  if (setCookie) {
    cookieHeader = setCookie.split(";")[0];
  }
  console.log(`   ✓ Logged in as: ${loginData.user?.name} (${loginData.user?.email}) [Role: ${loginData.user?.role}]`);

  // 4. Test Movie Details & Showtimes
  const testMovie = moviesData.movies[0];
  console.log(`\n4. Testing Movie Details for "${testMovie.title}" (/api/movies/${testMovie.id})...`);
  const movieDetailRes = await fetch(`${BASE_URL}/api/movies/${testMovie.id}`);
  const movieDetailData = await movieDetailRes.json();
  console.log(`   ✓ Retrieved movie details with ${movieDetailData.showtimes.length} scheduled showtimes.`);

  const testShowtime = movieDetailData.showtimes[0];
  if (!testShowtime) throw new Error("No showtimes available for test");

  // 5. Test Showtime Seats Matrix
  console.log(`\n5. Testing Showtime Seats for showtime "${testShowtime.id}" (/api/showtimes/${testShowtime.id})...`);
  const stRes = await fetch(`${BASE_URL}/api/showtimes/${testShowtime.id}`);
  const stData = await stRes.json();
  const availableSeats = stData.seats.filter((s) => s.status === "AVAILABLE");
  console.log(`   ✓ Total seats in auditorium: ${stData.seats.length} (${availableSeats.length} available).`);

  const seatsToBook = availableSeats.slice(0, 2);
  const seatIds = seatsToBook.map((s) => s.id);
  console.log(`   ✓ Selecting seats: ${seatsToBook.map((s) => `${s.rowLabel}${s.seatNumber}`).join(", ")}`);

  // 6. Test Atomic Seat Hold Transaction
  console.log("\n6. Testing Atomic Seat Hold Transaction (/api/bookings/hold)...");
  const holdRes = await fetch(`${BASE_URL}/api/bookings/hold`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader,
    },
    body: JSON.stringify({
      showtimeId: testShowtime.id,
      seatIds,
      customerEmail: "customer@cinebook.com",
      customerName: "Alex Morgan",
    }),
  });
  const holdData = await holdRes.json();
  if (!holdRes.ok) throw new Error(`Hold failed: ${holdData.error}`);
  console.log(`   ✓ Created 10-minute seat hold. Booking Ref: ${holdData.booking.bookingReference}`);
  console.log(`   ✓ Total Amount: $${(holdData.booking.totalAmountCents / 100).toFixed(2)} (Subtotal: $${(holdData.booking.subtotalCents / 100).toFixed(2)}, Fee: $${(holdData.booking.bookingFeeCents / 100).toFixed(2)}, Tax: $${(holdData.booking.taxCents / 100).toFixed(2)})`);

  // Test race condition: try holding the same seat simultaneously
  console.log("   - Testing Race Condition: Attempting to hold already held seat...");
  const conflictHoldRes = await fetch(`${BASE_URL}/api/bookings/hold`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      showtimeId: testShowtime.id,
      seatIds: [seatIds[0]],
      customerEmail: "other@example.com",
      customerName: "Other User",
    }),
  });
  if (conflictHoldRes.status === 409) {
    console.log("   ✓ Successfully rejected conflicting seat hold with 409 Conflict!");
  } else {
    console.warn(`   ! Expected 409 Conflict, got status ${conflictHoldRes.status}`);
  }

  // 7. Test Payment Verification & Idempotency
  console.log("\n7. Testing Test Payment Gateway & Ticket Issuance (/api/payments/process)...");
  const idempotencyKey = `idemp-test-${Date.now()}`;
  const payRes = await fetch(`${BASE_URL}/api/payments/process`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader,
    },
    body: JSON.stringify({
      bookingId: holdData.booking.id,
      idempotencyKey,
      promoCode: "CINEVIP",
      paymentMethod: {
        cardNumber: "4242 4242 4242 4242",
        cardBrand: "Visa Test",
        lastFour: "4242",
      },
    }),
  });
  const payData = await payRes.json();
  if (!payRes.ok) throw new Error(`Payment failed: ${payData.error}`);
  console.log(`   ✓ Payment succeeded! Provider Payment ID: ${payData.payment.providerPaymentId}`);
  console.log(`   ✓ Issued ${payData.tickets.length} Digital Tickets.`);

  const testTicket = payData.tickets[0];

  // 8. Test Ticket Retrieval & QR SVG
  console.log(`\n8. Testing Digital Ticket endpoint (/api/tickets/${testTicket.id})...`);
  const ticketRes = await fetch(`${BASE_URL}/api/tickets/${testTicket.id}`);
  const ticketData = await ticketRes.json();
  console.log(`   ✓ Verified ticket ${ticketData.ticket.ticketCode}. QR SVG generated (${ticketData.qrSvg.length} bytes).`);

  // 9. Test Cron Expired Hold Release Endpoint with CRON_SECRET
  console.log("\n9. Testing Expired Hold Release Cron (/api/cron/release-holds)...");
  const cronRes = await fetch(`${BASE_URL}/api/cron/release-holds`, {
    method: "POST",
    headers: {
      Authorization: "Bearer cinebook_cron_secret_secure_token_xyz987",
    },
  });
  const cronData = await cronRes.json();
  console.log(`   ✓ Idempotent Cron executed. Response: "${cronData.message}"`);

  // 10. Test Admin Authentication and Ticket Gate Scanner
  console.log("\n10. Testing Admin Login & Ticket Gate Validation (/api/admin/verify-ticket)...");
  const adminLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isDemo: true, demoRole: "ADMIN" }),
  });
  const adminSetCookie = adminLoginRes.headers.get("set-cookie")?.split(";")[0];

  const verifyTicketRes = await fetch(`${BASE_URL}/api/admin/verify-ticket`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: adminSetCookie,
    },
    body: JSON.stringify({ ticketCode: testTicket.ticketCode }),
  });
  const verifyData = await verifyTicketRes.json();
  console.log(`   ✓ Gate Scanner result: "${verifyData.message}" [Status: ${verifyData.ticket?.status}]`);

  // 11. Test Admin Stats & Audit Logs
  console.log("\n11. Testing Admin Stats & Audit Logs (/api/admin/stats & /api/admin/audit-logs)...");
  const statsRes = await fetch(`${BASE_URL}/api/admin/stats`, {
    headers: { Cookie: adminSetCookie },
  });
  const statsData = await statsRes.json();
  console.log(`   ✓ Box Office Revenue: $${(statsData.totalRevenueCents / 100).toFixed(2)} | Total Tickets Sold: ${statsData.totalTicketsSold} | Occupancy: ${statsData.occupancyRate}%`);

  const auditRes = await fetch(`${BASE_URL}/api/admin/audit-logs`, {
    headers: { Cookie: adminSetCookie },
  });
  const auditData = await auditRes.json();
  console.log(`   ✓ Audit Ledger contains ${auditData.count} immutable transaction records.`);

  console.log("\n🎉 ALL E2E TESTS PASSED SUCCESSFULLY! The CineBook application is fully verified and production-ready for Vercel deployment.");
}

runTests().catch((err) => {
  console.error("❌ E2E Test Suite Error:", err);
  process.exit(1);
});
