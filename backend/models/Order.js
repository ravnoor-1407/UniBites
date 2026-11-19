const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  foodItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FoodItem',
    required: true,
  },
  name: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
});

const orderSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    studentName: { type: String, default: '' },
    studentRoll: { type: String, default: '' },
    outlet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Outlet',
      required: true,
    },
    outletName: { type: String, default: '' },
    items: [orderItemSchema],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Preparing', 'Ready for Pickup', 'Completed', 'Rejected'],
      default: 'Pending',
      index: true,
    },
    pickupTime: {
      type: String,
      required: true,
    },
    estimatedMinutesRemaining: {
      type: Number,
      default: 10,
    },
    ordersAhead: {
      type: Number,
      default: 0,
    },
    rejectionReason: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for querying student orders and outlet kitchen queue efficiently
orderSchema.index({ student: 1, createdAt: -1 });
orderSchema.index({ outlet: 1, status: 1 });

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
