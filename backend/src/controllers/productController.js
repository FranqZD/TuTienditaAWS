const productService = require('../services/productService');

/**
 * GET /api/products — List all active products
 */
const getAll = async (req, res) => {
  try {
    const products = await productService.getAllActive();
    res.status(200).json(products);
  } catch (err) {
    const status = err.statusCode || 500;
    const response = { error: err.message || 'Error interno del servidor' };
    if (status === 400 && err.details) {
      response.details = err.details;
    }
    res.status(status).json(response);
  }
};

/**
 * GET /api/products/:id — Get product by ID
 */
const getById = async (req, res) => {
  try {
    const product = await productService.getById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.status(200).json(product);
  } catch (err) {
    const status = err.statusCode || 500;
    const response = { error: err.message || 'Error interno del servidor' };
    if (status === 400 && err.details) {
      response.details = err.details;
    }
    res.status(status).json(response);
  }
};

/**
 * POST /api/products — Create a new product
 */
const create = async (req, res) => {
  try {
    const product = await productService.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    const status = err.statusCode || 500;
    const response = { error: err.message || 'Error interno del servidor' };
    if (status === 400 && err.details) {
      response.details = err.details;
    }
    res.status(status).json(response);
  }
};

/**
 * PUT /api/products/:id — Update an existing product
 */
const update = async (req, res) => {
  try {
    const product = await productService.update(req.params.id, req.body);
    res.status(200).json(product);
  } catch (err) {
    const status = err.statusCode || 500;
    const response = { error: err.message || 'Error interno del servidor' };
    if (status === 400 && err.details) {
      response.details = err.details;
    }
    res.status(status).json(response);
  }
};

/**
 * DELETE /api/products/:id — Soft delete a product
 */
const remove = async (req, res) => {
  try {
    const result = await productService.softDelete(req.params.id);
    res.status(200).json(result);
  } catch (err) {
    const status = err.statusCode || 500;
    const response = { error: err.message || 'Error interno del servidor' };
    if (status === 400 && err.details) {
      response.details = err.details;
    }
    res.status(status).json(response);
  }
};

module.exports = { getAll, getById, create, update, delete: remove };
