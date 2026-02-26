import styles from "../components/SimplePage.module.css";

export default function PricesPage() {
  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.kicker}>ShortCut · Gammel Kongevej 91C</p>
          <h1 className={styles.title}>Priser</h1>
          <p className={styles.sub}>
            Premium cuts · fades · beard · styling — klare priser, ingen overraskelser.
          </p>
        </div>
      </header>

      <main className={styles.content}>
        <section className={styles.grid}>
          <article className={styles.card}>
            <h2 className={styles.cardTitle}>Klip</h2>

            <div className={styles.priceRow}>
              <span className={styles.item}>Herreklip</span>
              <span className={styles.amount}>200 kr</span>
            </div>

            <div className={styles.priceRow}>
              <span className={styles.item}>Pensionistklip</span>
              <span className={styles.amount}>150 kr</span>
            </div>

            <div className={styles.priceRow}>
              <span className={styles.item}>Børneklip</span>
              <span className={styles.amount}>150 kr</span>
            </div>

            <p className={styles.note}>
              Inkl. styling og finish. Spørg gerne hvis du ønsker fade eller længere hår.
            </p>
          </article>

          <article className={styles.card}>
            <h2 className={styles.cardTitle}>Skæg</h2>

            <div className={styles.priceRow}>
              <span className={styles.item}>Skæg (fra)</span>
              <span className={styles.amount}>100 kr</span>
            </div>

            <p className={styles.note}>
              Prisen afhænger af længde og ønsket form. Vi aftaler altid før vi starter.
            </p>

            <a className={styles.primaryBtn} href="/book">
              Book tid
            </a>

            <p className={styles.small}>
              Har du spørgsmål? Kig forbi <strong>Kontakt</strong> for telefon og email.
            </p>
          </article>
        </section>

        <section className={styles.banner}>
          <div className={styles.bannerInner}>
            <h3 className={styles.bannerTitle}>Tip</h3>
            <p className={styles.bannerText}>
              Kom gerne 5 minutter før. Hvis du har et referencebillede, så tag det med —
              det gør resultatet endnu skarpere.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}