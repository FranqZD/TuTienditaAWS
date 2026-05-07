import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getProducts, deleteProduct } from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorMessage from '../../components/ui/ErrorMessage';
import EmptyState from '../../components/ui/EmptyState';
import './ProductsPage.css';

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  async function handleDelete(product) {
    const confirmed = window.confirm(
      `¿Estás seguro de eliminar "${product.name}"?`
    );
    if (!confirmed) return;

    try {
      await deleteProduct(product.productId);
      await fetchProducts();
    } catch (err) {
      setError(err.message || 'Error al eliminar el producto');
    }
  }

  const formatPrice = (price) =>
    new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(price);

  if (loading) {
    return <LoadingSpinner message="Cargando productos..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchProducts} />;
  }

  if (products.length === 0) {
    return (
      <EmptyState
        title="Sin productos"
        message="No hay productos registrados aún."
        actionLabel="Crear producto"
        actionTo="/admin/nuevo"
      />
    );
  }

  return (
    <div className="products-page">
      <div className="products-page__header">
        <h1 className="products-page__title">Productos</h1>
        <Link to="/admin/nuevo" className="products-page__create-btn">
          Crear Producto
        </Link>
      </div>

      <div className="products-page__table-wrapper">
        <table className="products-page__table">
          <thead>
            <tr>
              <th>Imagen</th>
              <th>Nombre</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Categoría</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.productId}>
                <td data-label="Imagen">
                  <img
                    className="products-page__thumbnail"
                    src={product.imageUrl}
                    alt={product.name}
                  />
                </td>
                <td data-label="Nombre">
                  <span className="products-page__product-name">
                    {product.name}
                  </span>
                </td>
                <td data-label="Precio">
                  <span className="products-page__product-price">
                    {formatPrice(product.price)}
                  </span>
                </td>
                <td data-label="Stock">{product.stock}</td>
                <td data-label="Categoría">
                  {product.category || '—'}
                </td>
                <td data-label="Estado">
                  <span
                    className={`products-page__badge ${
                      product.active !== false
                        ? 'products-page__badge--active'
                        : 'products-page__badge--inactive'
                    }`}
                  >
                    {product.active !== false ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td data-label="Acciones">
                  <div className="products-page__actions">
                    <Link
                      to={`/admin/productos/${product.productId}/editar`}
                      className="products-page__edit-btn"
                    >
                      Editar
                    </Link>
                    <button
                      className="products-page__delete-btn"
                      onClick={() => handleDelete(product)}
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ProductsPage;
