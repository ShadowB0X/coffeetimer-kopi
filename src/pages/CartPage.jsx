import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import bg from "../assets/booking-bg.jpeg";
import styles from "../components/CartPage.module.css";

export default function CartPage() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  const navigate = useNavigate();

  async function ensureGuestToken() {
    let token = localStorage.getItem("guestToken");

    if (!token) {
      const res = await fetch("/api/guest-session", {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data?.error || "Kunne ikke oprette session");
      }

      token = data.token;
      localStorage.setItem("guestToken", token);
    }

    return token;
  }

  async function loadCart() {
    try {
      setLoading(true);
      setError("");

      const token = await ensureGuestToken();

      const res = await fetch("/api/cart", {
        headers: {
          "x-guest-token": token,
        },
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data?.error || "Kunne ikke hente kurv");
      }

      setItems(data.items || []);
    } catch (err) {
      setError(String(err?.message || err));
    } finally {
      setLoading(false);
    }
  }

  async function removeFromCart(cartItemId) {
    try {
      setError("");

      const token = localStorage.getItem("guestToken");

      const res = await fetch(`/api/cart/items/${cartItemId}`, {
        method: "DELETE",
        headers: {
          "x-guest-token": token,
        },
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.ok) {
        throw new Error(data?.error || "Kunne ikke fjerne produktet");
      }

      await loadCart();
    } catch (err) {
      setError(String(err?.message || err));
    }
  }

  async function submitPickupOrder(e) {
    e.preventDefault();
    setError("");

    if (!customerName.trim() || !customerPhone.trim()) {
      setError("Skriv navn og telefonnummer.");
      return;
    }

    try {
      setOrdering(true);

      const token = await ensureGuestToken();

      const res = await fetch("/api/orders/pickup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-guest-token": token,
        },
        body: JSON.stringify({
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.ok) {
        throw new Error(data?.error || "Kunne ikke oprette afhentningsordre");
      }

      sessionStorage.setItem("lastPickupOrder", JSON.stringify(data.order));

      navigate("/kvittering");
    } catch (err) {
      setError(String(err?.message || err));
    } finally {
      setOrdering(false);
    }
  }

  useEffect(() => {
    loadCart();
  }, []);

  const total = items.reduce((sum, item) => {
    return sum + Number(item.product_price) * Number(item.quantity);
  }, 0);

  return (
    <div
      className={styles.page}
      style={{ backgroundImage: `url(${bg})` }}
    >
      <div className={styles.inner}>
        <h1 className={styles.title}>Kurv</h1>
        <p className={styles.subtitle}>Dine valgte produkter</p>

        {loading && <p className={styles.message}>Henter kurv...</p>}
        {error && <p className={styles.error}>{error}</p>}

        {!loading && !error && items.length === 0 && (
          <div className={styles.empty}>
            <h2>Din kurv er tom</h2>
            <p>Gå tilbage til produkter og tilføj noget til kurven.</p>
            <a href="/produkter" className={styles.linkButton}>
              Se produkter
            </a>
          </div>
        )}

        {items.length > 0 && (
          <>
            <div className={styles.list}>
              {items.map((item) => (
                <article className={styles.itemCard} key={item.cart_item_id}>
                  <div>
                    <h3>{item.product_name}</h3>
                    <p>Antal: {item.quantity}</p>
                  </div>

                  <div className={styles.meta}>
                    <span>{Number(item.product_price).toFixed(2)} kr</span>
                    <strong>
                      {(Number(item.product_price) * Number(item.quantity)).toFixed(2)} kr
                    </strong>

                    <button
                      className={styles.removeButton}
                      onClick={() => removeFromCart(item.cart_item_id)}
                    >
                      Fjern
                    </button>
                  </div>
                </article>
              ))}
            </div>

            <section className={styles.totalBox}>
              <span>Total</span>
              <strong>{total.toFixed(2)} kr</strong>
            </section>

            <form className={styles.orderForm} onSubmit={submitPickupOrder}>
              <h2>Bestil til afhentning</h2>
              <p>Udfyld dine oplysninger, så reserverer vi varerne til afhentning i butikken.</p>

              <label>
                <span>Navn</span>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Dit navn"
                />
              </label>

              <label>
                <span>Telefon</span>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="12 34 56 78"
                />
              </label>

              <button
                className={styles.orderButton}
                type="submit"
                disabled={ordering}
              >
                {ordering ? "Sender ordre..." : "Bestil til afhentning"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}