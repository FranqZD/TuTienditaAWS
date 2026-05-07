import './CartSummary.css';

function CartSummary({ subtotal, totalItems, onCheckout, isLoading = false }) {
  const formattedSubtotal = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(subtotal);

  return (
    <div className="cart-summary-card">
      <h2 className="cart-summary-card__title">Resumen de compra</h2>

      <div className="cart-summary-card__details">
        <div className="cart-summary-card__row">
          <span className="cart-summary-card__label">Productos</span>
          <span className="cart-summary-card__value">
            {totalItems} {totalItems === 1 ? 'artículo' : 'artículos'}
          </span>
        </div>

        <div className="cart-summary-card__divider" />

        <div className="cart-summary-card__row cart-summary-card__row--total">
          <span className="cart-summary-card__label cart-summary-card__label--total">
            Subtotal
          </span>
          <span
            className="cart-summary-card__value cart-summary-card__value--total"
            aria-label={`Subtotal: ${formattedSubtotal}`}
          >
            {formattedSubtotal}
          </span>
        </div>
      </div>

      <button
        className="cart-summary-card__checkout-btn"
        onClick={onCheckout}
        disabled={isLoading}
        aria-busy={isLoading}
      >
        {isLoading ? (
          <>
            <span className="cart-summary-card__spinner" aria-hidden="true" />
            Procesando...
          </>
        ) : (
          'Finalizar compra'
        )}
      </button>
    </div>
  );
}

export default CartSummary;
