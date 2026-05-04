import express from "express";
import crypto from "crypto";

const router = express.Router();

export default function productRoutes(db) {

  function showProductsToAdmin(row) {
    return {
      product_id: row.product_id,
      name: row.product_name,
      price: Number(row.product_price),
      stock_quantity: Number(row.stock_quantity),
      description: "", // ikke brugt længere
      created_at: row.created_at,
    };
  }

  function showProductQuantityAndPriceToCustomers(row) {
    return {
      product_id: row.product_id,
      name: row.product_name,
      price: row.product_price,
      quantity: row.stock_quantity
    };
  }

  // se pris/lagerstatus på produkter som kunde 
  router.get("/customers/product-information", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT product_id, product_name, product_price, stock_quantity 
      FROM products
      ORDER BY created_at DESC
    `);

    res.json({
      ok: true,
      products: result.rows.map(showProductQuantityAndPriceToCustomers),
    })

  } catch (err) {
    res.status(500).json({
      ok: false,
      error: String(err?.message || err),
    });
      }
});

  // GET alle produkter til admin interface
  router.get("/admin/product-information", async (req, res) => {
    try {
      const result = await db.query(`
        SELECT *
        FROM products
        ORDER BY created_at DESC
      `);

      res.json({
        ok: true,
        products: result.rows.map(showProductsToAdmin),
      });

    } catch (err) {
      res.status(500).json({
        ok: false,
        error: String(err?.message || err),
      });
    }
  });

  // POST opret produkt
  router.post("/", async (req, res) => {
    try {
      const { name, price, stock_quantity, stockQuantity } = req.body || {};

      const cleanName = String(name || "").trim();
      const numericPrice = Number(price);
      const numericStock = Number(stock_quantity ?? stockQuantity ?? 0);

      if (!cleanName) {
        return res.status(400).json({ ok: false, error: "Manglende navn" });
      }

      if (!Number.isFinite(numericPrice) || numericPrice < 0) {
        return res.status(400).json({ ok: false, error: "Ugyldig pris" });
      }

      if (!Number.isInteger(numericStock) || numericStock < 0) {
        return res.status(400).json({ ok: false, error: "Ugyldigt lagerantal" });
      }

      const result = await db.query(
        `
        INSERT INTO products (
          product_id,
          product_name,
          product_price,
          stock_quantity
        )
        VALUES ($1, $2, $3, $4)
        RETURNING *
        `,
        [
          crypto.randomUUID(),
          cleanName,
          numericPrice,
          numericStock,
        ]
      );

      res.status(201).json({
        ok: true,
        product: showProductsToAdmin(result.rows[0]),
      });

    } catch (err) {
      res.status(500).json({
        ok: false,
        error: String(err?.message || err),
      });
    }
  });

  return router;
}