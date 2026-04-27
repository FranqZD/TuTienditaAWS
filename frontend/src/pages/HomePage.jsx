import { useState, useEffect } from 'react';
import { getProducts } from '../services/api';
import ProductCard from '../components/ProductCard';
import './HomePage.css';

function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchProducts() {
      try {
        setLoading(true);
        setError(null);
        const data = await getProducts();
        if (!cancelled) {
          setProducts(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Error al cargar los productos');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <main>
        <h1>Productos</h1>
        <div className="home-loading" role="status">
          <p>Cargando productos…</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main>
        <h1>Productos</h1>
        <div className="home-error" role="alert">
          <p>{error}</p>
        </div>
      </main>
    );
  }

  if (products.length === 0) {
    return (
      <main>
        <h1>Productos</h1>
        <div className="home-empty">
          <p>No hay productos disponibles.</p>
        </div>
      </main>
    );
  }

  return (
    <main>
      <h1>Productos</h1>
      <section aria-label="Lista de productos" className="home-products-grid">
        {products.map((product) => (
          <ProductCard key={product.productId} product={product} />
        ))}
      </section>
    </main>
  );
}

export default HomePage;
