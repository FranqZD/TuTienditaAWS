import ProductForm from '../../components/admin/ProductForm';
import { createProduct } from '../../services/api';
import './NewProductPage.css';

function NewProductPage() {
  async function handleCreateProduct(productData) {
    await createProduct(productData);
  }

  return (
    <div className="new-product-page">
      <h1 className="new-product-page__heading">Crear Nuevo Producto</h1>
      <p className="new-product-page__description">
        Completa el formulario para agregar un nuevo producto al catálogo.
      </p>
      <ProductForm onSubmit={handleCreateProduct} />
    </div>
  );
}

export default NewProductPage;
