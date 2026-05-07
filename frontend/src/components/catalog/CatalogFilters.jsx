import './CatalogFilters.css';

function CatalogFilters({ categories, selectedCategory, sortBy, onCategoryChange, onSortChange }) {
  return (
    <div className="catalog-filters">
      <div className="catalog-filters-group">
        <label htmlFor="category-filter" className="catalog-filters-label">
          Categoría
        </label>
        <select
          id="category-filter"
          className="catalog-filters-select"
          value={selectedCategory || ''}
          onChange={(e) => onCategoryChange(e.target.value || null)}
        >
          <option value="">Todas las categorías</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div className="catalog-filters-group">
        <label htmlFor="sort-filter" className="catalog-filters-label">
          Ordenar por
        </label>
        <select
          id="sort-filter"
          className="catalog-filters-select"
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
        >
          <option value="price-asc">Precio: menor a mayor</option>
          <option value="price-desc">Precio: mayor a menor</option>
          <option value="name-asc">Nombre A-Z</option>
        </select>
      </div>
    </div>
  );
}

export default CatalogFilters;
