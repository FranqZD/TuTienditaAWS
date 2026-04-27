import { useCart } from '../context/CartContext';
import './CartItem.css';

function CartItem({ item }) {
  const { incrementQuantity, decrementQuantity, removeFromCart } = useCart();

  const formattedPrice = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(item.price);

  return (
    <li className="cart-item">
      <img
        className="cart-item-image"
        src={item.imageUrl}
        alt={item.name}
      />
      <div className="cart-item-info">
        <h2 className="cart-item-name">{item.name}</h2>
        <span className="cart-item-price">{formattedPrice}</span>
      </div>
      <div className="cart-item-controls">
        <button
          className="cart-item-qty-btn"
          onClick={() => decrementQuantity(item.productId)}
          aria-label={`Reducir cantidad de ${item.name}`}
        >
          −
        </button>
        <span className="cart-item-quantity" aria-label={`Cantidad: ${item.quantity}`}>
          {item.quantity}
        </span>
        <button
          className="cart-item-qty-btn"
          onClick={() => incrementQuantity(item.productId)}
          aria-label={`Aumentar cantidad de ${item.name}`}
        >
          +
        </button>
      </div>
      <button
        className="cart-item-remove-btn"
        onClick={() => removeFromCart(item.productId)}
        aria-label={`Eliminar ${item.name} del carrito`}
      >
        Eliminar
      </button>
    </li>
  );
}

export default CartItem;
