import { useState, useEffect } from 'react';
import { getProducts } from '../services/api';
import CatalogFilters from '../components/catalog/CatalogFilters';
import ProductCard from '../components/catalog/ProductCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorMessage from '../components/ui/ErrorMessage';
import EmptyState from '../components/ui/EmptyState';
import './CatalogPage.css';

/**
 * Filtra productos por categoría.
 * Si selectedCategory es null/undefined/empty, retorna todos los productos.
 */
export function filterByCategory(products, selectedCategory) {
  if (!selectedCategory) {
    return products;
  }
  return products.filter((product) => product.category === selectedCategory);
}

/**
 * Ordena productos según el criterio especificado.
 * Retorna un nuevo array ordenado (no muta el original).
 */
export function sortProducts(products, sortBy) {
  const sorted = [...products];

  switch (sortBy) {
    case 'price-asc':
      sorted.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      sorted.sort((a, b) => b.price - a.price);
      break;
    case 'name-asc':
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      break;
    default:
      break;
  }

  return sorted;
}

function CatalogPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [sortBy, setSortBy] = useState('price-asc');

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      setError(err.message || 'Error al cargar los productos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Extract unique categories from products
  const categories = [...new Set(products.map((p) => p.category).filter(Boolean))];

  // Apply filter and sort as pure transformations
  const filtered = filterByCategory(products, selectedCategory);
  const displayProducts = sortProducts(filtered, sortBy);

  if (loading) {
    return <LoadingSpinner message="Cargando catálogo..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchProducts} />;
  }

  return (
    <section className="catalog-page">
      <h1 className="catalog-page__title">Catálogo</h1>

      <CatalogFilters
        categories={categories}
        selectedCategory={selectedCategory}
        sortBy={sortBy}
        onCategoryChange={setSelectedCategory}
        onSortChange={setSortBy}
      />

      {displayProducts.length === 0 ? (
        <EmptyState
          title="Sin resultados"
          message="No se encontraron productos con los filtros seleccionados."
        />
      ) : (
        <div className="catalog-page__grid">
          {displayProducts.map((product) => (
            <ProductCard key={product.productId} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}

export default CatalogPage;
