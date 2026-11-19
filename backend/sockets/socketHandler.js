// UniBite Real-Time Socket.IO Management
let ioInstance = null;

const initSockets = (io) => {
  ioInstance = io;

  io.on('connection', (socket) => {
    // Student joins their specific order room for live tracking
    socket.on('join_order_room', (orderId) => {
      socket.join(`order_${orderId}`);
    });

    // Vendor joins their kitchen outlet room for incoming order alerts
    socket.on('join_outlet_room', (outletId) => {
      socket.join(`outlet_${outletId}`);
    });

    socket.on('disconnect', () => {});
  });
};

// Emit order status update to student and vendor
const emitOrderUpdate = (orderId, orderData) => {
  if (ioInstance) {
    ioInstance.to(`order_${orderId}`).emit('order_status_changed', orderData);
    if (orderData.outletId) {
      ioInstance.to(`outlet_${orderData.outletId}`).emit('order_status_changed', orderData);
    }
    // Also broadcast to all clients if needed
    ioInstance.emit('order_updated', orderData);
  }
};

// Emit new order placed to vendor
const emitNewOrder = (outletId, orderData) => {
  if (ioInstance) {
    ioInstance.to(`outlet_${outletId}`).emit('new_order_placed', orderData);
    ioInstance.emit('global_order_placed', { outletId, orderId: orderData.id });
  }
};

// Emit item stock change to all listeners
const emitStockUpdate = (outletId, itemData) => {
  if (ioInstance) {
    ioInstance.to(`outlet_${outletId}`).emit('item_stock_changed', itemData);
    ioInstance.emit('item_stock_changed', itemData);
  }
};

// Emit outlet pause/resume status
const emitOutletStatus = (outletId, outletData) => {
  if (ioInstance) {
    ioInstance.emit('outlet_status_changed', outletData);
  }
};

// Emit canteen seats update
const emitSeatsUpdate = (outletId, seatData) => {
  if (ioInstance) {
    ioInstance.emit('seats_updated', seatData);
  }
};

module.exports = {
  initSockets,
  emitOrderUpdate,
  emitNewOrder,
  emitStockUpdate,
  emitOutletStatus,
  emitSeatsUpdate,
};
