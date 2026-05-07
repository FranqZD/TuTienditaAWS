import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import './ProductCard.css';

function ProductCard({ product }) {
  const { addToCart } = useCart();

  const formattedPrice = product.price.toLocaleString('es-MX', {
    style: 'currency',
    currency: 'MXN',
  });

  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock >= 1 && product.stock <= 5;

  return (
    <article className="product-card">
      {isOutOfStock && (
        <span className="product-card-badge product-card-badge--out">Agotado</span>
      )}
      {isLowStock && (
        <span className="product-card-badge product-card-badge--low">Últimas unidades</span>
      )}

      <Link to={`/products/${product.productId}`} className="product-card-link">
        <img
          className="product-card-image"
          src={product.imageUrl}
          alt={product.name}
          loading="lazy"
        />
      </Link>

      <div className="product-card-body">
        <Link to={`/products/${product.productId}`} className="product-card-link">
          <h2 className="product-card-name">{product.name}</h2>
        </Link>
        <p className="product-card-description">{product.description}</p>
      </div>

      <div className="product-card-footer">
        <span className="product-card-price">{formattedPrice}</span>
        <span className="product-card-stock">
          {isOutOfStock ? 'Sin stock' : `Stock: ${product.stock}`}
        </span>
      </div>

      <button
        className="product-card-add-btn"
        onClick={() => addToCart(product)}
        disabled={isOutOfStock}
      >
        {isOutOfStock ? 'No disponible' : 'Agregar al carrito'}
      </button>
    </article>
  );
}

export default ProductCard;
