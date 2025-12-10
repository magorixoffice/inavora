const jwt = require('jsonwebtoken');
const admin = require('firebase-admin');
const User = require('../models/User');
const initializeFirebase = require('../config/firebase');

// Ensure Firebase Admin is initialized
if (!admin.apps.length) {
  try {
    initializeFirebase();
  } catch (e) {
    console.error('Failed to initialize Firebase Admin in authController:', e.message);
  }
}

/**
 * Generate JWT token
 */
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

/**
 * Register/Login with Firebase token
 * Frontend sends Firebase ID token, backend verifies it and returns JWT
 */
const authenticateWithFirebase = async (req, res) => {
  try {
    const { firebaseToken } = req.body;

    if (!firebaseToken) {
      return res.status(400).json({ error: 'Firebase token is required.' });
    }

    // Verify Firebase token
    const decodedToken = await admin.auth().verifyIdToken(firebaseToken);
    const { uid, email, name, picture } = decodedToken;

    // Get full user record from Firebase to get displayName
    const firebaseUser = await admin.auth().getUser(uid);
    const displayName = firebaseUser.displayName || name || 'Anonymous User';

    // Check if user exists by firebaseUid
    let user = await User.findOne({ firebaseUid: uid });

    if (!user) {
      // Check if email already exists (user registered with email/password)
      const existingUser = await User.findOne({ email: email });

      if (existingUser) {
        // Link Firebase UID to existing user
        existingUser.firebaseUid = uid;
        if (!existingUser.displayName || existingUser.displayName === 'Anonymous User') {
          existingUser.displayName = displayName;
        }
        if (!existingUser.photoURL && picture) {
          existingUser.photoURL = picture;
        }
        await existingUser.save();
        user = existingUser;
      } else {
        // Create new user
        user = new User({
          firebaseUid: uid,
          email: email || `${uid}@firebase.user`,
          displayName: displayName,
          photoURL: picture || firebaseUser.photoURL || null
        });
        await user.save();
      }
    } else {
      // Update displayName if it was Anonymous User
      if ((!user.displayName || user.displayName === 'Anonymous User') && displayName !== 'Anonymous User') {
        user.displayName = displayName;
        await user.save();
      }
    }

    // Generate JWT token
    const token = generateToken(user._id);

    res.status(200).json({
      message: 'Authentication successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        subscription: user.subscription
      }
    });
  } catch (error) {
    console.error('Firebase auth error:', error);

    // Handle Firebase errors
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({ error: 'Firebase token expired. Please sign in again.' });
    }
    if (error.code === 'auth/argument-error') {
      return res.status(400).json({ error: 'Invalid Firebase token format.' });
    }

    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      if (error.keyPattern?.email) {
        return res.status(409).json({ error: 'This email is already registered. Please sign in instead.' });
      }
      return res.status(409).json({ error: 'Account already exists. Please sign in.' });
    }

    // Generic error
    res.status(500).json({
      error: 'Authentication failed. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get current user info
 */
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-__v');

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.status(200).json({
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        subscription: user.subscription,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user data.' });
  }
};

/**
 * Refresh JWT token
 */
const refreshToken = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      message: 'Token refreshed successfully',
      token
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ error: 'Failed to refresh token.' });
  }
};

module.exports = {
  authenticateWithFirebase,
  getCurrentUser,
  refreshToken
};
