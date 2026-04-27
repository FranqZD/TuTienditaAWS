import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { checkout } from '../services/api';
import CartItem from '../components/CartItem';
import CartSummary from '../components/CartSummary';
import './CartPage.css';

function CartPage() {
  const { items, clearCart } = useCart();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  const isEmpty = items.length === 0;

  async function handleCheckout() {
    setCheckoutLoading(true);
    setCheckoutError(null);
    setCheckoutSuccess(false);

    try {
      const cartItems = items.map(({ productId, quantity }) => ({
        productId,
        quantity,
      }));
      await checkout(cartItems);
      clearCart();
      setCheckoutSuccess(true);
    } catch (err) {
      setCheckoutError(err.message || 'Error al procesar la compra');
    } finally {
      setCheckoutLoading(false);
    }
  }

  return (
    <main>
      <h1 className="cart-page-title">Carrito de Compras</h1>

      {checkoutSuccess && (
        <div className="cart-message cart-message--success" role="status">
          ¡Compra realizada con éxito! Gracias por tu compra.
        </div>
      )}

      {checkoutError && (
        <div className="cart-message cart-message--error" role="alert">
          {checkoutError}
        </div>
      )}

      {isEmpty && !checkoutSuccess ? (
        <div className="cart-empty">
          <p>Tu carrito está vacío.</p>
          <Link to="/" className="cart-empty-link">Ver productos</Link>
        </div>
      ) : (
        <>
          {items.length > 0 && (
            <>
              <ul className="cart-items-list">
                {items.map((item) => (
                  <CartItem key={item.productId} item={item} />
                ))}
              </ul>
              <CartSummary />
              <button
                className="cart-checkout-btn"
                onClick={handleCheckout}
                disabled={isEmpty || checkoutLoading}
              >
                {checkoutLoading ? 'Procesando…' : 'Finalizar compra'}
              </button>
            </>
          )}
        </>
      )}
    </main>
  );
}

export default CartPage;
