const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;

  try {
    const response = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      const error = new Error(data.error || `Error ${response.status}`);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    if (err.status) throw err;
    const error = new Error('Error de conexión con el servidor');
    error.status = 0;
    throw error;
  }
}

export function getProducts() {
  return request('/api/products');
}

export function getProductById(id) {
  return request(`/api/products/${id}`);
}

export function createProduct(data) {
  return request('/api/products', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateProduct(id, data) {
  return request(`/api/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function deleteProduct(id) {
  return request(`/api/products/${id}`, {
    method: 'DELETE',
  });
}

export function checkout(cartItems) {
  return request('/api/orders/checkout', {
    method: 'POST',
    body: JSON.stringify({ items: cartItems }),
  });
}

export function getOrders() {
  return request('/api/orders');
}
