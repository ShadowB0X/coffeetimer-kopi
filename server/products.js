import express from "express";
import crypto from "crypto";

const router = express.Router();

export default function productRoutes(db) {
  function normalizeProduct(row) {
    return {
      product_id: row.product_id,
      name: row.name ?? row.navn ?? "",
      price: Number(row.price ?? row.pris ?? 0),
      stock_quantity: Number(row.stock_quantity ?? row.antal ?? 0),
      description: row.description ?? row.beskrivelse ?? "",
      availability: row.availability ?? row.tilgaengelighed ?? row["tilgængelighed"] ?? "",
    };
  }

  async function createProductInDb({
    navn,
    pris,
    beskrivelse = "",
    tilgaengelighed = "",
    antal = 0,
  }) {
    const produktId = crypto.randomUUID();
    const result = await db.query(
      `INSERT INTO products (product_id, navn, pris, beskrivelse, tilgaengelighed, antal)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [produktId, navn, pris, beskrivelse, tilgaengelighed, antal]
    );
    return result.rows[0];
  }

  router.get("/", async (req, res) => {
    try {
      const result = await db.query(`SELECT * FROM products ORDER BY created_at DESC`);
      const products = result.rows.map(normalizeProduct);
      res.json({ ok: true, products, produkter: products });
    } catch (err) {
      res.status(500).json({ ok: false, error: String(err?.message || err) });
    }
  });

  router.post("/", async (req, res) => {
    try {
      const body = req.body || {};
      const navn = body.name ?? body.navn;
      const pris = body.price ?? body.pris;
      const antal = body.stockQuantity ?? body.stock_quantity ?? body.antal;
      const beskrivelse = body.description ?? body.beskrivelse;
      const tilgaengelighed = body.availability ?? body.tilgaengelighed ?? body["tilgængelighed"];

      const renNavn = String(navn || "").trim();
      const numeriskPris = Number(pris);
      const numeriskAntal = Number(antal);

      if (!renNavn) return res.status(400).json({ ok: false, error: "Manglende felt: navn" });
      if (!Number.isFinite(numeriskPris) || numeriskPris < 0) return res.status(400).json({ ok: false, error: "Ugyldig pris" });
      if (!Number.isInteger(numeriskAntal) || numeriskAntal < 0) return res.status(400).json({ ok: false, error: "Ugyldigt antal" });

      const produkt = await createProductInDb({
        navn: renNavn,
        pris: numeriskPris,
        beskrivelse: String(beskrivelse || "").trim(),
        tilgaengelighed: String(tilgaengelighed || "").trim(),
        antal: numeriskAntal,
      });

      const product = normalizeProduct(produkt);
      res.status(201).json({ ok: true, product, produkt: product });
    } catch (err) {
      res.status(500).json({ ok: false, error: String(err?.message || err) });
    }
  });

  return router;
}