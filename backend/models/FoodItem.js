const mongoose = require('mongoose');

const foodItemSchema = new mongoose.Schema(
  {
    outlet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Outlet',
      required: [true, 'Food item must belong to a campus outlet'],
    },
    outletName: {
      type: String,
      default: '',
    },
    name: {
      type: String,
      required: [true, 'Please provide dish name'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please provide dish category (e.g. Beverages, Meals, Snacks)'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Please specify price in INR'],
      min: [0, 'Price cannot be negative'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    isVeg: {
      type: Boolean,
      default: true,
    },
    prepTime: {
      type: Number,
      required: [true, 'Please specify average preparation time in minutes'],
      default: 8,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    image: {
      type: String,
      default: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80',
    },
    rating: {
      type: Number,
      default: 4.8,
    },
    calories: {
      type: Number,
      default: 250,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for querying dishes by outlet and category
foodItemSchema.index({ outlet: 1, category: 1 });
foodItemSchema.index({ name: 'text', description: 'text' });

const FoodItem = mongoose.model('FoodItem', foodItemSchema);
module.exports = FoodItem;
