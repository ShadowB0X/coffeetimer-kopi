import express from "express";
import dotenv from "dotenv";
import crypto from "crypto";
import { sendTelegramMessage } from "./telegram.js";

dotenv.config({ path: ".env.local" });

const app = express();
app.use(express.json());

// Healthcheck
app.get("/api/health", (req, res) => {
  res.json({ ok: true, status: "server up" });
});

// Test Telegram
app.get("/api/notify-test", async (req, res) => {
  try {
    const data = await sendTelegramMessage("✅ *ShortCut* — Telegram notifikation virker!");
    res.json({ ok: true, data });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err?.message || err) });
  }
});

// --- MVP data (in-memory) ---
const BARBERS = [
  { id: "ali", name: "Ali" },
  { id: "sam", name: "Sam" },
];

const SERVICES = [
  { id: "hair", name: "Hair klip", price: 200, durationMin: 30 },
  { id: "pension", name: "Pensionklip", price: 150, durationMin: 30 },
  { id: "child", name: "Børneklip", price: 150, durationMin: 30 },
  { id: "beard", name: "Skæg (fra)", price: 100, durationMin: 15 },
];

const BOOKINGS = [];

function isIsoDateTime(s) {
  const d = new Date(s);
  return Number.isFinite(d.getTime()) && typeof s === "string" && s.includes("T");
}
function overlaps(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd;
}

// List barbers + services
app.get("/api/barbers", (req, res) => res.json({ ok: true, barbers: BARBERS }));
app.get("/api/services", (req, res) => res.json({ ok: true, services: SERVICES }));

// Availability
app.get("/api/availability", (req, res) => {
  const { date, barberId } = req.query;

  if (!date || !barberId) {
    return res.status(400).json({ ok: false, error: "Missing date or barberId" });
  }

  const dayStart = new Date(`${date}T10:00:00`);
  const dayEnd = new Date(`${date}T18:00:00`);

  if (!Number.isFinite(dayStart.getTime())) {
    return res.status(400).json({ ok: false, error: "Invalid date format (use YYYY-MM-DD)" });
  }

  const slotMin = 30;
  const slots = [];

  for (let t = new Date(dayStart); t < dayEnd; t = new Date(t.getTime() + slotMin * 60_000)) {
    const start = new Date(t);
    const end = new Date(t.getTime() + slotMin * 60_000);

    const busy = BOOKINGS.some((b) => {
      if (b.barberId !== barberId) return false;
      const bStart = new Date(b.startISO);
      const svc = SERVICES.find((s) => s.id === b.serviceId);
      const bEnd = new Date(bStart.getTime() + (svc?.durationMin ?? 30) * 60_000);
      return overlaps(start, end, bStart, bEnd);
    });

    if (!busy) slots.push(start.toISOString());
  }

  res.json({ ok: true, slots });
});

// Create booking + telegram
app.post("/api/bookings", async (req, res) => {
  try {
    const { barberId, serviceId, startISO, customerName, customerPhone } = req.body || {};

    if (!barberId || !serviceId || !startISO || !customerName) {
      return res.status(400).json({
        ok: false,
        error: "Missing fields (barberId, serviceId, startISO, customerName)",
      });
    }

    if (!isIsoDateTime(startISO)) {
      return res.status(400).json({ ok: false, error: "startISO must be ISO datetime string" });
    }

    const barber = BARBERS.find((b) => b.id === barberId);
    const service = SERVICES.find((s) => s.id === serviceId);
    if (!barber || !service) {
      return res.status(400).json({ ok: false, error: "Invalid barberId or serviceId" });
    }

    const start = new Date(startISO);
    const end = new Date(start.getTime() + service.durationMin * 60_000);

    const conflict = BOOKINGS.some((b) => {
      if (b.barberId !== barberId) return false;
      const bStart = new Date(b.startISO);
      const bSvc = SERVICES.find((s) => s.id === b.serviceId);
      const bEnd = new Date(bStart.getTime() + (bSvc?.durationMin ?? 30) * 60_000);
      return overlaps(start, end, bStart, bEnd);
    });

    if (conflict) return res.status(409).json({ ok: false, error: "Time slot already booked" });

    const booking = {
      id: crypto.randomUUID(),
      barberId,
      serviceId,
      startISO,
      customerName,
      customerPhone: customerPhone || "",
    };

    BOOKINGS.push(booking);

    const msg =
      `📅 *Ny booking!*\n` +
      `👤 *Kunde:* ${customerName}${customerPhone ? ` (${customerPhone})` : ""}\n` +
      `💈 *Frisør:* ${barber.name}\n` +
      `✂️ *Service:* ${service.name} (${service.price} kr)\n` +
      `🕒 *Tid:* ${new Date(startISO).toLocaleString("da-DK")}\n` +
      `📍 *Adresse:* Gammel Kongevej 91C`;

    await sendTelegramMessage(msg);

    res.json({ ok: true, booking });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err?.message || err) });
  }
});

const port = Number(process.env.SERVER_PORT || 5050);
app.listen(port, () => console.log(`API server running on http://localhost:${port}`));