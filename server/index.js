/* global process */

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import crypto from "crypto";
import pg from "pg";
import { sendTelegramMessage } from "./telegram.js";
import productRoutes from "./products.js";

dotenv.config({ path: ".env.local" });

if (!process.env.DATABASE_URL) {
  console.warn("DATABASE_URL is missing. Create a .env.local file in the project root with a valid PostgreSQL connection string.");
}

const app = express();

app.use(cors({
  origin: [
    "http://localhost:5050",
    "https://shadowbox.dk"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
}));

app.use(express.json());

const { Pool } = pg;
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
});

app.use("/api/products", productRoutes(db));
app.delete("/api/products/:productId", async (req, res) => {
  try {
    const { productId } = req.params;

    const result = await db.query(
      `
      DELETE FROM products
      WHERE product_id = $1
      RETURNING *
      `,
      [productId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        error: "Produkt ikke fundet",
      });
    }

    res.json({
      ok: true,
      deletedProduct: result.rows[0],
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: String(err?.message || err),
    });
  }
});

const ADMIN_USER = {
  email: "admin@coffeetimer.local",
  password: "admin123",
  token: "coffeetimer-admin-token",
};

const BARBERS = [
  { id: "zana", name: "Zana" },
  { id: "daniel", name: "Daniel" },
];

const SERVICES = [
  { id: "hair", name: "Hair klip", price: 200, durationMin: 30 },
  { id: "pension", name: "Pensionklip", price: 150, durationMin: 30 },
  { id: "child", name: "Børneklip", price: 150, durationMin: 30 },
  { id: "beard", name: "Skæg (fra)", price: 100, durationMin: 15 },
];

function isIsoDateTime(value) {
  const date = new Date(value);
  return Number.isFinite(date.getTime()) && typeof value === "string" && value.includes("T");
}

function findBarber(barberId) {
  return BARBERS.find((barber) => barber.id === barberId);
}

function findService(serviceId) {
  return SERVICES.find((service) => service.id === serviceId);
}

function timeOverlaps(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd;
}

async function findConflictingBooking({ barberId, startTime, endTime }) {
  const result = await db.query(
    `
    SELECT booking_id, start_time, end_time
    FROM bookings
    WHERE barber_id = $1
      AND booking_status = 'active'
      AND start_time < $3
      AND end_time > $2
    LIMIT 1
    `,
    [barberId, startTime, endTime]
  );

  return result.rows[0] || null;
}

async function getBookingsForDate({ barberId, date }) {
  const dayStart = new Date(`${date}T00:00:00`);
  const dayEnd = new Date(`${date}T23:59:59`);

  const result = await db.query(
    `
    SELECT booking_id, barber_id, service_id, start_time, end_time
    FROM bookings
    WHERE barber_id = $1
      AND booking_status = 'active'
      AND start_time >= $2
      AND start_time <= $3
    ORDER BY start_time ASC
    `,
    [barberId, dayStart, dayEnd]
  );

  return result.rows;
}

app.get("/api/health", async (req, res) => {
  try {
    await db.query("SELECT 1");
    res.json({ ok: true, status: "server up", database: "connected" });
  } catch (err) {
    res.status(500).json({ ok: false, status: "server up", database: "not connected" });
  }
});

app.get("/api/notify-test", async (req, res) => {
  try {
    const data = await sendTelegramMessage("✅ *ShortCut* — Telegram notifikation virker!");
    res.json({ ok: true, data });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err?.message || err) });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};

    const cleanEmail = String(email || "").trim().toLowerCase();
    const cleanPassword = String(password || "");

    if (cleanEmail !== ADMIN_USER.email || cleanPassword !== ADMIN_USER.password) {
      return res.status(401).json({ ok: false, error: "Invalid admin credentials" });
    }

    res.json({
      ok: true,
      token: ADMIN_USER.token,
      user: {
        email: ADMIN_USER.email,
        role: "admin",
      },
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err?.message || err) });
  }
});

