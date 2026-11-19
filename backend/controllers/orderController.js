const db = require('../data/fileDb');
const { emitNewOrder, emitOrderUpdate } = require('../sockets/socketHandler');

// Valid state transitions for order lifecycle
const validTransitions = {
  Placed: ['Accepted', 'Rejected'],
  Accepted: ['Preparing', 'Rejected'],
  Preparing: ['Ready for Pickup', 'Rejected'],
  'Ready for Pickup': ['Collected'],
  Collected: [],
  Rejected: [],
};

// @desc    Place a new advance food order
// @route   POST /api/orders
// @access  Protected / Public
const createOrder = (req, res) => {
  const { 
    outletId, 
    items, 
    diningMode, 
    pickupSlot, 
    paymentMethod,
    studentName, 
    studentRoll,
    studentPhone,
    isGroupOrder,
    groupCode,
    selectedSeats,
  } = req.body;

  if (!outletId) {
    return res.status(400).json({
      success: false,
      message: 'Outlet ID is required.',
    });
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Cannot place an empty order. Please add dishes to your basket.',
    });
  }

  const outlet = db.findOutlet(outletId);
  if (!outlet) {
    return res.status(404).json({
      success: false,
      message: `Outlet '${outletId}' does not exist.`,
    });
  }

  // Check if outlet is paused
  if (outlet.isPaused) {
    return res.status(400).json({
      success: false,
      message: `Orders are temporarily paused for ${outlet.name}. Please check back shortly.`,
    });
  }

  // Server-side validation of menu items, availability and authoritative pricing
  const validatedItems = [];
  let calculatedSubtotal = 0;
  let maxPrepMins = 5;

  for (const requested of items) {
    const targetId = requested.id || requested.dishId;
    const dish = db.findMenuItem(targetId);
    if (!dish) {
      return res.status(400).json({
        success: false,
        message: `Dish '${requested.name || targetId}' is not in the menu.`,
      });
    }

    if (dish.outletId !== outletId) {
      return res.status(400).json({
        success: false,
        message: `Dish '${dish.name}' belongs to a different outlet. Cart can only contain items from one outlet at a time.`,
      });
    }

    if (dish.isAvailable === false) {
      return res.status(400).json({
        success: false,
        message: `Dish '${dish.name}' is currently sold out and unavailable to order.`,
      });
    }

    const qty = Math.max(1, parseInt(requested.quantity || 1, 10));
    calculatedSubtotal += dish.price * qty;
    if (dish.prepMins > maxPrepMins) {
      maxPrepMins = dish.prepMins;
    }

    validatedItems.push({
      id: dish.id,
      name: dish.name,
      price: dish.price,
      quantity: qty,
      isVeg: dish.isVeg,
      prepMins: dish.prepMins,
      addedBy: requested.addedBy || studentName || 'Student',
    });
  }

  const platformFee = 5;
  const totalAmount = calculatedSubtotal + platformFee;

  const roll = req.user?.rollNumber || studentRoll || '12204891';
  const name = req.user?.name || studentName || 'Aarav Sharma';
  const phone = req.user?.phone || studentPhone || '9876543210';

  const orderData = {
    outletId,
    outletName: outlet.name,
    studentRoll: roll,
    studentName: name,
    studentPhone: phone,
    items: validatedItems,
    subtotal: calculatedSubtotal,
    platformFee,
    totalAmount,
    diningMode: diningMode || 'Takeaway',
    pickupSlot: pickupSlot || 'Immediate (~10 mins)',
    paymentMethod: paymentMethod === 'Pay at pickup' ? 'Pay at pickup' : 'UPI (Simulated)',
    paymentStatus: paymentMethod === 'Pay at pickup' ? 'Unpaid' : 'Paid',
    isGroupOrder: Boolean(isGroupOrder),
    groupCode: groupCode || null,
    selectedSeats: selectedSeats || [],
    prepMins: maxPrepMins,
  };

  const newOrder = db.createOrder(orderData);

  // Emit real-time events via Socket.IO
  emitNewOrder(outletId, newOrder);
  emitOrderUpdate(newOrder.id, newOrder);

  res.status(201).json({
    success: true,
    message: 'Order placed successfully! Present your token at the express counter.',
    data: newOrder,
  });
};

