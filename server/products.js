import express from "express";
import crypto from "crypto";

const router = express.Router();

export default function productRoutes(db) {
  function normalizeProduct(row) {
  return {
    product_id: row.product_id,
    name: row.product_name,
    price: Number(row.product_price),
    stock_quantity: Number(row.stock_quantity),
    created_at: row.created_at,
  };
}

  async function createProductInDb({ product_name, product_price, stock_quantity = 0 }) {
  const result = await db.query(
    `INSERT INTO products (product_name, product_price, stock_quantity)
     VALUES ($1,$2,$3) RETURNING *`,
    [product_name, product_price, stock_quantity]
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
    const { name, price, stock_quantity } = req.body || {};

    const renNavn = String(name || "").trim();
    const numeriskPris = Number(price);
    const numeriskAntal = Number(stock_quantity ?? 0);

    if (!renNavn) return res.status(400).json({ ok: false, error: "Manglende felt: name" });
    if (!Number.isFinite(numeriskPris) || numeriskPris < 0) return res.status(400).json({ ok: false, error: "Ugyldig pris" });
    if (!Number.isInteger(numeriskAntal) || numeriskAntal < 0) return res.status(400).json({ ok: false, error: "Ugyldigt antal" });

    const row = await createProductInDb({
      product_name: renNavn,
      product_price: numeriskPris,
      stock_quantity: numeriskAntal,
    });

    const product = normalizeProduct(row);
    res.status(201).json({ ok: true, product });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err?.message || err) });
  }
});

  return router;
}