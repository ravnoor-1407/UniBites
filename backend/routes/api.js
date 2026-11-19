const express = require('express');
const router = express.Router();
const {
  getFoodCourts,
  getAllOutlets,
  getOutletById,
  updateItemStock,
  pauseOutlet,
  resumeOutlet,
  updateSeats,
  getCanteenSeats,
  holdCanteenSeats,
  releaseCanteenSeats,
} = require('../controllers/outletController');
const {
  createGroup,
  getGroupByCode,
  addItemToGroup,
} = require('../controllers/groupController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public Food Discovery
router.get('/food-courts', getFoodCourts);
router.get('/outlets', getAllOutlets);
router.get('/outlets/:id', getOutletById);

// Academic Canteen BookMyShow-style Seat Map
router.get('/canteen/seats/:id', getCanteenSeats);
router.post('/canteen/seats/hold', holdCanteenSeats);
router.post('/canteen/seats/release', releaseCanteenSeats);

// Group Ordering
router.post('/groups/create', createGroup);
router.get('/groups/:code', getGroupByCode);
router.post('/groups/:code/item', addItemToGroup);

// Vendor Protected Actions
router.patch('/vendor/items/:id/stock', protect, authorize('vendor'), updateItemStock);
router.post('/vendor/pause', protect, authorize('vendor'), pauseOutlet);
router.post('/vendor/resume', protect, authorize('vendor'), resumeOutlet);
router.patch('/vendor/seats', protect, authorize('vendor'), updateSeats);

module.exports = router;
