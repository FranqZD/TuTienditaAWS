import { useState, useEffect } from 'react';
import { getOrders } from '../../services/api';
import OrdersTable from '../../components/admin/OrdersTable';
import OrderDetailModal from '../../components/admin/OrderDetailModal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorMessage from '../../components/ui/ErrorMessage';
import EmptyState from '../../components/ui/EmptyState';
import './OrdersPage.css';

function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getOrders();
      setOrders(data);
    } catch (err) {
      setError(err.message || 'Error al cargar las órdenes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Cargando órdenes..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchOrders} />;
  }

  if (orders.length === 0) {
    return (
      <div className="orders-page">
        <h1 className="orders-page__title">Órdenes</h1>
        <EmptyState
          title="Sin órdenes"
          message="Aún no se han registrado órdenes en la tienda."
        />
      </div>
    );
  }

  return (
    <div className="orders-page">
      <h1 className="orders-page__title">Órdenes</h1>
      <OrdersTable orders={orders} onViewDetail={setSelectedOrder} />
      <OrderDetailModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </div>
  );
}

export default OrdersPage;
