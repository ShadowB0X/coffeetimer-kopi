import styles from "../components/ProductPage.module.css"

import cologne2 from "../assets/cologne2.jpg"
import cologne5 from "../assets/cologne5.jpg"
import gel from "../assets/hairgel.jpg"
import beardoil from "../assets/beardoil.jpg"
import powderwax from "../assets/powderwax.jpg"
import waxstack from "../assets/waxstack.jpg"

export default function ProductsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // skal de rykkes uden for funktionen??
  const products = [
    {
      name: "Totex Barber Cologne No.2",
      price: "120 kr",
      image: cologne2
    },
    {
      name: "Totex Barber Cologne No.5",
      price: "120 kr",
      image: cologne5
    },
    {
      name: "Totex Hair Gel",
      price: "90 kr",
      image: gel
    },
    {
      name: "Totex Beard Oil",
      price: "140 kr",
      image: beardoil
    },
    {
      name: "Totex Premium Powder Wax",
      price: "130 kr",
      image: powderwax
    },
    {
      name: "Totex Styling Wax Collection",
      price: "110 kr",
      image: waxstack
    }
  ]

  async function loadProductsForCustomers() {
    try {
        setLoading(true);
        const resp = await fetch("/api/products");
        const data = await response.json();

        const combined = hardcodedProducts.map((hardcoded) => {
          const fromDb = data.products.find((p) => p.name === hardcoded.name);
          return {
            ...hardcoded,
            price: fromDb?.price ?? "-",
            stock_quantity: fromDb?.stock_quantity ?? 0,
          };

          setProducts(combined);
        });


    } catch (err) {
      setError(String(err?.message || err));
    } finally {
      setLoading(false);
    }
  }

  

  return (
    <div className={styles.page}>
      

      <h1 className={styles.title}>Produkter</h1>
      <p className={styles.subtitle}>Premium barber products used in our shop</p>

      <div className={styles.grid}>
        {products.map((product, i) => (
          <div className={styles.card} key={i}>
            <img src={product.image} className={styles.image} />
            <div className={styles.info}>
              <h3>{product.name}</h3>
              <p className={styles.price}>{product.price}</p>
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}