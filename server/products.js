import express from "express";
import crypto from "crypto";

const router = express.Router();

export default function productRoutes(db) {
  async function createProductInDb({ navn, pris, beskrivelse = "", tilgængelighed = "", antal = 0 }) {
    const produktId = crypto.randomUUID();
    const result = await db.query(
      `INSERT INTO products (product_id, navn, pris, billede_url, beskrivelse, tilgaengelighed, antal)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [produktId, navn, pris, beskrivelse, tilgængelighed, antal]
    );
    return result.rows[0];
  }

  router.get("/", async (req, res) => {
    try {
      const result = await db.query(`SELECT * FROM products ORDER BY created_at DESC`);
      res.json({ ok: true, produkter: result.rows });
    } catch (err) {
      res.status(500).json({ ok: false, error: String(err?.message || err) });
    }
  });

  router.post("/", async (req, res) => {
    try {
      const { navn, pris, beskrivelse, tilgængelighed, antal } = req.body || {};

      const renNavn = String(navn || "").trim();
      const numeriskPris = Number(pris);
      const numeriskAntal = Number(antal);

      if (!renNavn) return res.status(400).json({ ok: false, error: "Manglende felt: navn" });
      if (!Number.isFinite(numeriskPris) || numeriskPris < 0) return res.status(400).json({ ok: false, error: "Ugyldig pris" });
      if (!Number.isFinite(numeriskAntal) || numeriskAntal < 0) return res.status(400).json({ ok: false, error: "Ugyldigt antal" });

      const produkt = await createProductInDb({
        navn: renNavn,
        pris: numeriskPris,
        beskrivelse: String(beskrivelse || "").trim(),
        tilgængelighed: String(tilgængelighed || "").trim(),
        antal: numeriskAntal,
      });

      res.status(201).json({ ok: true, produkt });
    } catch (err) {
      res.status(500).json({ ok: false, error: String(err?.message || err) });
    }
  });

  return router;
}