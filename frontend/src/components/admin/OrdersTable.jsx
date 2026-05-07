import './OrdersTable.css';

function OrdersTable({ orders, onViewDetail }) {
  const formatPrice = (price) =>
    new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(price);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-MX');
  };

  const truncateId = (id) => {
    if (!id) return '—';
    return id.length > 8 ? `${id.slice(0, 8)}...` : id;
  };

  return (
    <div className="orders-table__wrapper">
      <table className="orders-table">
        <thead>
          <tr>
            <th>ID Orden</th>
            <th>Fecha</th>
            <th>Total</th>
            <th>Estado</th>
            <th>Productos</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.orderId}>
              <td data-label="ID Orden">
                <span className="orders-table__order-id" title={order.orderId}>
                  {truncateId(order.orderId)}
                </span>
              </td>
              <td data-label="Fecha">
                {formatDate(order.createdAt)}
              </td>
              <td data-label="Total">
                <span className="orders-table__total">
                  {formatPrice(order.total)}
                </span>
              </td>
              <td data-label="Estado">
                <span
                  className={`orders-table__badge ${
                    order.status === 'completed'
                      ? 'orders-table__badge--completed'
                      : 'orders-table__badge--other'
                  }`}
                >
                  {order.status}
                </span>
              </td>
              <td data-label="Productos">
                {order.itemCount}
              </td>
              <td data-label="Acción">
                <button
                  className="orders-table__detail-btn"
                  onClick={() => onViewDetail(order)}
                >
                  Ver detalle
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default OrdersTable;
