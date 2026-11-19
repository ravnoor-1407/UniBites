const mongoose = require('mongoose');

const seatingSchema = new mongoose.Schema(
  {
    outlet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Outlet',
      required: true,
      unique: true,
    },
    totalSeats: {
      type: Number,
      required: true,
      default: 40,
    },
    occupiedSeats: {
      type: Number,
      required: true,
      default: 0,
    },
    availableSeats: {
      type: Number,
      required: true,
      default: 40,
    },
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save calculate available seats
seatingSchema.pre('save', function (next) {
  this.availableSeats = Math.max(0, this.totalSeats - this.occupiedSeats);
  next();
});

const Seating = mongoose.model('Seating', seatingSchema);
module.exports = Seating;
