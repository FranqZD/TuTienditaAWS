const { ScanCommand } = require('@aws-sdk/lib-dynamodb');
const { docClient, ORDERS_TABLE_NAME } = require('../config/dynamodb');
const lambdaService = require('./lambdaService');

/**
 * Get all orders from Tabla_Ordenes.
 * Maps each order to include itemCount and sorts by createdAt descending.
 * @returns {Promise<object[]>} Array of orders sorted by createdAt desc
 */
async function getAllOrders() {
  const command = new ScanCommand({
    TableName: ORDERS_TABLE_NAME,
  });

  const result = await docClient.send(command);

  const orders = (result.Items || [])
    .map(order => ({
      ...order,
      itemCount: order.items ? order.items.length : 0,
    }))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return orders;
}

/**
 * Process a checkout by invoking the Lambda_Checkout function.
 * @param {Array} cartItems - Array of { productId, quantity } objects
 * @returns {Promise<object>} Lambda response with statusCode and body
 */
async function processCheckout(cartItems) {
  const response = await lambdaService.invokeCheckout({ items: cartItems });
  return response;
}

module.exports = { getAllOrders, processCheckout };
