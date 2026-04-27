import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductById } from '../services/api';
import { useCart } from '../context/CartContext';
import './ProductDetailPage.css';

function ProductDetailPage() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchProduct() {
      try {
        setLoading(true);
        setError(null);
        const data = await getProductById(id);
        if (!cancelled) {
          setProduct(data);
        }
      } catch (err) {
        if (!cancelled) {
          if (err.status === 404) {
            setError('notFound');
          } else {
            setError(err.message || 'Error al cargar el producto');
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchProduct();

    return () => {
      cancelled = true;
    };
  }, [id]);

  function handleAddToCart() {
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  if (loading) {
    return (
      <main className="detail-page">
        <div className="detail-loading" role="status">
          <p>Cargando producto…</p>
        </div>
      </main>
    );
  }

  if (error === 'notFound') {
    return (
      <main className="detail-page">
        <div className="detail-not-found" role="alert">
          <h1>Producto no encontrado</h1>
          <p>El producto que buscas no existe o fue eliminado.</p>
          <Link to="/" className="detail-back-link">Volver a la tienda</Link>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="detail-page">
        <div className="detail-error" role="alert">
          <h1>Error</h1>
          <p>{error}</p>
          <Link to="/" className="detail-back-link">Volver a la tienda</Link>
        </div>
      </main>
    );
  }

  const formattedPrice = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(product.price);

  const outOfStock = product.stock <= 0;

  return (
    <main className="detail-page">
      <nav aria-label="Breadcrumb" className="detail-breadcrumb">
        <Link to="/">Productos</Link>
        <span aria-hidden="true">/</span>
        <span>{product.name}</span>
      </nav>

      <article className="detail-content">
        <div className="detail-image-container">
          <img
            className="detail-image"
            src={product.imageUrl}
            alt={product.name}
          />
        </div>

        <div className="detail-info">
          <h1 className="detail-name">{product.name}</h1>
          <p className="detail-description">{product.description}</p>

          <div className="detail-meta">
            <span className="detail-price">{formattedPrice}</span>
            <span className={`detail-stock ${outOfStock ? 'detail-stock--empty' : ''}`}>
              {outOfStock ? 'Sin stock' : `Stock: ${product.stock}`}
            </span>
          </div>

          <button
            className="detail-add-btn"
            onClick={handleAddToCart}
            disabled={outOfStock}
          >
            {added ? '¡Agregado!' : 'Agregar al carrito'}
          </button>
        </div>
      </article>
    </main>
  );
}

export default ProductDetailPage;
