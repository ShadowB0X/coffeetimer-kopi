import styles from '../components/IntroPage.module.css';

export default function IntroPage() {
  return (
    <div className={styles.introContainer}>
      <div className={styles.introOverlay}>
        <nav className={styles.introNavbar}>
          <div className={styles.introLogo}>SoundAPI</div>
          <div className={styles.introNavLinks}>
            <a href="/docs" className={styles.introLink}>Docs</a>
            <a href="/contact" className={styles.introLink}>Contact</a>
            <a href="/login" className={`${styles.introLink} ${styles.introGetStarted}`}>Get Started</a>
          </div>
        </nav>

        <div className={styles.introHero}>
          <h1>Welcome to <span>ShortCut</span></h1>
          <p>Analyze audio with elegance, precision, and rhythm.</p>
        </div>
      </div>
    </div>
  );
}