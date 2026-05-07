import { useState, useEffect } from 'react';
import './ProductForm.css';

const EMPTY_FORM = {
  name: '',
  description: '',
  price: '',
  stock: '',
  imageUrl: '',
  category: '',
  active: true,
};

/**
 * Validates product form data and returns an object with field-level errors.
 * Exported for property-based testing (task 10.8).
 */
export function validateProductForm(formData) {
  const errors = {};

  if (!formData.name || !formData.name.trim()) {
    errors.name = 'El nombre es obligatorio.';
  }

  if (!formData.description || !formData.description.trim()) {
    errors.description = 'La descripción es obligatoria.';
  }

  const price = Number(formData.price);
  if (formData.price === '' || formData.price === undefined || formData.price === null || isNaN(price) || price <= 0) {
    errors.price = 'El precio debe ser un número mayor a 0.';
  }

  const stock = Number(formData.stock);
  if (formData.stock === '' || formData.stock === undefined || formData.stock === null || isNaN(stock) || stock < 0 || !Number.isInteger(stock)) {
    errors.stock = 'El stock debe ser un entero mayor o igual a 0.';
  }

  if (!formData.imageUrl || !formData.imageUrl.trim()) {
    errors.imageUrl = 'La URL de imagen es obligatoria.';
  } else if (!/^https?:\/\/.+/.test(formData.imageUrl.trim())) {
    errors.imageUrl = 'La URL debe comenzar con http:// o https://';
  }

  if (!formData.category || !formData.category.trim()) {
    errors.category = 'La categoría es obligatoria.';
  }

  return errors;
}

function isValidImageUrl(url) {
  if (!url || !url.trim()) return false;
  return /^https?:\/\/.+/.test(url.trim());
}

function ProductForm({ product, onSubmit, onCancel }) {
  const isEditing = Boolean(product);

  const [formData, setFormData] = useState(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price != null ? String(product.price) : '',
        stock: product.stock != null ? String(product.stock) : '',
        imageUrl: product.imageUrl || '',
        category: product.category || '',
        active: product.active !== false,
      });
    } else {
      setFormData(EMPTY_FORM);
    }
    setFieldErrors({});
    setServerError('');
    setSuccessMessage('');
  }, [product]);

  async function handleSubmit(e) {
    e.preventDefault();
    setFieldErrors({});
    setServerError('');
    setSuccessMessage('');

    const errors = validateProductForm(formData);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      price: Number(formData.price),
      stock: Number(formData.stock),
      imageUrl: formData.imageUrl.trim(),
      category: formData.category.trim(),
      active: formData.active,
    };

    setSubmitting(true);
    try {
      await onSubmit(payload);
      setSuccessMessage('Producto guardado exitosamente.');
      setFormData(EMPTY_FORM);
      setFieldErrors({});
    } catch (err) {
      if (err.status === 400 && err.data) {
        const details = err.data.details || err.data.error;
        if (Array.isArray(details)) {
          setServerError(details.join('. '));
        } else if (typeof details === 'string') {
          setServerError(details);
        } else {
          setServerError(err.message || 'Datos inválidos');
        }
      } else {
        setServerError(err.message || 'Error al guardar el producto');
      }
    } finally {
      setSubmitting(false);
    }
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear field error on change
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
    // Clear success message on new input
    if (successMessage) {
      setSuccessMessage('');
    }
  }

  return (
    <form className="admin-product-form" onSubmit={handleSubmit} aria-label={isEditing ? 'Editar producto' : 'Crear producto'}>
      <h2 className="admin-product-form__title">
        {isEditing ? 'Editar producto' : 'Nuevo producto'}
      </h2>

      {successMessage && (
        <div className="admin-product-form__success" role="status">
          {successMessage}
        </div>
      )}

      {serverError && (
        <div className="admin-product-form__server-error" role="alert">
          {serverError}
        </div>
      )}

      <div className="admin-product-form__fields">
        <div className={`admin-product-form__group ${fieldErrors.name ? 'admin-product-form__group--error' : ''}`}>
          <label htmlFor="apf-name">Nombre</label>
          <input
            id="apf-name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
          />
          {fieldErrors.name && <span className="admin-product-form__field-error">{fieldErrors.name}</span>}
        </div>

        <div className={`admin-product-form__group ${fieldErrors.description ? 'admin-product-form__group--error' : ''}`}>
          <label htmlFor="apf-description">Descripción</label>
          <textarea
            id="apf-description"
            name="description"
            value={formData.description}
            onChange={handleChange}
          />
          {fieldErrors.description && <span className="admin-product-form__field-error">{fieldErrors.description}</span>}
        </div>

        <div className="admin-product-form__row">
          <div className={`admin-product-form__group ${fieldErrors.price ? 'admin-product-form__group--error' : ''}`}>
            <label htmlFor="apf-price">Precio</label>
            <input
              id="apf-price"
              name="price"
              type="number"
              min="0.01"
              step="0.01"
              value={formData.price}
              onChange={handleChange}
            />
            {fieldErrors.price && <span className="admin-product-form__field-error">{fieldErrors.price}</span>}
          </div>

          <div className={`admin-product-form__group ${fieldErrors.stock ? 'admin-product-form__group--error' : ''}`}>
            <label htmlFor="apf-stock">Stock</label>
            <input
              id="apf-stock"
              name="stock"
              type="number"
              min="0"
              step="1"
              value={formData.stock}
              onChange={handleChange}
            />
            {fieldErrors.stock && <span className="admin-product-form__field-error">{fieldErrors.stock}</span>}
          </div>
        </div>

        <div className={`admin-product-form__group ${fieldErrors.category ? 'admin-product-form__group--error' : ''}`}>
          <label htmlFor="apf-category">Categoría</label>
          <input
            id="apf-category"
            name="category"
            type="text"
            value={formData.category}
            onChange={handleChange}
          />
          {fieldErrors.category && <span className="admin-product-form__field-error">{fieldErrors.category}</span>}
        </div>

        <div className={`admin-product-form__group ${fieldErrors.imageUrl ? 'admin-product-form__group--error' : ''}`}>
          <label htmlFor="apf-imageUrl">URL de imagen</label>
          <input
            id="apf-imageUrl"
            name="imageUrl"
            type="text"
            value={formData.imageUrl}
            onChange={handleChange}
            placeholder="https://ejemplo.com/imagen.jpg"
          />
          {fieldErrors.imageUrl && <span className="admin-product-form__field-error">{fieldErrors.imageUrl}</span>}
          {isValidImageUrl(formData.imageUrl) && (
            <div className="admin-product-form__image-preview">
              <img
                src={formData.imageUrl.trim()}
                alt="Vista previa del producto"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
          )}
        </div>

        <div className="admin-product-form__group admin-product-form__group--toggle">
          <label htmlFor="apf-active" className="admin-product-form__toggle-label">
            <input
              id="apf-active"
              name="active"
              type="checkbox"
              checked={formData.active}
              onChange={handleChange}
            />
            <span className="admin-product-form__toggle-text">
              {formData.active ? 'Producto activo' : 'Producto inactivo'}
            </span>
          </label>
        </div>
      </div>

      <div className="admin-product-form__actions">
        <button
          type="submit"
          className="admin-product-form__submit"
          disabled={submitting}
        >
          {submitting
            ? 'Guardando…'
            : isEditing
              ? 'Guardar cambios'
              : 'Crear producto'}
        </button>
        {onCancel && (
          <button
            type="button"
            className="admin-product-form__cancel"
            onClick={onCancel}
            disabled={submitting}
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}

export default ProductForm;
