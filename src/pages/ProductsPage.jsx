import { useEffect, useState } from "react";
import styles from "../components/ProductsPage.module.css";
import bg from "../assets/booking-bg.jpeg";

import cologne2 from "../assets/cologne2.jpg";
import cologne5 from "../assets/cologne5.jpg";
import gel from "../assets/hairgel.jpg";
import beardoil from "../assets/beardoil.jpg";
import powderwax from "../assets/powderwax.jpg";
import waxstack from "../assets/waxstack.jpg";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  const imageMap = {
    "Hair Wax": waxstack,
    "Beard Oil": beardoil,
    "Shampoo": gel,
    "Hair shampoo": gel,
    "Totex Barber Cologne No.2": cologne2,
    "Totex Barber Cologne No.5": cologne5,
    "Totex Hair Gel": gel,
    "Totex Beard Oil": beardoil,
    "Totex Premium Powder Wax": powderwax,
    "Totex Styling Wax Collection": waxstack
  };

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        setError("");

        const res = await fetch("/api/products");
        const data = await res.json();

        if (!res.ok || !data.ok) {
          throw new Error(data?.error || "Kunne ikke hente produkter");
        }

        setProducts(data.products || []);
      } catch (err) {
        setError(String(err?.message || err));
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  useEffect(() => {
    async function initSession() {
      let token = localStorage.getItem("guestToken");

      if (!token) {
        const res = await fetch("/api/guest-session", {
          method: "POST",
        });

        const data = await res.json();

        if (data.ok) {
          localStorage.setItem("guestToken", data.token);
        }
      }
    }

    initSession();
  }, []);

  // 🔥 STEP 4 FUNCTION
  async function handleAddToCart(productId) {
    try {
      setMsg("");

      const token = localStorage.getItem("guestToken");

      const res = await fetch("/api/cart/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-guest-token": token,
        },
        body: JSON.stringify({
          productId,
          quantity: 1,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.ok) {
        throw new Error(data?.error || "Kunne ikke tilføje til kurv");
      }

      setMsg("✅ Tilføjet til kurv");
    } catch (err) {
      setMsg("❌ Fejl: " + (err?.message || err));
    }
  }

  return (
    <div
      className={styles.page}
      style={{ backgroundImage: `url(${bg})` }}
    >
      <div className={styles.inner}>
        <h1 className={styles.title}>Produkter</h1>
        <p className={styles.subtitle}>
          Premium barber products used in our shop
        </p>

        {loading && <p>Henter produkter...</p>}
        {error && <p>{error}</p>}
        {msg && <p style={{ textAlign: "center" }}>{msg}</p>}

        <div className={styles.grid}>
          {products.map((product) => {
            const name = product.name || product.product_name;
            const price = product.price ?? product.product_price;
            const quantity = product.stock_quantity;

            return (
              <div className={styles.card} key={product.product_id}>
                <img
                  src={imageMap[name] || waxstack}
                  className={styles.image}
                />

                <div className={styles.info}>
                  <h3>{name}</h3>

                  <p className={styles.price}>
                    {Number(price).toFixed(2)} kr
                  </p>

                  <p className={styles.stock}>
                    Lager: {quantity}
                  </p>

                  {/* 🔥 BUTTON */}
                  <button
                    className={styles.addButton}
                    onClick={() => handleAddToCart(product.product_id)}
                  >
                    Tilføj til kurv
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}