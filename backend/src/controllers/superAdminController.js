const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

/**
 * Login Super Admin
 */
const loginSuperAdmin = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        error: 'Password is required'
      });
    }

    const correctPassword = process.env.SUPER_ADMIN_PASSWORD;

    if (!correctPassword) {
      console.error('SUPER_ADMIN_PASSWORD not configured in environment variables');
      return res.status(500).json({
        success: false,
        error: 'Server configuration error. Please contact administrator.'
      });
    }

    // Compare passwords (using bcrypt for security, but can also use direct comparison for simplicity)
    // For better security, store hashed password in env and use bcrypt.compare
    // For now, using direct comparison as password is in env
    if (password !== correctPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid password'
      });
    }

    // Generate JWT token for super admin
    const token = jwt.sign(
      { 
        superAdmin: true,
        type: 'super_admin',
        timestamp: Date.now()
      },
      process.env.SUPER_ADMIN_JWT_SECRET || process.env.JWT_SECRET,
      { expiresIn: process.env.SUPER_ADMIN_TOKEN_EXPIRES_IN || '8h' }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      expiresIn: process.env.SUPER_ADMIN_TOKEN_EXPIRES_IN || '8h'
    });
  } catch (error) {
    console.error('Super admin login error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during login'
    });
  }
};

/**
 * Verify Super Admin Token
 */
const verifyToken = async (req, res) => {
  try {
    // If middleware passed, token is valid
    res.status(200).json({
      success: true,
      message: 'Token is valid',
      authenticated: true
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }
};

module.exports = {
  loginSuperAdmin,
  verifyToken
};

