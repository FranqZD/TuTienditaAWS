const express = require('express');
const orderController = require('../controllers/orderController');

const router = express.Router();

router.get('/', orderController.getOrders);
router.post('/checkout', orderController.checkout);

module.exports = router;
