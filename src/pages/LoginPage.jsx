import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import styles from '../components/AuthForm.module.css';

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [redirectTo, setRedirectTo] = useState(null);

  const location = useLocation();
  const redirectPath = location.state?.from?.pathname || '/upload';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        const userEmail = data.user?.email || email;
        const isAdmin = data.user?.role === 'admin';
        onLogin(data.token, userEmail, isAdmin);
        setRedirectTo(isAdmin ? '/admin/products' : redirectPath);
      } else {
        const data = await res.json().catch(() => ({}));
        setMessage(data?.error || 'Login failed');
      }
    } catch (err) {
      console.error('❌ Login error:', err);
      setMessage('Login error. See console.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (redirectTo) return <Navigate to={redirectTo} replace />;

  return (
    <div className={styles.authContainer}>
      <div className={styles.loginShell}>
        <section className={styles.loginInfo}>
          <p className={styles.kicker}>ADMIN ACCESS</p>
          <h1 className={styles.heroTitle}>Log ind og styr produkter lokalt</h1>
          <p className={styles.heroText}>
            Brug admin-login til at teste US-4. Når du logger ind, får du adgang til produktsiden,
            hvor du kan oprette et nyt produkt og se det i oversigten.
          </p>

          <div className={styles.infoGrid}>
            <div className={styles.infoCard}>
              <span>Brugernavn</span>
              <strong>admin@coffeetimer.local</strong>
            </div>
            <div className={styles.infoCard}>
              <span>Kodeord</span>
              <strong>admin123</strong>
            </div>
          </div>

          <div className={styles.noteBox}>
            <p>
              Login findes lokalt i backend på <strong>/api/auth/login</strong> og giver en admin-token
              til test af produktsiden.
            </p>
          </div>
        </section>

        <form onSubmit={handleSubmit} className={styles.formBox}>
          <h2>Admin login</h2>
          <p className={styles.formHint}>Kun administratorer får adgang til produktformularen.</p>

          <label className={styles.fieldLabel}>
            <span>Email</span>
            <input
              type="email"
              placeholder="admin@coffeetimer.local"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </label>

          <label className={styles.fieldLabel}>
            <span>Password</span>
            <input
              type="password"
              placeholder="admin123"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </label>

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Logger ind...' : 'Log ind som admin'}
          </button>

          {message && <p className={styles.message}>{message}</p>}
        </form>
      </div>
    </div>
  );
}

LoginPage.propTypes = {
  onLogin: PropTypes.func.isRequired,
};