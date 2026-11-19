const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your full name'],
      trim: true,
      maxlength: [60, 'Name cannot exceed 60 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false, // Do not return password by default in queries
    },
    role: {
      type: String,
      enum: {
        values: ['student', 'vendor', 'admin'],
        message: '{VALUE} is not a supported role',
      },
      default: 'student',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    studentDetails: {
      rollNumber: { type: String, trim: true, default: '' },
      department: { type: String, trim: true, default: 'Computer Science & Engineering' },
      year: { type: String, trim: true, default: '3rd Year' },
    },
    vendorDetails: {
      outletId: { type: mongoose.Schema.Types.ObjectId, ref: 'Outlet' },
      outletName: { type: String, trim: true, default: '' },
    },
  },
  {
    timestamps: true,
  }
);

// Encrypt password before saving using bcrypt
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
