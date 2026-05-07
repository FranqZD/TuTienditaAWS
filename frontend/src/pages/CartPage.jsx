import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { checkout } from '../services/api';
import CartItem from '../components/cart/CartItem';
import CartSummary from '../components/cart/CartSummary';
import CheckoutConfirmation from '../components/cart/CheckoutConfirmation';
import EmptyState from '../components/ui/EmptyState';
import ErrorMessage from '../components/ui/ErrorMessage';
import './CartPage.css';

function CartPage() {
  const { items, clearCart } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);
  const [orderConfirmation, setOrderConfirmation] = useState(null);

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  async function handleCheckout() {
    setIsLoading(true);
    setCheckoutError(null);

    try {
      const cartItems = items.map(({ productId, quantity }) => ({
        productId,
        quantity,
      }));
      const result = await checkout(cartItems);
      clearCart();
      setOrderConfirmation(result);
    } catch (err) {
      if (err.status === 400 && err.data?.stockErrors) {
        const stockMessages = err.data.stockErrors
          .map(
            (e) =>
              `${e.name || e.productId}: stock insuficiente (disponible: ${e.available ?? 0})`
          )
          .join('. ');
        setCheckoutError(stockMessages);
      } else {
        setCheckoutError(
          'Error al procesar la compra. Intenta de nuevo.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  }

  if (orderConfirmation) {
    return (
      <main className="cart-page">
        <h1 className="cart-page__title">Carrito de Compras</h1>
        <CheckoutConfirmation order={orderConfirmation} />
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="cart-page">
        <h1 className="cart-page__title">Carrito de Compras</h1>
        <EmptyState
          title="Tu carrito está vacío"
          message="Agrega productos desde el catálogo para comenzar tu compra."
          actionLabel="Ir al catálogo"
          actionTo="/catalogo"
        />
      </main>
    );
  }

  return (
    <main className="cart-page">
      <h1 className="cart-page__title">Carrito de Compras</h1>

      {checkoutError && (
        <ErrorMessage message={checkoutError} />
      )}

      <div className="cart-page__content">
        <section className="cart-page__items">
          <ul className="cart-page__items-list">
            {items.map((item) => (
              <CartItem key={item.productId} item={item} />
            ))}
          </ul>
        </section>

        <aside className="cart-page__sidebar">
          <CartSummary
            subtotal={subtotal}
            totalItems={totalItems}
            onCheckout={handleCheckout}
            isLoading={isLoading}
          />
        </aside>
      </div>
    </main>
  );
}

export default CartPage;
