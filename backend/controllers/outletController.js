const db = require('../data/fileDb');
const { getWalkingTime } = require('../utils/distanceMatrix');
const { 
  emitStockUpdate, 
  emitOutletStatus, 
  emitSeatsUpdate 
} = require('../sockets/socketHandler');

// @desc    Get all campus food courts / zones
// @route   GET /api/food-courts
// @access  Public
const getFoodCourts = (req, res) => {
  const courts = db.getFoodCourts();
  res.status(200).json({
    success: true,
    count: courts.length,
    data: courts,
  });
};

// @desc    Get all campus outlets with live status and optional walking times
// @route   GET /api/outlets
// @access  Public
const getAllOutlets = (req, res) => {
  const { category, search, location } = req.query;
  let outlets = db.getOutlets();

  if (category && category !== 'All') {
    outlets = outlets.filter(o => 
      (o.category && o.category.toLowerCase().includes(category.toLowerCase())) ||
      (o.cuisine && o.cuisine.toLowerCase().includes(category.toLowerCase()))
    );
  }

  if (search) {
    const q = search.toLowerCase();
    outlets = outlets.filter(o =>
      o.name.toLowerCase().includes(q) ||
      o.location.toLowerCase().includes(q) ||
      (o.cuisine && o.cuisine.toLowerCase().includes(q))
    );
  }

  // Attach dynamic walking times from selected location
  const enriched = outlets.map(o => {
    const walkMins = location ? getWalkingTime(location, o.campusSpot) : 5;
    return {
      ...o,
      walkMins,
      // Queue status text
      queueStatus: o.queueCount <= 4 ? 'Low' : o.queueCount <= 9 ? 'Medium' : 'High',
    };
  });

  res.status(200).json({
    success: true,
    count: enriched.length,
    data: enriched,
  });
};

// @desc    Get single outlet by ID with full menu and seat info
// @route   GET /api/outlets/:id
// @access  Public
const getOutletById = (req, res) => {
  const { id } = req.params;
  const { location } = req.query;
  const outlet = db.findOutlet(id);

  if (!outlet) {
    return res.status(404).json({
      success: false,
      message: `Outlet with ID '${id}' not found`,
    });
  }

  const menu = db.getMenuItems(id);
  const walkMins = location ? getWalkingTime(location, outlet.campusSpot) : 5;

  // Active seat holds
  const holds = db.getSeatHolds(id);
  const heldCount = holds.reduce((acc, h) => acc + (h.seatIds ? h.seatIds.length : 1), 0);
  const effectiveOccupied = Math.min(outlet.totalSeats, (outlet.occupiedSeats || 0) + heldCount);
  const seatsFree = Math.max(0, outlet.totalSeats - effectiveOccupied);

  res.status(200).json({
    success: true,
    data: {
      ...outlet,
      walkMins,
      queueStatus: outlet.queueCount <= 4 ? 'Low' : outlet.queueCount <= 9 ? 'Medium' : 'High',
      seatsFree,
      menu,
    },
  });
};

// @desc    Vendor toggles food item stock (Available vs Finished for today)
// @route   PATCH /api/vendor/items/:id/stock
// @access  Protected (Vendor)
const updateItemStock = (req, res) => {
  const { id } = req.params;
  const { isAvailable } = req.body;

  const item = db.findMenuItem(id);
  if (!item) {
    return res.status(404).json({
      success: false,
      message: `Menu item '${id}' not found`,
    });
  }

  // Security check: Vendor can only modify items in their own outlet
  if (req.user.role === 'vendor' && req.user.outletId && req.user.outletId !== item.outletId) {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: You cannot modify dishes for another outlet.',
    });
  }

  const updated = db.updateMenuItem(id, {
    isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : !item.isAvailable,
  });

  emitStockUpdate(item.outletId, updated);

  res.status(200).json({
    success: true,
    message: `Dish availability updated to ${updated.isAvailable ? 'Available' : 'Sold out'}`,
    data: updated,
  });
};

// @desc    Vendor pauses incoming orders (15m, 30m, 60m, or indefinite)
// @route   POST /api/vendor/pause
// @access  Protected (Vendor)
const pauseOutlet = (req, res) => {
  const outletId = req.user.outletId || req.body.outletId;
  const { durationMinutes } = req.body; // e.g. 15, 30, 60 or null

  if (!outletId) {
    return res.status(400).json({
      success: false,
      message: 'Outlet ID required.',
    });
  }

  const outlet = db.findOutlet(outletId);
  if (!outlet) {
    return res.status(404).json({
      success: false,
      message: `Outlet '${outletId}' not found.`,
    });
  }

  let pausedUntil = null;
  if (durationMinutes && Number(durationMinutes) > 0) {
    pausedUntil = Date.now() + Number(durationMinutes) * 60 * 1000;
  }

  const updated = db.updateOutlet(outletId, {
    isPaused: true,
    pausedUntil,
  });

  emitOutletStatus(outletId, updated);

  res.status(200).json({
    success: true,
    message: `Orders paused for ${outlet.name}${durationMinutes ? ` for ${durationMinutes} minutes` : ''}`,
    data: updated,
  });
};

