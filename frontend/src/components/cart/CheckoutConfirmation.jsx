import './CheckoutConfirmation.css';

function CheckoutConfirmation({ order }) {
  const { orderId, createdAt, items, total } = order;

  const formatMXN = (amount) =>
    new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount);

  const formattedDate = new Date(createdAt).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <section className="checkout-confirmation" aria-labelledby="confirmation-title">
      <div className="checkout-confirmation__icon" aria-hidden="true">
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      </div>

      <h2 className="checkout-confirmation__title" id="confirmation-title">
        ¡Compra exitosa!
      </h2>

      <p className="checkout-confirmation__subtitle">
        Tu pedido ha sido procesado correctamente.
      </p>

      <div className="checkout-confirmation__details">
        <div className="checkout-confirmation__row">
          <span className="checkout-confirmation__label">Número de orden</span>
          <span className="checkout-confirmation__value checkout-confirmation__value--order-id">
            {orderId}
          </span>
        </div>

        <div className="checkout-confirmation__row">
          <span className="checkout-confirmation__label">Fecha</span>
          <span className="checkout-confirmation__value">{formattedDate}</span>
        </div>
      </div>

      <div className="checkout-confirmation__items">
        <h3 className="checkout-confirmation__items-title">Productos comprados</h3>
        <ul className="checkout-confirmation__items-list">
          {items.map((item, index) => (
            <li key={index} className="checkout-confirmation__item">
              <span className="checkout-confirmation__item-name">
                {item.name}
              </span>
              <span className="checkout-confirmation__item-qty">
                ×{item.quantity}
              </span>
              <span className="checkout-confirmation__item-price">
                {formatMXN(item.price * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="checkout-confirmation__divider" />

      <div className="checkout-confirmation__total">
        <span className="checkout-confirmation__total-label">Total pagado</span>
        <span className="checkout-confirmation__total-value">
          {formatMXN(total)}
        </span>
      </div>
    </section>
  );
}

export default CheckoutConfirmation;
