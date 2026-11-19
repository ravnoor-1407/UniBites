const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../data/fileDb');

const JWT_SECRET = process.env.JWT_SECRET || 'unibites_secret_jwt_key_2026';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRE }
  );
};

// @desc    Sign in user (Roll number or email + password, role auto-detected)
// @route   POST /api/auth/login
// @access  Public
const login = (req, res) => {
  const { identifier, rollNumberOrEmail, password } = req.body;
  const loginId = identifier || rollNumberOrEmail;

  if (!loginId || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide roll number or email, and password.',
    });
  }

  const user = db.findUserByRollOrEmail(loginId);
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials. User not found.',
    });
  }

  const isMatch = bcrypt.compareSync(password, user.password);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials. Incorrect password.',
    });
  }

  const token = generateToken(user);
  const { password: _, ...safeUser } = user;

  res.status(200).json({
    success: true,
    message: 'Signed in successfully',
    token,
    user: safeUser,
  });
};

// @desc    Register a new student
// @route   POST /api/auth/register
// @access  Public
const register = (req, res) => {
  const { name, rollNumber, email, password, phone } = req.body;

  if (!name || !rollNumber || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide name, roll number, email and password.',
    });
  }

  const existing = db.findUserByRollOrEmail(rollNumber) || db.findUserByRollOrEmail(email);
  if (existing) {
    return res.status(400).json({
      success: false,
      message: 'An account with this roll number or email already exists.',
    });
  }

  const passwordHash = bcrypt.hashSync(password, 8);
  const newUser = db.createUser({
    name: name.trim(),
    rollNumber: rollNumber.trim().toUpperCase(),
    email: email.trim().toLowerCase(),
    phone: phone || '',
    password: passwordHash,
    role: 'student',
  });

  const token = generateToken(newUser);
  const { password: _, ...safeUser } = newUser;

  res.status(201).json({
    success: true,
    message: 'Student account created successfully',
    token,
    user: safeUser,
  });
};

// @desc    Get current authenticated user info
// @route   GET /api/auth/me
// @access  Protected
const getMe = (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
};

module.exports = {
  login,
  register,
  getMe,
};
