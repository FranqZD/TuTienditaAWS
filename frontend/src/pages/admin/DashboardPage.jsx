import { useState, useEffect } from 'react';
import { getProducts, getOrders } from '../../services/api';
import DashboardCards from '../../components/admin/DashboardCards';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorMessage from '../../components/ui/ErrorMessage';
import './DashboardPage.css';

/**
 * Calcula las métricas del dashboard a partir de productos y órdenes.
 * Exportada para testing (property-based tests).
 */
export function calculateMetrics(products, orders) {
  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.active !== false).length;
  const lowStockProducts = products.filter(p => p.stock > 0 && p.stock <= 5).length;
  const totalOrders = orders.length;

  return { totalProducts, activeProducts, lowStockProducts, totalOrders };
}

function DashboardPage() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [productsData, ordersData] = await Promise.all([
        getProducts(),
        getOrders(),
      ]);
      setProducts(productsData);
      setOrders(ordersData);
    } catch (err) {
      setError(err.message || 'Error al cargar los datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Cargando dashboard..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchData} />;
  }

  const metrics = calculateMetrics(products, orders);

  return (
    <div className="dashboard-page">
      <h1 className="dashboard-page__title">Dashboard</h1>
      <DashboardCards metrics={metrics} />
    </div>
  );
}

export default DashboardPage;
