import { Link, useNavigate } from 'react-router-dom';
import styles from '../components/Navbar.module.css'; // You can change path to ../pages if needed

export default function Navbar({ username, onLogout }) {
  const navigate = useNavigate();

  const handleClick = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        <Link to="/" className={styles.logo}>ShortCut</Link>

        <div className={styles.navLinks}>
          <Link to="/vision" className={styles.link}>Go to Vision</Link>

          <a
            href="https://api.powersurge.dk/api/routes"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
          >
            View API Endpoints
          </a>

          {/* ✅ Upload button, visible only when logged in */}
          {username && (
            <Link to="/upload" className={styles.link}>Upload</Link>
          )}

          <Link to="/filelist" className={styles.link}>File List</Link>

          {!username && <Link to="/login" className={styles.link}>Login</Link>}
          {!username && <Link to="/register" className={styles.link}>Register</Link>}

          {username && (
            <>
              <span className={styles.welcome}>Welcome, {username}</span>
              <button onClick={handleClick} className={styles.logoutButton}>
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}