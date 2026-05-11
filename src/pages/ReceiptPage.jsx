import bg from "../assets/booking-bg.jpeg";
import styles from "../components/CartPage.module.css";

export default function ReceiptPage() {
  const order = JSON.parse(sessionStorage.getItem("lastPickupOrder") || "null");

  return (
    <div className={styles.page} style={{ backgroundImage: `url(${bg})` }}>
      <div className={styles.inner}>
        <div className={styles.empty}>
          <h1>Tak for din ordre ✅</h1>

          {!order ? (
            <>
              <p>Vi kunne ikke finde en aktiv kvittering.</p>
              <a href="/produkter" className={styles.linkButton}>
                Tilbage til produkter
              </a>
            </>
          ) : (
            <>
              <p>Dine varer er reserveret til afhentning hos ShortCut.</p>
              <p><strong>Adresse:</strong> Gammel Kongevej 91C</p>
              <p><strong>Ordre-id:</strong> {order.order_id}</p>
              <p><strong>Total:</strong> {Number(order.total_price).toFixed(2)} kr</p>

              <a href="/produkter" className={styles.linkButton}>
                Tilbage til produkter
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}