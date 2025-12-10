const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Institution = require('../models/Institution');
const User = require('../models/User');
const Presentation = require('../models/Presentation');
const Slide = require('../models/Slide');
const Response = require('../models/Response');

/**
 * Login Institution Admin
 */
const loginInstitutionAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    const institution = await Institution.findOne({ 
      $or: [
        { email: email.toLowerCase() },
        { adminEmail: email.toLowerCase() }
      ],
      isActive: true
    });

    if (!institution) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Compare password (using bcrypt if password is hashed, or direct comparison)
    // For now, using direct comparison. In production, passwords should be hashed
    const isPasswordValid = password === institution.password;
    
    // If password is hashed, use: const isPasswordValid = await bcrypt.compare(password, institution.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Generate JWT token for institution admin (no expiration - permanent session)
    const token = jwt.sign(
      { 
        institutionAdmin: true,
        institutionId: institution._id.toString(),
        email: institution.adminEmail,
        type: 'institution_admin',
        timestamp: Date.now()
      },
      process.env.JWT_SECRET
      // No expiresIn - token will not expire
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      institution: {
        id: institution._id,
        name: institution.name,
        email: institution.email,
        adminEmail: institution.adminEmail,
        adminName: institution.adminName
      }
    });
  } catch (error) {
    console.error('Institution admin login error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during login'
    });
  }
};

/**
 * Check if email belongs to an institution admin
 */
const checkInstitutionAdmin = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    const institution = await Institution.findOne({
      $or: [
        { email: email.toLowerCase() },
        { adminEmail: email.toLowerCase() }
      ],
      isActive: true
    }).select('_id name email adminEmail');

    if (institution) {
      return res.status(200).json({
        success: true,
        isInstitutionAdmin: true,
        institution: {
          id: institution._id,
          name: institution.name,
          email: institution.email,
          adminEmail: institution.adminEmail
        }
      });
    }

    return res.status(200).json({
      success: true,
      isInstitutionAdmin: false
    });
  } catch (error) {
    console.error('Check institution admin error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check institution admin status'
    });
  }
};

/**
 * Verify Institution Admin Token
 */
const verifyToken = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Token is valid',
      authenticated: true,
      institution: {
        id: req.institution._id,
        name: req.institution.name,
        email: req.institution.email
      }
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }
};

/**
 * Get Dashboard Statistics
 */
const getDashboardStats = async (req, res) => {
  try {
    const institutionId = req.institutionId;

    // Get all users in this institution
    const totalUsers = await User.countDocuments({ 
      institutionId,
      isInstitutionUser: true 
    });

    // Get all presentations by institution users
    const institutionUsers = await User.find({ 
      institutionId,
      isInstitutionUser: true 
    }).select('_id');

    const userIds = institutionUsers.map(user => user._id);

    const totalPresentations = await Presentation.countDocuments({ 
      userId: { $in: userIds } 
    });

    const livePresentations = await Presentation.countDocuments({ 
      userId: { $in: userIds },
      isLive: true 
    });

    // Get total slides
    const presentations = await Presentation.find({ 
      userId: { $in: userIds } 
    }).select('_id');

    const presentationIds = presentations.map(p => p._id);
    const totalSlides = await Slide.countDocuments({ 
      presentationId: { $in: presentationIds } 
    });

    // Get total responses
    const totalResponses = await Response.countDocuments({ 
      presentationId: { $in: presentationIds } 
    });

    // Get active users (users who created presentations in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const activeUsers = await Presentation.distinct('userId', {
      userId: { $in: userIds },
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Get presentations created in last 30 days
    const recentPresentations = await Presentation.countDocuments({
      userId: { $in: userIds },
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Get responses in last 30 days
    const recentResponses = await Response.countDocuments({
      presentationId: { $in: presentationIds },
      submittedAt: { $gte: thirtyDaysAgo }
    });

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalPresentations,
        livePresentations,
        totalSlides,
        totalResponses,
        activeUsers: activeUsers.length,
        recentPresentations,
        recentResponses
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard statistics'
    });
  }
};

