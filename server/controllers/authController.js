const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const SALT_ROUNDS = 10;

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const createUserResponse = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
  created_at: user.createdAt,
});

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const normalizedName = name?.trim();
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedName || !normalizedEmail || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.',
      });
    }

    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    const existingUser = await User.findOne({ email: normalizedEmail }).select('_id');

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email is already registered.',
      });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({
      name: normalizedName,
      email: normalizedEmail,
      password: hashedPassword,
    });

    return res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      user: createUserResponse(user),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error during registration.',
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const token = jwt.sign(
      { id: user._id.toString(), email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: createUserResponse(user),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error during login.',
    });
  }
};

const profile = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized.',
      });
    }

    const user = await User.findById(userId).select('name email role createdAt');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Profile fetched successfully.',
      user: createUserResponse(user),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching profile.',
    });
  }
};

const logout = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Logout successful. Remove the token from localStorage on the frontend.',
  });
};

module.exports = {
  register,
  login,
  profile,
  logout,
};
