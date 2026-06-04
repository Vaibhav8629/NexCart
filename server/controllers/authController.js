const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const SALT_ROUNDS = 10;

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const getClientUrl = () => (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');

const createAuthToken = (user) =>
  jwt.sign(
    { id: user._id.toString(), email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

const createUserResponse = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
  avatar: user.avatar || null,
  authProvider: user.authProvider || 'local',
  created_at: user.createdAt,
});

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const normalizedName = name?.trim();
    const normalizedEmail = email?.trim().toLowerCase();
    const normalizedRole = role?.trim().toLowerCase() || 'user';

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

    if (!['user', 'admin'].includes(normalizedRole)) {
      return res.status(400).json({
        success: false,
        message: 'Role must be either user or admin.',
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
      role: normalizedRole,
      authProvider: 'local',
    });

    const token = createAuthToken(user);

    return res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      token,
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

    if (user.authProvider === 'google' && !user.password) {
      return res.status(401).json({
        success: false,
        message: 'This account uses Google sign-in. Please continue with Google.',
      });
    }

    if (!user.password) {
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

    const token = createAuthToken(user);

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

    const user = await User.findById(userId).select('name email role avatar authProvider createdAt');

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

const updateProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { name } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ success: false, message: 'Name is required.' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { name: name.trim() },
      { new: true, runValidators: true }
    ).select('name email role createdAt');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: createUserResponse(user),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error while updating profile.' });
  }
};

const changePassword = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current and new passwords are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    if (user.authProvider === 'google' && !user.password) {
      return res.status(400).json({
        success: false,
        message: 'Google accounts do not use passwords.',
      });
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
    }

    user.password = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await user.save();

    return res.status(200).json({ success: true, message: 'Password changed successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error while changing password.' });
  }
};

const googleCallback = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.redirect(`${getClientUrl()}/login?oauth=error`);
    }

    const token = createAuthToken(user);
    const userPayload = encodeURIComponent(JSON.stringify(createUserResponse(user)));
    const redirectUrl = new URL('/auth/google/callback', getClientUrl());
    redirectUrl.hash = `token=${encodeURIComponent(token)}&user=${userPayload}`;

    return res.redirect(redirectUrl.toString());
  } catch (error) {
    return res.redirect(`${getClientUrl()}/login?oauth=error`);
  }
};

module.exports = {
  register,
  login,
  profile,
  updateProfile,
  changePassword,
  logout,
  googleCallback,
};
