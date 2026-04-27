const { ScanCommand, GetCommand, PutCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');
const { docClient, PRODUCTS_TABLE_NAME } = require('../config/dynamodb');

/**
 * Validates product data for create or update operations.
 * For create, all fields are required. For update (partial), only provided fields are validated.
 * @param {object} data - Product data to validate
 * @param {boolean} partial - If true, only validate provided fields (for updates)
 * @returns {string[]} Array of error messages (empty if valid)
 */
function validateProductData(data, partial = false) {
  const errors = [];

  if (!partial || data.name !== undefined) {
    if (typeof data.name !== 'string' || data.name.trim() === '') {
      errors.push('name debe ser un string no vacío');
    }
  }

  if (!partial || data.description !== undefined) {
    if (typeof data.description !== 'string' || data.description.trim() === '') {
      errors.push('description debe ser un string no vacío');
    }
  }

  if (!partial || data.price !== undefined) {
    if (typeof data.price !== 'number' || data.price <= 0) {
      errors.push('price debe ser un número mayor a 0');
    }
  }

  if (!partial || data.stock !== undefined) {
    if (!Number.isInteger(data.stock) || data.stock < 0) {
      errors.push('stock debe ser un entero mayor o igual a 0');
    }
  }

  if (!partial || data.imageUrl !== undefined) {
    if (typeof data.imageUrl !== 'string' || data.imageUrl.trim() === '') {
      errors.push('imageUrl debe ser un string no vacío');
    }
  }

  // For create (non-partial), ensure all required fields are present
  if (!partial) {
    const requiredFields = ['name', 'description', 'price', 'stock', 'imageUrl'];
    for (const field of requiredFields) {
      if (data[field] === undefined || data[field] === null) {
        if (!errors.some((e) => e.startsWith(field))) {
          errors.push(`${field} es requerido`);
        }
      }
    }
  }

  return errors;
}

/**
 * Get all active products from Tabla_Productos.
 * @returns {Promise<object[]>} Array of active products
 */
async function getAllActive() {
  const command = new ScanCommand({
    TableName: PRODUCTS_TABLE_NAME,
    FilterExpression: '#active = :activeVal',
    ExpressionAttributeNames: { '#active': 'active' },
    ExpressionAttributeValues: { ':activeVal': true },
  });

  const result = await docClient.send(command);
  return result.Items || [];
}

/**
 * Get a product by its productId.
 * @param {string} productId
 * @returns {Promise<object|null>} The product or null if not found
 */
async function getById(productId) {
  const command = new GetCommand({
    TableName: PRODUCTS_TABLE_NAME,
    Key: { productId },
  });

  const result = await docClient.send(command);
  return result.Item || null;
}

/**
 * Create a new product in Tabla_Productos.
 * @param {object} data - Product data (name, description, price, stock, imageUrl)
 * @returns {Promise<object>} The created product
 * @throws {object} Error with statusCode 400 if validation fails
 */
async function create(data) {
  const errors = validateProductData(data, false);
  if (errors.length > 0) {
    const error = new Error('Datos inválidos');
    error.statusCode = 400;
    error.details = errors;
    throw error;
  }

  const now = new Date().toISOString();
  const product = {
    productId: uuidv4(),
    name: data.name.trim(),
    description: data.description.trim(),
    price: data.price,
    stock: data.stock,
    imageUrl: data.imageUrl.trim(),
    active: true,
    createdAt: now,
    updatedAt: now,
  };

  const command = new PutCommand({
    TableName: PRODUCTS_TABLE_NAME,
    Item: product,
  });

  await docClient.send(command);
  return product;
}

/**
 * Update an existing product in Tabla_Productos.
 * Only updates the fields provided in data.
 * @param {string} productId
 * @param {object} data - Fields to update
 * @returns {Promise<object>} The updated product attributes
 * @throws {object} Error with statusCode 404 if product not found
 * @throws {object} Error with statusCode 400 if validation fails
 */
async function update(productId, data) {
  // Check product exists
  const existing = await getById(productId);
  if (!existing) {
    const error = new Error('Producto no encontrado');
    error.statusCode = 404;
    throw error;
  }

  const errors = validateProductData(data, true);
  if (errors.length > 0) {
    const error = new Error('Datos inválidos');
    error.statusCode = 400;
    error.details = errors;
    throw error;
  }

  const now = new Date().toISOString();
  const allowedFields = ['name', 'description', 'price', 'stock', 'imageUrl'];

  const expressionParts = [];
  const expressionAttributeNames = {};
  const expressionAttributeValues = {};

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      const value = typeof data[field] === 'string' ? data[field].trim() : data[field];
      expressionParts.push(`#${field} = :${field}`);
      expressionAttributeNames[`#${field}`] = field;
      expressionAttributeValues[`:${field}`] = value;
    }
  }

  // Always update updatedAt
  expressionParts.push('#updatedAt = :updatedAt');
  expressionAttributeNames['#updatedAt'] = 'updatedAt';
  expressionAttributeValues[':updatedAt'] = now;

  const command = new UpdateCommand({
    TableName: PRODUCTS_TABLE_NAME,
    Key: { productId },
    UpdateExpression: `SET ${expressionParts.join(', ')}`,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: 'ALL_NEW',
  });

  const result = await docClient.send(command);
  return result.Attributes;
}

/**
 * Soft delete a product by setting active = false.
 * @param {string} productId
 * @returns {Promise<object>} The updated product attributes
 * @throws {object} Error with statusCode 404 if product not found
 */
async function softDelete(productId) {
  // Check product exists
  const existing = await getById(productId);
  if (!existing) {
    const error = new Error('Producto no encontrado');
    error.statusCode = 404;
    throw error;
  }

  const now = new Date().toISOString();

  const command = new UpdateCommand({
    TableName: PRODUCTS_TABLE_NAME,
    Key: { productId },
    UpdateExpression: 'SET #active = :active, #updatedAt = :updatedAt',
    ExpressionAttributeNames: {
      '#active': 'active',
      '#updatedAt': 'updatedAt',
    },
    ExpressionAttributeValues: {
      ':active': false,
      ':updatedAt': now,
    },
    ReturnValues: 'ALL_NEW',
  });

  const result = await docClient.send(command);
  return result.Attributes;
}

module.exports = {
  validateProductData,
  getAllActive,
  getById,
  create,
  update,
  softDelete,
};
