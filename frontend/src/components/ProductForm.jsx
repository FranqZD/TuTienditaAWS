import { useState, useEffect } from 'react';
import './ProductForm.css';

const EMPTY_FORM = {
  name: '',
  description: '',
  price: '',
  stock: '',
  imageUrl: '',
};

function ProductForm({ product, onSubmit, onCancel }) {
  const isEditing = Boolean(product);

  const [formData, setFormData] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price != null ? String(product.price) : '',
        stock: product.stock != null ? String(product.stock) : '',
        imageUrl: product.imageUrl || '',
      });
    } else {
      setFormData(EMPTY_FORM);
    }
    setErrors([]);
  }, [product]);

  function validate() {
    const issues = [];
    if (!formData.name.trim()) issues.push('El nombre es obligatorio.');
    if (!formData.description.trim()) issues.push('La descripción es obligatoria.');

    const price = Number(formData.price);
    if (formData.price === '' || isNaN(price) || price <= 0) {
      issues.push('El precio debe ser un número mayor a 0.');
    }

    const stock = Number(formData.stock);
    if (formData.stock === '' || isNaN(stock) || stock < 0 || !Number.isInteger(stock)) {
      issues.push('El stock debe ser un entero mayor o igual a 0.');
    }

    if (!formData.imageUrl.trim()) issues.push('La URL de imagen es obligatoria.');

    return issues;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors([]);

    const issues = validate();
    if (issues.length > 0) {
      setErrors(issues);
      return;
    }

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      price: Number(formData.price),
      stock: Number(formData.stock),
      imageUrl: formData.imageUrl.trim(),
    };

    setSubmitting(true);
    try {
      await onSubmit(payload);
    } catch (err) {
      if (err.status === 400 && err.data) {
        const details = err.data.details || err.data.error;
        if (Array.isArray(details)) {
          setErrors(details);
        } else if (typeof details === 'string') {
          setErrors([details]);
        } else {
          setErrors([err.message || 'Datos inválidos']);
        }
      } else {
        setErrors([err.message || 'Error al guardar el producto']);
      }
    } finally {
      setSubmitting(false);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  return (
    <form className="product-form" onSubmit={handleSubmit} aria-label={isEditing ? 'Editar producto' : 'Crear producto'}>
      <h2 className="product-form-title">
        {isEditing ? 'Editar producto' : 'Nuevo producto'}
      </h2>

      {errors.length > 0 && (
        <div className="product-form-error" role="alert">
          {errors.length === 1 ? (
            <span>{errors[0]}</span>
          ) : (
            <ul>
              {errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="product-form-fields">
        <div className="product-form-group">
          <label htmlFor="pf-name">Nombre</label>
          <input
            id="pf-name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="product-form-group">
          <label htmlFor="pf-description">Descripción</label>
          <textarea
            id="pf-description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>

        <div className="product-form-row">
          <div className="product-form-group">
            <label htmlFor="pf-price">Precio</label>
            <input
              id="pf-price"
              name="price"
              type="number"
              min="0.01"
              step="0.01"
              value={formData.price}
              onChange={handleChange}
              required
            />
          </div>

          <div className="product-form-group">
            <label htmlFor="pf-stock">Stock</label>
            <input
              id="pf-stock"
              name="stock"
              type="number"
              min="0"
              step="1"
              value={formData.stock}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="product-form-group">
          <label htmlFor="pf-imageUrl">URL de imagen</label>
          <input
            id="pf-imageUrl"
            name="imageUrl"
            type="text"
            value={formData.imageUrl}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="product-form-actions">
        <button
          type="submit"
          className="product-form-submit"
          disabled={submitting}
        >
          {submitting
            ? 'Guardando…'
            : isEditing
              ? 'Guardar cambios'
              : 'Crear producto'}
        </button>
        <button
          type="button"
          className="product-form-cancel"
          onClick={onCancel}
          disabled={submitting}
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

export default ProductForm;
