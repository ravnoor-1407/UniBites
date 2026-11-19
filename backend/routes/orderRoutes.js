const express = require('express');
const router = express.Router();
const { 
  createOrder, 
  getOrders, 
  getOrderById, 
  updateOrderStatus, 
  verifyPickupToken, 
  collectPaymentAndHandover 
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Student & public endpoints
router.post('/', createOrder);
router.get('/', protect, getOrders);
router.get('/:id', getOrderById);

// Vendor endpoints (strict role checks)
router.patch('/:id/status', protect, authorize('vendor'), updateOrderStatus);
router.post('/:id/verify-token', protect, authorize('vendor'), verifyPickupToken);
router.post('/:id/payment', protect, authorize('vendor'), collectPaymentAndHandover);

module.exports = router;
