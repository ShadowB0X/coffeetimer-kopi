import styles from "../components/VisionPage.module.css";

export default function VisionPage() {
  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.kicker}>ShortCut · Gammel Kongevej 91C</p>
          <h1 className={styles.title}>Kontakt</h1>
          <p className={styles.sub}>
            Book tid, stil et spørgsmål eller kig forbi — vi svarer hurtigst muligt.
          </p>
        </div>
      </header>

      <main className={styles.content}>
        <section className={styles.grid}>
          <article className={styles.card}>
            <h2 className={styles.cardTitle}>Adresse</h2>
            <p className={styles.text}>
              Gammel Kongevej 91C<br />
              1850 Frederiksberg
            </p>

            <div className={styles.meta}>
              <div className={styles.metaRow}>
                <span className={styles.metaLabel}>Åbningstider</span>
                <span className={styles.metaValue}>Efter aftale / booking</span>
              </div>
              <div className={styles.metaRow}>
                <span className={styles.metaLabel}>Parkering</span>
                <span className={styles.metaValue}>Gadeparkering i området</span>
              </div>
            </div>

            <a className={styles.linkBtn} href="https://maps.google.com/?q=Gammel%20Kongevej%2091C%201850%20Frederiksberg" target="_blank" rel="noreferrer">
              Åbn i Maps
            </a>
          </article>

          <article className={styles.card}>
            <h2 className={styles.cardTitle}>Kontakt</h2>

            <div className={styles.meta}>
              <div className={styles.metaRow}>
                <span className={styles.metaLabel}>Telefon</span>
                <a className={styles.metaValueLink} href="tel:+4500000000">+45 00 00 00 00</a>
              </div>
              <div className={styles.metaRow}>
                <span className={styles.metaLabel}>Email</span>
                <a className={styles.metaValueLink} href="mailto:kontakt@shortcut.dk">kontakt@shortcut.dk</a>
              </div>
              <div className={styles.metaRow}>
                <span className={styles.metaLabel}>Instagram</span>
                <a className={styles.metaValueLink} href="https://instagram.com/" target="_blank" rel="noreferrer">@shortcut</a>
              </div>
            </div>

            <a className={styles.primaryBtn} href="/book">
              Book tid
            </a>

            <p className={styles.note}>
              Tip: Skriv gerne hvilken service du ønsker + evt. referencebillede.
            </p>
          </article>
        </section>

        <section className={styles.formCard}>
          <h2 className={styles.cardTitle}>Send en besked</h2>
          <p className={styles.text}>
            Udfyld formularen herunder — vi vender tilbage hurtigst muligt.
          </p>

          {/* NOTE: Kun UI. Hook den på backend senere */}
          <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
            <div className={styles.row}>
              <label className={styles.label}>
                Navn
                <input className={styles.input} type="text" placeholder="Dit navn" />
              </label>

              <label className={styles.label}>
                Telefonnummer
                <input className={styles.input} type="tel" placeholder="+45 …" />
              </label>
            </div>

            <label className={styles.label}>
              Email
              <input className={styles.input} type="email" placeholder="din@email.dk" />
            </label>

            <label className={styles.label}>
              Besked
              <textarea className={styles.textarea} rows="6" placeholder="Skriv din besked…" />
            </label>

            <button className={styles.submit} type="submit">
              Send besked
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}