import styles from '../components/MainPage.module.css';
import heroImg from '../assets/hero-premium.jpg';

import cutImg from '../assets/card_cut.png';
import beardImg from '../assets/card_beard.png';
import careImg from '../assets/card_care.png';

export default function MainPage() {
  return (
    <div className={styles.page}>
      
      <header
        className={styles.hero}
        style={{ backgroundImage: `url(${heroImg})` }}
      >
        <div className={styles.heroOverlayDark} />

        <div className={styles.heroInnerLeft}>
          <p></p>
        </div>

        {/* 🔥 USYNLIGE KLIK ZONER */}
        <div className={styles.heroHotspots}>
          <a href="/booking" className={styles.hotspotBook}></a>
          <a href="/products" className={styles.hotspotProducts}></a>
        </div>

      </header>

      <section className={styles.cardsWrap}>
        <div className={styles.cards}>
          
          <article className={styles.card}>
            <div
              className={styles.cardImage}
              style={{ backgroundImage: `url(${cutImg})` }}
            />
            <div className={styles.cardBody}>
              <h3 className={styles.cardTitle}>Cuts & Fades</h3>
              <p className={styles.cardText}>Clean lines. Sharp finish.</p>
            </div>
          </article>

          <article className={styles.card}>
            <div
              className={styles.cardImage}
              style={{ backgroundImage: `url(${beardImg})` }}
            />
            <div className={styles.cardBody}>
              <h3 className={styles.cardTitle}>Beard & Detail</h3>
              <p className={styles.cardText}>Trim, shape, refine.</p>
            </div>
          </article>

          <article className={styles.card}>
            <div
              className={styles.cardImage}
              style={{ backgroundImage: `url(${careImg})` }}
            />
            <div className={styles.cardBody}>
              <h3 className={styles.cardTitle}>Style & Care</h3>
              <p className={styles.cardText}>Products that match your hair.</p>
            </div>
          </article>

        </div>
      </section>

    </div>
  );
}