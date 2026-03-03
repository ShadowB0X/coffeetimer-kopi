import express from "express";
import dotenv from "dotenv";
import { sendTelegramMessage } from "../telegram.js";

dotenv.config({ path: ".env.local" });

const app = express();
app.use(express.json());

// Healthcheck (nice to have)
app.get("/api/health", (req, res) => {
  res.json({ ok: true, status: "server up" });
});

// ✅ Test Telegram
app.get("/api/notify-test", async (req, res) => {
  try {
    const data = await sendTelegramMessage("✅ *ShortCut* — Telegram notifikation virker!");
    res.json({ ok: true, data });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err?.message || err) });
  }
});

const port = Number(process.env.SERVER_PORT || 5050);
app.listen(port, () => {
  console.log(`API server running on http://localhost:${port}`);
});