import { useEffect, useState } from "react";

export default function CartPage() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  async function loadCart() {
    try {
      const token = localStorage.getItem("guestToken");

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
    }
  }

  useEffect(() => {
    loadCart();
  }, []);

  const total = items.reduce((sum, item) => {
    return sum + Number(item.product_price) * Number(item.quantity);
  }, 0);

  return (
    <div style={{ padding: "120px 24px", minHeight: "100vh" }}>
      <h1>Kurv</h1>

      {error && <p>{error}</p>}

      {items.length === 0 && <p>Din kurv er tom.</p>}

      {items.map((item) => (
        <div key={item.cart_item_id}>
          <h3>{item.product_name}</h3>
          <p>Antal: {item.quantity}</p>
          <p>Pris: {Number(item.product_price).toFixed(2)} kr</p>
        </div>
      ))}

      <h2>Total: {total.toFixed(2)} kr</h2>
    </div>
  );
}