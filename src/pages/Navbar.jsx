import { Link } from 'react-router-dom';
import styles from '../components/Navbar.module.css';

export default function Navbar() {
  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        <Link to="/" className={styles.logo}>ShortCut</Link>

        <div className={styles.navLinks}>
          <Link to="/services" className={styles.link}>Produkts</Link>
          <Link to="/prices" className={styles.link}>Priser</Link>
          <Link to="/vision" className={styles.link}>Kontakt</Link>
          <Link to="/booking" className={styles.bookBtn}>Book Tid</Link>
        </div>
      </div>
    </nav>
  );
}
