/* global process */

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import crypto from "crypto";
import pg from "pg";
import { sendTelegramMessage } from "./telegram.js";
import productRoutes from "./products.js";

dotenv.config({ path: ".env.local"});

if (!process.env.DATABASE_URL) {
  console.warn("DATABASE_URL is missing. Create a .env.local file in the project root with a valid PostgreSQL connection string.");
}

const app = express();
app.use(cors({

  origin: [
    "http://localhost:5173",
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

/*
tror ikke denne bruges. fjernes?
app.get("/api/products", async (req, res) => {
  try {
    const products = await getProductsFromDb();
    res.json({ ok: true, products });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err?.message || err) });
  }
});*/

/*
samme her. product-funktionalitet flyttet over til "products.js"
app.post("/api/products", async (req, res) => {
  try {
    const { name, price, stockQuantity, description } = req.body || {};

    const cleanName = String(name || "").trim();
    const numericPrice = Number(price);
    const numericStockQuantity = Number(stockQuantity);
    const cleanDescription = String(description || "").trim();

    if (!cleanName) {
      return res.status(400).json({ ok: false, error: "Missing field: name" });
    }

    if (!Number.isFinite(numericPrice) || numericPrice < 0) {
      return res.status(400).json({ ok: false, error: "Invalid field: price must be a number >= 0" });
    }

    if (!Number.isInteger(numericStockQuantity) || numericStockQuantity < 0) {
      return res.status(400).json({ ok: false, error: "Invalid field: stockQuantity must be an integer >= 0" });
    }

    const product = await createProductInDb({
      name: cleanName,
      price: numericPrice,
      stockQuantity: numericStockQuantity,
      description: cleanDescription,
    });

    res.status(201).json({ ok: true, product });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err?.message || err) });
  }
});*/

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
