const express = require('express');
const cors = require('cors');
const healthRoutes = require('./routes/healthRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();

// CORS middleware — allow GET, POST, PUT, DELETE
app.use(cors({
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

// JSON body parser
app.use(express.json());

// Routes
app.use(healthRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// Centralized error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Error interno del servidor',
  });
});

module.exports = app;
