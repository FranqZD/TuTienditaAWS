import { useCart } from '../../context/CartContext';
import './CartItem.css';

function CartItem({ item }) {
  const { incrementQuantity, decrementQuantity, removeFromCart } = useCart();

  const formatMXN = (amount) =>
    new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount);

  const subtotal = item.price * item.quantity;

  return (
    <li className="cart-item-card">
      <img
        className="cart-item-card__image"
        src={item.imageUrl}
        alt={item.name}
      />

      <div className="cart-item-card__details">
        <h3 className="cart-item-card__name">{item.name}</h3>
        <span className="cart-item-card__price">{formatMXN(item.price)}</span>
      </div>

      <div className="cart-item-card__quantity">
        <button
          className="cart-item-card__qty-btn"
          onClick={() => decrementQuantity(item.productId)}
          aria-label={`Reducir cantidad de ${item.name}`}
        >
          −
        </button>
        <span
          className="cart-item-card__qty-value"
          aria-label={`Cantidad: ${item.quantity}`}
        >
          {item.quantity}
        </span>
        <button
          className="cart-item-card__qty-btn"
          onClick={() => incrementQuantity(item.productId)}
          aria-label={`Aumentar cantidad de ${item.name}`}
        >
          +
        </button>
      </div>

      <span className="cart-item-card__subtotal">{formatMXN(subtotal)}</span>

      <button
        className="cart-item-card__remove"
        onClick={() => removeFromCart(item.productId)}
        aria-label={`Eliminar ${item.name} del carrito`}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
          <path d="M10 11v6" />
          <path d="M14 11v6" />
          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
        </svg>
      </button>
    </li>
  );
}

export default CartItem;