app.post("/api/guest-session", async (req, res) => {
  try {
    const sessionId = crypto.randomUUID();
    const token = crypto.randomUUID();

    await db.query(
      `
      INSERT INTO guest_sessions (session_id, token)
      VALUES ($1, $2)
      `,
      [sessionId, token]
    );

    // opret også cart med det samme
    const cartId = crypto.randomUUID();

    await db.query(
      `
      INSERT INTO carts (cart_id, session_id)
      VALUES ($1, $2)
      `,
      [cartId, sessionId]
    );

    res.json({
      ok: true,
      token,
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.post("/api/cart/items", async (req, res) => {
  try {
    const token = req.headers["x-guest-token"];
    const { productId, quantity } = req.body;

    if (!token) {
      return res.status(401).json({ ok: false, error: "Missing token" });
    }

    // find session
    const sessionResult = await db.query(
      `SELECT session_id FROM guest_sessions WHERE token = $1`,
      [token]
    );

    if (sessionResult.rows.length === 0) {
      return res.status(401).json({ ok: false, error: "Invalid session" });
    }

    const sessionId = sessionResult.rows[0].session_id;

    // find cart
    const cartResult = await db.query(
      `SELECT cart_id FROM carts WHERE session_id = $1`,
      [sessionId]
    );

    const cartId = cartResult.rows[0].cart_id;

    // indsæt item
    await db.query(
      `
      INSERT INTO cart_items (cart_item_id, cart_id, product_id, quantity)
      VALUES ($1, $2, $3, $4)
      `,
      [crypto.randomUUID(), cartId, productId, quantity || 1]
    );

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});
app.get("/api/cart", async (req, res) => {
  try {
    const token = req.headers["x-guest-token"];

    if (!token) {
      return res.status(401).json({ ok: false, error: "Missing token" });
    }

    const result = await db.query(
      `
      SELECT
        ci.cart_item_id,
        ci.quantity,
        p.product_id,
        p.product_name,
        p.product_price,
        p.stock_quantity
      FROM guest_sessions gs
      JOIN carts c ON c.session_id = gs.session_id
      JOIN cart_items ci ON ci.cart_id = c.cart_id
      JOIN products p ON p.product_id = ci.product_id
      WHERE gs.token = $1
      ORDER BY ci.created_at DESC
      `,
      [token]
    );

    res.json({
      ok: true,
      items: result.rows,
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err?.message || err) });
  }
});
app.post("/api/guest-session", async (req, res) => {
  try {
    const token = crypto.randomUUID();

    const result = await db.query(
      `
      INSERT INTO guest_sessions (token)
      VALUES ($1)
      RETURNING *
      `,
      [token]
    );

    res.json({
      ok: true,
      token: result.rows[0].token,
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});


app.get("/api/barbers", (req, res) => {
  res.json({ ok: true, barbers: BARBERS });
});

app.get("/api/services", (req, res) => {
  res.json({ ok: true, services: SERVICES });
});

app.get("/api/availability", async (req, res) => {
  try {
    const { date, barberId } = req.query;

    if (!date || !barberId) {
      return res.status(400).json({ ok: false, error: "Missing date or barberId" });
    }

    const barber = findBarber(barberId);
    if (!barber) {
      return res.status(400).json({ ok: false, error: "Invalid barberId" });
    }

    const dayStart = new Date(`${date}T10:00:00`);
    const dayEnd = new Date(`${date}T18:00:00`);

    if (!Number.isFinite(dayStart.getTime())) {
      return res.status(400).json({ ok: false, error: "Invalid date format. Use YYYY-MM-DD" });
    }

    const existingBookings = await getBookingsForDate({ barberId, date });
    const slotDurationMin = 30;
    const slots = [];

    for (
      let current = new Date(dayStart);
      current < dayEnd;
      current = new Date(current.getTime() + slotDurationMin * 60_000)
    ) {
      const slotStart = new Date(current);
      const slotEnd = new Date(current.getTime() + slotDurationMin * 60_000);

      const isBusy = existingBookings.some((booking) => {
        const bookingStart = new Date(booking.start_time);
        const bookingEnd = new Date(booking.end_time);

        return timeOverlaps(slotStart, slotEnd, bookingStart, bookingEnd);
      });

      if (!isBusy) {
        slots.push(slotStart.toISOString());
      }
    }

    res.json({ ok: true, slots });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err?.message || err) });
  }
});

app.get("/api/bookings", async (req, res) => {
  try {
    const result = await db.query(
      `
      SELECT
        booking_id,
        barber_id,
        barber_name,
        service_id,
        service_name,
        service_price,
        service_duration_min,
        customer_name,
        customer_phone,
        start_time,
        end_time,
        booking_status,
        created_at
      FROM bookings
      ORDER BY start_time DESC
      `
    );

    res.json({ ok: true, bookings: result.rows });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err?.message || err) });
  }
});

app.post("/api/bookings", async (req, res) => {
  try {
    const { barberId, serviceId, startISO, customerName, customerPhone } = req.body || {};

    if (!barberId || !serviceId || !startISO || !customerName) {
      return res.status(400).json({
        ok: false,
        error: "Missing fields: barberId, serviceId, startISO, customerName",
      });
    }

    if (!isIsoDateTime(startISO)) {
      return res.status(400).json({
        ok: false,
        error: "startISO must be a valid ISO datetime string",
      });
    }

    const barber = findBarber(barberId);
    const service = findService(serviceId);

    if (!barber || !service) {
      return res.status(400).json({
        ok: false,
        error: "Invalid barberId or serviceId",
      });
    }

    const startTime = new Date(startISO);
    const endTime = new Date(startTime.getTime() + service.durationMin * 60_000);

    const conflict = await findConflictingBooking({
      barberId,
      startTime,
      endTime,
    });

    if (conflict) {
      return res.status(409).json({
        ok: false,
        error: "Tiden er allerede booket",
      });
    }

    const bookingId = crypto.randomUUID();
    const cleanCustomerName = customerName.trim();
    const cleanCustomerPhone = customerPhone?.trim() || "";

    const insertResult = await db.query(
      `
      INSERT INTO bookings (
        booking_id,
        barber_id,
        barber_name,
        service_id,
        service_name,
        service_price,
        service_duration_min,
        customer_name,
        customer_phone,
        start_time,
        end_time
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      RETURNING *
      `,
      [
        bookingId,
        barber.id,
        barber.name,
        service.id,
        service.name,
        service.price,
        service.durationMin,
        cleanCustomerName,
        cleanCustomerPhone,
        startTime,
        endTime,
      ]
    );

    const savedBooking = insertResult.rows[0];

    const msg =
      `📅 *Ny booking!*\n` +
      `👤 *Kunde:* ${cleanCustomerName}${cleanCustomerPhone ? ` (${cleanCustomerPhone})` : ""}\n` +
      `💈 *Frisør:* ${barber.name}\n` +
      `✂️ *Service:* ${service.name} (${service.price} kr)\n` +
      `⏱️ *Varighed:* ${service.durationMin} min\n` +
      `🕒 *Tid:* ${startTime.toLocaleString("da-DK")}\n` +
      `📍 *Adresse:* Gammel Kongevej 91C`;

    await sendTelegramMessage(msg);

    res.json({ ok: true, booking: savedBooking });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err?.message || err) });
  }
});

app.patch("/api/bookings/:bookingId/cancel", async (req, res) => {
  try {
    const { bookingId } = req.params;

    const result = await db.query(
      `
      UPDATE bookings
      SET booking_status = 'cancelled'
      WHERE booking_id = $1
      RETURNING *
      `,
      [bookingId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ ok: false, error: "Booking not found" });
    }

    res.json({ ok: true, booking: result.rows[0] });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err?.message || err) });
  }
});

const port = Number(process.env.SERVER_PORT || 5050);

app.listen(port, () => {
  console.log(`API server running on http://localhost:${port}`);
});