import { useCart } from '../context/CartContext';
import './CartSummary.css';

function CartSummary() {
  const { total } = useCart();

  const formattedTotal = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(total);

  return (
    <div className="cart-summary">
      <span className="cart-summary-label">Total</span>
      <span className="cart-summary-total" aria-label={`Total: ${formattedTotal}`}>
        {formattedTotal}
      </span>
    </div>
  );
}

export default CartSummary;