// @desc    Get orders (scoped to authenticated role)
// @route   GET /api/orders
// @access  Protected / Public
const getOrders = (req, res) => {
  const { outletId, studentRoll, status } = req.query;

  // If vendor is logged in, restrict STRICTLY to their assigned outlet
  if (req.user && req.user.role === 'vendor') {
    const vendorOutletId = req.user.outletId;
    if (!vendorOutletId) {
      return res.status(403).json({
        success: false,
        message: 'No outlet assigned to this vendor account.',
      });
    }
    const orders = db.getOrders({ outletId: vendorOutletId, status });
    return res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  }

  // If student is logged in, show their orders
  const roll = req.user?.rollNumber || studentRoll;
  const filter = {};
  if (roll) filter.studentRoll = roll;
  if (outletId) filter.outletId = outletId;
  if (status) filter.status = status;

  const orders = db.getOrders(filter);
  res.status(200).json({
    success: true,
    count: orders.length,
    data: orders,
  });
};

// @desc    Get single order by ID or Token
// @route   GET /api/orders/:id
// @access  Public / Protected
const getOrderById = (req, res) => {
  const { id } = req.params;
  const order = db.findOrder(id);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: `Order with ID or Token '${id}' was not found.`,
    });
  }

  res.status(200).json({
    success: true,
    data: order,
  });
};

// @desc    Vendor updates order status
// @route   PATCH /api/orders/:id/status
// @access  Protected (Vendor)
const updateOrderStatus = (req, res) => {
  const { id } = req.params;
  const { status, rejectReason } = req.body;

  const order = db.findOrder(id);
  if (!order) {
    return res.status(404).json({
      success: false,
      message: `Order '${id}' not found.`,
    });
  }

  // Vendor ownership check
  if (req.user && req.user.role === 'vendor' && req.user.outletId && req.user.outletId !== order.outletId) {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: You cannot modify orders for another outlet.',
    });
  }

  // Validate state transitions
  const allowedNext = validTransitions[order.status] || [];
  if (!allowedNext.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Invalid state transition: Cannot transition from '${order.status}' to '${status}'. Allowed: ${allowedNext.join(', ')}`,
    });
  }

  if (status === 'Rejected' && !rejectReason) {
    return res.status(400).json({
      success: false,
      message: 'A brief rejection reason is required when rejecting an order.',
    });
  }

  const updates = {
    status,
    updatedAt: new Date().toISOString(),
  };

  if (rejectReason) updates.rejectReason = rejectReason;
  if (status === 'Ready for Pickup') {
    updates.readyAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  if (status === 'Collected') {
    updates.collectedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    updates.paymentStatus = 'Paid';
  }

  const updatedOrder = db.updateOrder(order.id, updates);

  // Broadcast update via Socket.IO
  emitOrderUpdate(order.id, updatedOrder);

  res.status(200).json({
    success: true,
    message: `Order ${order.token} status updated to '${status}'`,
    data: updatedOrder,
  });
};

// @desc    Vendor verifies pickup token (UB-xxx) or scannable QR
// @route   POST /api/orders/:id/verify-token
// @access  Protected (Vendor)
const verifyPickupToken = (req, res) => {
  const { token } = req.body;
  const vendorOutletId = req.user?.outletId;

  if (!token) {
    return res.status(400).json({
      success: false,
      message: 'Please enter a token number.',
    });
  }

  const normalized = token.trim().toUpperCase();
  const order = db.findOrder(normalized);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: `No order found matching token '${normalized}'. Please re-check the number.`,
    });
  }

  // Check if order belongs to vendor's outlet
  if (vendorOutletId && order.outletId !== vendorOutletId) {
    return res.status(403).json({
      success: false,
      message: `Token '${normalized}' belongs to ${order.outletName}, not your outlet.`,
    });
  }

  res.status(200).json({
    success: true,
    message: `Token verified successfully for ${order.studentName}`,
    data: order,
  });
};

// @desc    Vendor collects payment and completes order handover
// @route   POST /api/orders/:id/payment
// @access  Protected (Vendor)
const collectPaymentAndHandover = (req, res) => {
  const { id } = req.params;
  const { paymentMethodReceived } = req.body; // 'Cash' | 'UPI'

  const order = db.findOrder(id);
  if (!order) {
    return res.status(404).json({
      success: false,
      message: `Order '${id}' not found.`,
    });
  }

  if (req.user && req.user.role === 'vendor' && req.user.outletId && req.user.outletId !== order.outletId) {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: You cannot handle orders for another outlet.',
    });
  }

  const updatedOrder = db.updateOrder(order.id, {
    paymentStatus: 'Paid',
    paymentMethodReceived: paymentMethodReceived || 'Cash',
    status: 'Collected',
    collectedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  });

  emitOrderUpdate(order.id, updatedOrder);

  res.status(200).json({
    success: true,
    message: `Payment collected (₹${order.totalAmount}). Order handed over to student.`,
    data: updatedOrder,
  });
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  verifyPickupToken,
  collectPaymentAndHandover,
};
