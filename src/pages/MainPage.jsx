import styles from '../components/MainPage.module.css';
import storefront from '../assets/storefront_clean.png';
import cutImg from '../assets/card_cut.png';
import beardImg from '../assets/card_beard.png';
import careImg from '../assets/card_care.png';

export default function MainPage() {
  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <img className={styles.heroMedia} src={storefront} alt="ShortCut storefront" />
        <div className={styles.heroOverlay} />

        <div className={styles.heroInner}>
          <h1 className={styles.heroTitle}>Sharpen Your Style.</h1>
          <p className={styles.heroSub}>Premium cuts · fades · beard · styling</p>
        </div>
      </header>

      <section className={styles.cardsWrap}>
        <div className={styles.cards}>
          <article className={styles.card}>
            <div className={styles.cardImage} style={{ backgroundImage: `url(${cutImg})` }} />
            <div className={styles.cardBody}>
              <div className={styles.iconRow} aria-hidden="true">
                <span className={styles.iconHat} />
              </div>
              <h3 className={styles.cardTitle}>Cuts &amp; Fades</h3>
              <p className={styles.cardText}>Clean lines. Sharp finish.</p>
            </div>
          </article>

          <article className={styles.card}>
            <div className={styles.cardImage} style={{ backgroundImage: `url(${beardImg})` }} />
            <div className={styles.cardBody}>
              <div className={styles.iconRow} aria-hidden="true">
                <span className={styles.iconBeard} />
              </div>
              <h3 className={styles.cardTitle}>Beard &amp; Detail</h3>
              <p className={styles.cardText}>Trim, shape, refine.</p>
            </div>
          </article>

          <article className={styles.card}>
            <div className={styles.cardImage} style={{ backgroundImage: `url(${careImg})` }} />
            <div className={styles.cardBody}>
              <div className={styles.iconRow} aria-hidden="true">
                <span className={styles.iconCare} />
              </div>
              <h3 className={styles.cardTitle}>Style &amp; Care</h3>
              <p className={styles.cardText}>Products that match your hair.</p>
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}