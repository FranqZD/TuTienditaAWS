const lambdaService = require('./lambdaService');

/**
 * Process a checkout by invoking the Lambda_Checkout function.
 * @param {Array} cartItems - Array of { productId, quantity } objects
 * @returns {Promise<object>} Lambda response with statusCode and body
 */
async function processCheckout(cartItems) {
  const response = await lambdaService.invokeCheckout({ items: cartItems });
  return response;
}

module.exports = { processCheckout };