/**
 * Get All Institution Users
 */
const getInstitutionUsers = async (req, res) => {
  try {
    const institutionId = req.institutionId;
    const { page = 1, limit = 20, search = '' } = req.query;

    const query = {
      institutionId,
      isInstitutionUser: true
    };

    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { displayName: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find(query)
      .select('-__v')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    // Get presentation count for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const presentationCount = await Presentation.countDocuments({ userId: user._id });
        const slideCount = await Slide.countDocuments({ 
          presentationId: { $in: (await Presentation.find({ userId: user._id }).select('_id')).map(p => p._id) }
        });

        return {
          id: user._id,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          subscription: user.subscription,
          presentationCount,
          slideCount,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        users: usersWithStats,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get institution users error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users'
    });
  }
};

/**
 * Add User to Institution
 */
const addInstitutionUser = async (req, res) => {
  try {
    const institutionId = req.institutionId;
    const { email, displayName } = req.body;

    if (!email || !displayName) {
      return res.status(400).json({
        success: false,
        error: 'Email and display name are required'
      });
    }

    // Check institution user limit
    const institution = await Institution.findById(institutionId);
    const currentUserCount = await User.countDocuments({ 
      institutionId,
      isInstitutionUser: true 
    });

    if (currentUserCount >= institution.subscription.maxUsers) {
      return res.status(400).json({
        success: false,
        error: `User limit reached. Maximum ${institution.subscription.maxUsers} users allowed.`
      });
    }

    // Check if user already exists
    let user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      // If user exists but not in institution, add them
      if (!user.institutionId || user.institutionId.toString() !== institutionId.toString()) {
        user.institutionId = institutionId;
        user.isInstitutionUser = true;
        user.subscription.plan = 'institution';
        user.subscription.status = 'active';
        await user.save();
      } else {
        return res.status(400).json({
          success: false,
          error: 'User already exists in this institution'
        });
      }
    } else {
      // Create new user
      user = new User({
        email: email.toLowerCase(),
        displayName: displayName.trim(),
        institutionId,
        isInstitutionUser: true,
        subscription: {
          plan: 'institution',
          status: 'active'
        }
      });
      await user.save();
    }

    // Update institution user count
    institution.subscription.currentUsers = currentUserCount + 1;
    await institution.save();

    res.status(201).json({
      success: true,
      message: 'User added successfully',
      data: {
        id: user._id,
        email: user.email,
        displayName: user.displayName
      }
    });
  } catch (error) {
    console.error('Add institution user error:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'User with this email already exists'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Failed to add user'
    });
  }
};

/**
 * Remove User from Institution
 */
const removeInstitutionUser = async (req, res) => {
  try {
    const institutionId = req.institutionId;
    const { userId } = req.params;

    const user = await User.findOne({ 
      _id: userId,
      institutionId,
      isInstitutionUser: true 
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found in this institution'
      });
    }

    // Remove user from institution
    user.institutionId = null;
    user.isInstitutionUser = false;
    user.subscription.plan = 'free';
    user.subscription.status = 'active';
    await user.save();

    // Update institution user count
    const institution = await Institution.findById(institutionId);
    institution.subscription.currentUsers = Math.max(0, institution.subscription.currentUsers - 1);
    await institution.save();

    res.status(200).json({
      success: true,
      message: 'User removed successfully'
    });
  } catch (error) {
    console.error('Remove institution user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove user'
    });
  }
};

/**
 * Get All Presentations by Institution Users
 */
