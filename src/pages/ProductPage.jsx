import { useEffect, useState } from 'react';
import styles from '../components/ProductPage.module.css';
import PropTypes from 'prop-types';

export default function ProductPage({ isAdmin = false }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');
  const [description, setDescription] = useState('');

  async function loadProducts() {
    try {
      setLoading(true);
      setError('');

      const response = await fetch('/api/products');
      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data?.error || 'Kunne ikke hente produkter');
      }

      setProducts(data.products || []);
    } catch (err) {
      setError(String(err?.message || err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name.trim() || price === '' || stockQuantity === '') {
      setError('Udfyld navn, pris og lagerantal.');
      return;
    }

    try {
      setSaving(true);
      //const response = await fetch('https://shadowbox.dk/api/products');
      const response = await fetch('https://shadowbox.dk/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          price: Number(price),
          stockQuantity: Number(stockQuantity),
          description: description.trim(),
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.ok) {
        throw new Error(data?.error || 'Produkt kunne ikke oprettes');
      }

      setSuccess('✅ Produktet er oprettet og gemt i databasen.');
      setName('');
      setPrice('');
      setStockQuantity('');
      setDescription('');
      await loadProducts();
    } catch (err) {
      setError(String(err?.message || err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <p className={styles.kicker}>ADMIN · PRODUKTER</p>
        <h1 className={styles.title}>Opret nyt produkt</h1>
        <p className={styles.subtitle}>
          Udfyld navn, pris, lagerantal og beskrivelse for at registrere produktet i databasen.
        </p>
      </header>

      <div className={styles.layout}>
        {isAdmin ? (
          <form className={styles.card} onSubmit={handleSubmit}>
            <div className={styles.grid}>
              <label className={styles.field}>
                <span>Navn</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="fx Totex Hair Gel"
                />
              </label>

              <label className={styles.field}>
                <span>Pris</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="fx 90"
                />
              </label>

              <label className={styles.field}>
                <span>Lagerantal</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(e.target.value)}
                  placeholder="fx 12"
                />
              </label>

              <label className={`${styles.field} ${styles.fullWidth}`}>
                <span>Beskrivelse</span>
                <textarea
                  rows="5"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Kort beskrivelse af produktet"
                />
              </label>
            </div>

            <button className={styles.button} type="submit" disabled={saving}>
              {saving ? 'Opretter...' : 'Opret'}
            </button>

            {error && <p className={styles.error}>{error}</p>}
            {success && <p className={styles.success}>{success}</p>}
          </form>
        ) : (
          <aside className={styles.card}>
            <h3>Adgang nægtet</h3>
            <p>Produktformularen vises kun for en bruger, der er logget ind med admin-token.</p>
          </aside>
        )}

        <aside className={styles.sidebar}>
          <div className={styles.sideCard}>
            <h3>Formål</h3>
            <p>Bruges af administrator til at oprette produkter, som gemmes i databasen og vises på hjemmesiden.</p>
          </div>
          <div className={styles.sideCard}>
            <h3>Registrerede produkter</h3>
            <p>{loading ? 'Henter produkter...' : `${products.length} produkter fundet`}</p>
          </div>
        </aside>
      </div>

      <section className={styles.listSection}>
        <h2 className={styles.sectionTitle}>Produkter i databasen</h2>
        <div className={styles.list}>
          {products.map((product) => (
            <article className={styles.productCard} key={product.product_id}>
              <div>
                <h3>{product.name}</h3>
                <p>{product.description || 'Ingen beskrivelse'}</p>
              </div>
              <div className={styles.meta}>
                <span>Pris: {Number(product.price).toFixed(2)} kr</span>
                <span>Lager: {product.stock_quantity}</span>
              </div>
            </article>
          ))}

          {!loading && products.length === 0 && (
            <p className={styles.empty}>Der er endnu ingen produkter oprettet.</p>
          )}
        </div>
      </section>
    </div>
  );
}

ProductPage.propTypes = {
  isAdmin: PropTypes.bool,
};