// @desc    Vendor resumes incoming orders
// @route   POST /api/vendor/resume
// @access  Protected (Vendor)
const resumeOutlet = (req, res) => {
  const outletId = req.user.outletId || req.body.outletId;

  if (!outletId) {
    return res.status(400).json({
      success: false,
      message: 'Outlet ID required.',
    });
  }

  const updated = db.updateOutlet(outletId, {
    isPaused: false,
    pausedUntil: null,
  });

  emitOutletStatus(outletId, updated);

  res.status(200).json({
    success: true,
    message: 'Orders resumed successfully.',
    data: updated,
  });
};

// @desc    Vendor updates occupied seat counter for academic canteens
// @route   PATCH /api/vendor/seats
// @access  Protected (Vendor)
const updateSeats = (req, res) => {
  const outletId = req.user.outletId || req.body.outletId;
  const { delta, occupiedSeats } = req.body;

  const outlet = db.findOutlet(outletId);
  if (!outlet || !outlet.isAcademicCanteen) {
    return res.status(400).json({
      success: false,
      message: 'Seat management is only available for academic block canteens.',
    });
  }

  let newCount = outlet.occupiedSeats || 0;
  if (occupiedSeats !== undefined) {
    newCount = Number(occupiedSeats);
  } else if (delta !== undefined) {
    newCount += Number(delta);
  }

  newCount = Math.max(0, Math.min(outlet.totalSeats, newCount));

  const updated = db.updateOutlet(outletId, { occupiedSeats: newCount });
  const seatsFree = Math.max(0, updated.totalSeats - newCount);

  emitSeatsUpdate(outletId, { outletId, occupiedSeats: newCount, seatsFree });

  res.status(200).json({
    success: true,
    message: 'Seat count updated',
    data: {
      outletId,
      totalSeats: updated.totalSeats,
      occupiedSeats: newCount,
      seatsFree,
    },
  });
};

// @desc    Get BookMyShow-style seat map for academic canteens (70-100 seats)
// @route   GET /api/canteen/seats/:id
// @access  Public
const getCanteenSeats = (req, res) => {
  const { id } = req.params;
  const outlet = db.findOutlet(id);

  if (!outlet || !outlet.isAcademicCanteen) {
    return res.status(400).json({
      success: false,
      message: 'Seat map is only available for academic block canteens (e.g., Block 14 MSB).',
    });
  }

  const totalSeats = outlet.totalSeats || 100;
  const occupiedCount = outlet.occupiedSeats || 42;
  const activeHolds = db.getSeatHolds(id);
  const heldSeatIds = new Set();
  activeHolds.forEach(h => (h.seatIds || []).forEach(s => heldSeatIds.add(s)));

  // Generate deterministic grid of tables (e.g., 20 tables of 4-5 seats = 100 seats)
  const seats = [];
  for (let i = 1; i <= totalSeats; i++) {
    const seatId = `S-${i}`;
    let status = 'vacant';
    if (heldSeatIds.has(seatId)) {
      status = 'held';
    } else if (i <= occupiedCount) {
      status = 'occupied';
    }

    seats.push({
      id: seatId,
      number: i,
      tableNumber: Math.ceil(i / 4),
      status, // 'vacant' | 'occupied' | 'held'
    });
  }

  res.status(200).json({
    success: true,
    data: {
      outletId: id,
      outletName: outlet.name,
      totalSeats,
      occupiedSeats: occupiedCount,
      heldSeats: heldSeatIds.size,
      freeSeats: Math.max(0, totalSeats - occupiedCount - heldSeatIds.size),
      lastUpdatedBy: 'Canteen Staff',
      seats,
    },
  });
};

// @desc    Hold seats for 15 minutes while student completes order
// @route   POST /api/canteen/seats/hold
// @access  Public / Protected
const holdCanteenSeats = (req, res) => {
  let { outletId, seatIds, seatId, seatNumber, studentRoll } = req.body;

  if (!seatIds) {
    if (seatId) seatIds = [seatId];
    else if (seatNumber) seatIds = [`S-${seatNumber}`];
  }

  if (!outletId || !seatIds || !seatIds.length) {
    return res.status(400).json({
      success: false,
      message: 'Please provide outletId and seatIds to hold.',
    });
  }

  const hold = db.holdSeats(outletId, seatIds, studentRoll || req.user?.rollNumber || 'GUEST');

  res.status(200).json({
    success: true,
    message: `${seatIds.length} seat(s) held for 15 minutes.`,
    data: hold,
  });
};

// @desc    Release held seats
// @route   POST /api/canteen/seats/release
// @access  Public / Protected
const releaseCanteenSeats = (req, res) => {
  const { holdId } = req.body;
  if (holdId) {
    db.releaseSeatHold(holdId);
  }
  res.status(200).json({
    success: true,
    message: 'Seat hold released.',
  });
};

module.exports = {
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
};