const getInstitutionPresentations = async (req, res) => {
  try {
    const institutionId = req.institutionId;
    const { page = 1, limit = 20, search = '', status = 'all' } = req.query;

    // Get all institution users
    const institutionUsers = await User.find({ 
      institutionId,
      isInstitutionUser: true 
    }).select('_id email displayName');

    const userIds = institutionUsers.map(user => user._id);
    const userMap = new Map(institutionUsers.map(user => [user._id.toString(), user]));

    const query = { userId: { $in: userIds } };

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    if (status === 'live') {
      query.isLive = true;
    } else if (status === 'ended') {
      query.isLive = false;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const presentations = await Presentation.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Presentation.countDocuments(query);

    // Get slide count and response count for each presentation
    const presentationsWithStats = await Promise.all(
      presentations.map(async (presentation) => {
        const slideCount = await Slide.countDocuments({ presentationId: presentation._id });
        const responseCount = await Response.countDocuments({ presentationId: presentation._id });
        const user = userMap.get(presentation.userId.toString());

        return {
          id: presentation._id,
          title: presentation.title,
          accessCode: presentation.accessCode,
          isLive: presentation.isLive,
          currentSlideIndex: presentation.currentSlideIndex,
          showResults: presentation.showResults,
          slideCount,
          responseCount,
          createdBy: {
            id: user?._id,
            email: user?.email,
            displayName: user?.displayName
          },
          createdAt: presentation.createdAt,
          updatedAt: presentation.updatedAt
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        presentations: presentationsWithStats,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get institution presentations error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch presentations'
    });
  }
};

/**
 * Get Analytics Data
 */
const getAnalytics = async (req, res) => {
  try {
    const institutionId = req.institutionId;
    const { period = '30' } = req.query; // days

    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get all institution users
    const institutionUsers = await User.find({ 
      institutionId,
      isInstitutionUser: true 
    }).select('_id');

    const userIds = institutionUsers.map(user => user._id);

    // Get presentations created in period
    const presentations = await Presentation.find({
      userId: { $in: userIds },
      createdAt: { $gte: startDate }
    }).select('_id createdAt');

    const presentationIds = presentations.map(p => p._id);

    // Get responses in period
    const responses = await Response.find({
      presentationId: { $in: presentationIds },
      submittedAt: { $gte: startDate }
    }).select('submittedAt');

    // Group by date
    const presentationStats = {};
    const responseStats = {};

    presentations.forEach(presentation => {
      const date = presentation.createdAt.toISOString().split('T')[0];
      presentationStats[date] = (presentationStats[date] || 0) + 1;
    });

    responses.forEach(response => {
      if (response.submittedAt) {
        const date = response.submittedAt.toISOString().split('T')[0];
        responseStats[date] = (responseStats[date] || 0) + 1;
      }
    });

    // Get top presentations by response count
    const topPresentations = await Response.aggregate([
      {
        $match: {
          presentationId: { $in: presentationIds },
          submittedAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$presentationId',
          responseCount: { $sum: 1 }
        }
      },
      {
        $sort: { responseCount: -1 }
      },
      {
        $limit: 10
      }
    ]);

    const topPresentationIds = topPresentations.map(tp => tp._id);
    const topPresentationDetails = await Presentation.find({
      _id: { $in: topPresentationIds }
    }).select('title accessCode');

    const topPresentationsWithDetails = topPresentations.map(tp => {
      const details = topPresentationDetails.find(p => p._id.toString() === tp._id.toString());
      return {
        presentationId: tp._id,
        title: details?.title || 'Unknown',
        accessCode: details?.accessCode || 'N/A',
        responseCount: tp.responseCount
      };
    });

    res.status(200).json({
      success: true,
      data: {
        period: days,
        presentationStats,
        responseStats,
        topPresentations: topPresentationsWithDetails,
        totalPresentations: presentations.length,
        totalResponses: responses.length
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics'
    });
  }
};

/**
 * Update Institution Branding
 */
const updateBranding = async (req, res) => {
  try {
    const institutionId = req.institutionId;
    const { primaryColor, secondaryColor, logoUrl, customDomain } = req.body;

    const institution = await Institution.findById(institutionId);
    if (!institution) {
      return res.status(404).json({
        success: false,
        error: 'Institution not found'
      });
    }

    if (primaryColor) institution.branding.primaryColor = primaryColor;
    if (secondaryColor) institution.branding.secondaryColor = secondaryColor;
    if (logoUrl !== undefined) institution.branding.logoUrl = logoUrl;
    if (customDomain !== undefined) institution.branding.customDomain = customDomain;

    await institution.save();

    res.status(200).json({
      success: true,
      message: 'Branding updated successfully',
      data: {
        branding: institution.branding
      }
    });
  } catch (error) {
    console.error('Update branding error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update branding'
    });
  }
};

/**
 * Update Institution Settings
 */
const updateSettings = async (req, res) => {
  try {
    const institutionId = req.institutionId;
    const { aiFeaturesEnabled, exportEnabled, watermarkEnabled, analyticsEnabled } = req.body;

    const institution = await Institution.findById(institutionId);
    if (!institution) {
      return res.status(404).json({
        success: false,
        error: 'Institution not found'
      });
    }

    if (aiFeaturesEnabled !== undefined) institution.settings.aiFeaturesEnabled = aiFeaturesEnabled;
    if (exportEnabled !== undefined) institution.settings.exportEnabled = exportEnabled;
    if (watermarkEnabled !== undefined) institution.settings.watermarkEnabled = watermarkEnabled;
    if (analyticsEnabled !== undefined) institution.settings.analyticsEnabled = analyticsEnabled;

    await institution.save();

    res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      data: {
        settings: institution.settings
      }
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update settings'
    });
  }
};

/**
 * Export Data
 */
const exportData = async (req, res) => {
  try {
    const institutionId = req.institutionId;
    const { type = 'presentations' } = req.query; // presentations, users, analytics

    const institutionUsers = await User.find({ 
      institutionId,
      isInstitutionUser: true 
    }).select('_id email displayName');

    const userIds = institutionUsers.map(user => user._id);

    if (type === 'presentations') {
      const presentations = await Presentation.find({ userId: { $in: userIds } })
        .populate('userId', 'email displayName')
        .sort({ createdAt: -1 });

      const presentationsData = await Promise.all(
        presentations.map(async (presentation) => {
          const slideCount = await Slide.countDocuments({ presentationId: presentation._id });
          const responseCount = await Response.countDocuments({ presentationId: presentation._id });

          return {
            title: presentation.title,
            accessCode: presentation.accessCode,
            isLive: presentation.isLive,
            slideCount,
            responseCount,
            createdBy: presentation.userId.email,
            createdAt: presentation.createdAt,
            updatedAt: presentation.updatedAt
          };
        })
      );

      res.status(200).json({
        success: true,
        data: {
          type: 'presentations',
          exportedAt: new Date(),
          count: presentationsData.length,
          presentations: presentationsData
        }
      });
    } else if (type === 'users') {
      const usersData = await Promise.all(
        institutionUsers.map(async (user) => {
          const presentationCount = await Presentation.countDocuments({ userId: user._id });
          return {
            email: user.email,
            displayName: user.displayName,
            presentationCount,
            createdAt: user.createdAt
          };
        })
      );

      res.status(200).json({
        success: true,
        data: {
          type: 'users',
          exportedAt: new Date(),
          count: usersData.length,
          users: usersData
        }
      });
    } else {
      return res.status(400).json({
        success: false,
        error: 'Invalid export type'
      });
    }
  } catch (error) {
    console.error('Export data error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export data'
    });
  }
};

module.exports = {
  loginInstitutionAdmin,
  checkInstitutionAdmin,
  verifyToken,
  getDashboardStats,
  getInstitutionUsers,
  addInstitutionUser,
  removeInstitutionUser,
  getInstitutionPresentations,
  getAnalytics,
  updateBranding,
  updateSettings,
  exportData
};

