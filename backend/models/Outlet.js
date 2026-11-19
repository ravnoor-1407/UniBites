const mongoose = require('mongoose');

const outletSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide outlet name'],
      unique: true,
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please specify food category'],
      trim: true,
    },
    tagline: {
      type: String,
      trim: true,
      default: '',
    },
    coverImage: {
      type: String,
      default: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80',
    },
    location: {
      type: String,
      required: [true, 'Please provide outlet campus location'],
      trim: true,
    },
    openingHours: {
      type: String,
      default: '08:00 AM - 08:30 PM',
    },
    isOpen: {
      type: Boolean,
      default: true,
    },
    avgPrepTime: {
      type: Number,
      default: 10, // Minutes
    },
    currentQueueLoad: {
      type: String,
      enum: ['Low', 'Moderate', 'High'],
      default: 'Low',
    },
    activeOrders: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 4.5,
      min: 1,
      max: 5,
    },
    reviewsCount: {
      type: Number,
      default: 0,
    },
    seating: {
      total: { type: Number, default: 40 },
      occupied: { type: Number, default: 0 },
      available: { type: Number, default: 40 },
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Indexing for search optimization
outletSchema.index({ name: 'text', category: 'text', location: 'text' });

const Outlet = mongoose.model('Outlet', outletSchema);
module.exports = Outlet;
