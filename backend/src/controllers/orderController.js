const orderService = require('../services/orderService');

/**
 * POST /api/orders/checkout — Process a simulated purchase
 */
const checkout = async (req, res) => {
  const { items } = req.body;

  // Validate that items exists and is a non-empty array
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'El carrito no puede estar vacío' });
  }

  try {
    const lambdaResponse = await orderService.processCheckout(items);

    if (lambdaResponse.statusCode === 200) {
      return res.status(200).json(lambdaResponse.body);
    }

    if (lambdaResponse.statusCode === 400) {
      return res.status(400).json(lambdaResponse.body);
    }

    // Any other non-200/400 status from Lambda is treated as a server error
    return res.status(500).json({ error: 'Error al procesar la orden' });
  } catch (err) {
    console.error('Error al invocar Lambda de checkout:', err);
    return res.status(500).json({ error: 'Error al procesar la orden' });
  }
};

module.exports = { checkout };
