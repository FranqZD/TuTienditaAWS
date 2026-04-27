// Load dotenv for local development (not needed in production)
try {
  const dotenv = require('dotenv');
  dotenv.config();
} catch {
  // dotenv not available in production — that's fine
}

const env = {
  AWS_REGION: process.env.AWS_REGION || 'us-east-1',
  PRODUCTS_TABLE_NAME: process.env.PRODUCTS_TABLE_NAME || 'Tabla_Productos',
  ORDERS_TABLE_NAME: process.env.ORDERS_TABLE_NAME || 'Tabla_Ordenes',
  LAMBDA_FUNCTION_NAME: process.env.LAMBDA_FUNCTION_NAME || 'Lambda_Checkout',
  PORT: parseInt(process.env.PORT, 10) || 3000,
};

module.exports = env;
