import { useState, useEffect } from 'react';
import { getProducts } from '../services/api';
import HeroSection from '../components/home/HeroSection';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorMessage from '../components/ui/ErrorMessage';
import EmptyState from '../components/ui/EmptyState';
import ProductCard from '../components/catalog/ProductCard';
import './HomePage.css';

function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function fetchProducts() {
    try {
      setLoading(true);
      setError(null);
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      setError(err.message || 'Error al cargar los productos');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  function renderProducts() {
    if (loading) {
      return <LoadingSpinner message="Cargando productos..." />;
    }

    if (error) {
      return <ErrorMessage message={error} onRetry={fetchProducts} />;
    }

    if (products.length === 0) {
      return (
        <EmptyState
          title="Sin productos disponibles"
          message="Aún no hay productos en la tienda. Vuelve pronto para ver novedades."
          actionLabel="Ir al catálogo"
          actionTo="/catalogo"
        />
      );
    }

    const featured = products.slice(0, 8);

    return (
      <div className="homepage__products-grid">
        {featured.map((product) => (
          <ProductCard key={product.productId} product={product} />
        ))}
      </div>
    );
  }

  return (
    <main className="homepage">
      <HeroSection />
      <section className="homepage__featured" aria-label="Productos destacados">
        <div className="homepage__featured-header">
          <h2 className="homepage__featured-title">Productos Destacados</h2>
          <p className="homepage__featured-subtitle">
            Descubre nuestra selección de productos más populares
          </p>
        </div>
        {renderProducts()}
      </section>
    </main>
  );
}

export default HomePage;
