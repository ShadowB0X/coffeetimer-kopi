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

  // 🔥 Map DB names → billeder
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
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}