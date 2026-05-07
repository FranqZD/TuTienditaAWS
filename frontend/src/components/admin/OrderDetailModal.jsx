import { useEffect } from 'react';
import './OrderDetailModal.css';

function OrderDetailModal({ order, onClose }) {
  useEffect(() => {
    if (order) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [order]);

  if (!order) return null;

  const formatMXN = (amount) =>
    new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount);

  const formattedDate = new Date(order.createdAt).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="order-modal__overlay"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-modal-title"
    >
      <div className="order-modal">
        <header className="order-modal__header">
          <h2 className="order-modal__title" id="order-modal-title">
            Detalle de Orden
          </h2>
          <button
            className="order-modal__close-btn"
            onClick={onClose}
            aria-label="Cerrar modal"
          >
            ×
          </button>
        </header>

        <div className="order-modal__body">
          <div className="order-modal__info">
            <div className="order-modal__info-row">
              <span className="order-modal__label">ID de Orden</span>
              <span className="order-modal__value order-modal__value--id">
                {order.orderId}
              </span>
            </div>
            <div className="order-modal__info-row">
              <span className="order-modal__label">Fecha</span>
              <span className="order-modal__value">{formattedDate}</span>
            </div>
          </div>

          <div className="order-modal__items">
            <h3 className="order-modal__items-title">Productos</h3>
            <ul className="order-modal__items-list">
              {order.items && order.items.map((item, index) => (
                <li key={index} className="order-modal__item">
                  <span className="order-modal__item-name">{item.name}</span>
                  <span className="order-modal__item-qty">×{item.quantity}</span>
                  <span className="order-modal__item-price">
                    {formatMXN(item.price)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="order-modal__divider" />

          <div className="order-modal__total">
            <span className="order-modal__total-label">Total</span>
            <span className="order-modal__total-value">
              {formatMXN(order.total)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderDetailModal;
