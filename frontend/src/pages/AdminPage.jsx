import { useState, useEffect, useCallback } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../services/api';
import ProductForm from '../components/ProductForm';
import './AdminPage.css';

function AdminPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [message, setMessage] = useState(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      setError(err.message || 'Error al cargar los productos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  function showSuccess(text) {
    setMessage({ type: 'success', text });
    setTimeout(() => setMessage(null), 4000);
  }

  function showError(text) {
    setMessage({ type: 'error', text });
    setTimeout(() => setMessage(null), 5000);
  }

  function handleCreate() {
    setEditingProduct(null);
    setShowForm(true);
    setMessage(null);
  }

  function handleEdit(product) {
    setEditingProduct(product);
    setShowForm(true);
    setMessage(null);
  }

  function handleCancelForm() {
    setShowForm(false);
    setEditingProduct(null);
  }

  async function handleFormSubmit(data) {
    if (editingProduct) {
      await updateProduct(editingProduct.productId, data);
      showSuccess('Producto actualizado correctamente.');
    } else {
      await createProduct(data);
      showSuccess('Producto creado correctamente.');
    }
    setShowForm(false);
    setEditingProduct(null);
    await fetchProducts();
  }

  async function handleDelete(product) {
    const confirmed = window.confirm(
      `¿Estás seguro de eliminar "${product.name}"?`
    );
    if (!confirmed) return;

    try {
      await deleteProduct(product.productId);
      showSuccess(`"${product.name}" eliminado correctamente.`);
      await fetchProducts();
    } catch (err) {
      showError(err.message || 'Error al eliminar el producto');
    }
  }

  const formatPrice = (price) =>
    new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(price);

  return (
    <main>
      <div className="admin-header">
        <h1>Panel de Administración</h1>
        {!showForm && (
          <button className="admin-create-btn" onClick={handleCreate}>
            Crear producto
          </button>
        )}
      </div>

      {message && (
        <div
          className={`admin-message admin-message--${message.type}`}
          role={message.type === 'error' ? 'alert' : 'status'}
        >
          {message.text}
        </div>
      )}

      {showForm && (
        <ProductForm
          product={editingProduct}
          onSubmit={handleFormSubmit}
          onCancel={handleCancelForm}
        />
      )}

      {loading ? (
        <div className="admin-loading" role="status">
          <p>Cargando productos…</p>
        </div>
      ) : error ? (
        <div className="admin-error" role="alert">
          <p>{error}</p>
        </div>
      ) : products.length === 0 ? (
        <div className="admin-empty">
          <p>No hay productos registrados.</p>
        </div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.productId}>
                  <td data-label="Nombre">
                    <span className="admin-product-name">{product.name}</span>
                  </td>
                  <td data-label="Precio">
                    <span className="admin-product-price">
                      {formatPrice(product.price)}
                    </span>
                  </td>
                  <td data-label="Stock">{product.stock}</td>
                  <td data-label="Estado">
                    <span
                      className={`admin-badge ${
                        product.active !== false
                          ? 'admin-badge--active'
                          : 'admin-badge--inactive'
                      }`}
                    >
                      {product.active !== false ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td data-label="Acciones">
                    <div className="admin-actions">
                      <button
                        className="admin-edit-btn"
                        onClick={() => handleEdit(product)}
                      >
                        Editar
                      </button>
                      <button
                        className="admin-delete-btn"
                        onClick={() => handleDelete(product)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

export default AdminPage;
