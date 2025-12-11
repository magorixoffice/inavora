const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const XLSX = require('xlsx');
const Institution = require('../models/Institution');
const User = require('../models/User');
const Presentation = require('../models/Presentation');
const Slide = require('../models/Slide');
const Response = require('../models/Response');
const { AppError, asyncHandler } = require('../middleware/errorHandler');
const Logger = require('../utils/logger');

/**
 * Login Institution Admin
 * @route POST /api/institution-admin/login
 * @access Public
 */
const loginInstitutionAdmin = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError('Email and password are required', 400, 'VALIDATION_ERROR');
  }

  const institution = await Institution.findOne({ 
    $or: [
      { email: email.toLowerCase() },
      { adminEmail: email.toLowerCase() }
    ],
    isActive: true
  });

  if (!institution) {
    throw new AppError('Invalid credentials', 401, 'UNAUTHORIZED');
  }

  // Check password - support both plain text (legacy) and bcrypt hashed
  let isPasswordValid = false;
  if (institution.password && institution.password.startsWith('$2')) {
    // Password is hashed with bcrypt
    isPasswordValid = await bcrypt.compare(password, institution.password);
  } else {
    // Plain text password (legacy support)
    isPasswordValid = password === institution.password;
  }

  if (!isPasswordValid) {
    throw new AppError('Invalid credentials', 401, 'UNAUTHORIZED');
  }

  const token = jwt.sign(
    { 
      institutionAdmin: true,
      institutionId: institution._id.toString(),
      email: institution.adminEmail,
      type: 'institution_admin',
      timestamp: Date.now()
    },
    process.env.JWT_SECRET
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
});

/**
 * Check if email belongs to an institution admin
 * @route POST /api/institution-admin/check
 * @access Public
 */
const checkInstitutionAdmin = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    throw new AppError('Email is required', 400, 'VALIDATION_ERROR');
  }

  const institution = await Institution.findOne({
    $or: [
      { email: email.toLowerCase() },
      { adminEmail: email.toLowerCase() }
    ],
    isActive: true
  }).select('_id name email adminEmail').lean();

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

  res.status(200).json({
    success: true,
    isInstitutionAdmin: false
  });
});

/**
 * Verify Institution Admin Token
 * @route GET /api/institution-admin/verify
 * @access Private (Institution Admin)
 */
const verifyToken = asyncHandler(async (req, res, next) => {
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
});

/**
 * Get Dashboard Statistics
 * @route GET /api/institution-admin/dashboard/stats
 * @access Private (Institution Admin)
 */
const getDashboardStats = asyncHandler(async (req, res, next) => {
  const institutionId = req.institutionId;

  const totalUsers = await User.countDocuments({ 
    institutionId,
    isInstitutionUser: true 
  });

  const institutionUsers = await User.find({ 
    institutionId,
    isInstitutionUser: true 
  }).select('_id').lean();

  const userIds = institutionUsers.map(user => user._id);

  const totalPresentations = await Presentation.countDocuments({ 
    userId: { $in: userIds } 
  });

  const livePresentations = await Presentation.countDocuments({ 
    userId: { $in: userIds },
    isLive: true 
  });

  const presentations = await Presentation.find({ 
    userId: { $in: userIds } 
  }).select('_id').lean();

  const presentationIds = presentations.map(p => p._id);
  const totalSlides = await Slide.countDocuments({ 
    presentationId: { $in: presentationIds } 
  });

  const totalResponses = await Response.countDocuments({ 
    presentationId: { $in: presentationIds } 
  });

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const activeUsers = await Presentation.distinct('userId', {
    userId: { $in: userIds },
    createdAt: { $gte: thirtyDaysAgo }
  });

  const recentPresentations = await Presentation.countDocuments({
    userId: { $in: userIds },
    createdAt: { $gte: thirtyDaysAgo }
  });

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
});

/**
 * Get All Institution Users
 * @route GET /api/institution-admin/users
 * @access Private (Institution Admin)
 */
const getInstitutionUsers = asyncHandler(async (req, res, next) => {
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
    .limit(parseInt(limit))
    .lean();

  const total = await User.countDocuments(query);

  const userIds = users.map(u => u._id);
  const presentationCounts = await Presentation.aggregate([
    { $match: { userId: { $in: userIds } } },
    { $group: { _id: '$userId', count: { $sum: 1 } } }
  ]);
  const presentationCountMap = new Map(presentationCounts.map(pc => [pc._id.toString(), pc.count]));

  const presentationIds = await Presentation.find({ userId: { $in: userIds } }).select('_id').lean();
  const pidArray = presentationIds.map(p => p._id);
  const slideCounts = await Slide.aggregate([
    { $match: { presentationId: { $in: pidArray } } },
    { $group: { _id: '$presentationId', count: { $sum: 1 } } }
  ]);
  const userSlideCountMap = new Map();
  presentationIds.forEach(p => {
    const userId = p.userId?.toString();
    if (userId) {
      const slideCount = slideCounts.filter(sc => sc._id.toString() === p._id.toString()).reduce((sum, sc) => sum + sc.count, 0);
      userSlideCountMap.set(userId, (userSlideCountMap.get(userId) || 0) + slideCount);
    }
  });

  const usersWithStats = users.map((user) => ({
    id: user._id,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    subscription: user.subscription,
    presentationCount: presentationCountMap.get(user._id.toString()) || 0,
    slideCount: userSlideCountMap.get(user._id.toString()) || 0,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  }));

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
});

/**
 * Add User to Institution
 * @route POST /api/institution-admin/users
 * @access Private (Institution Admin)
 */
const addInstitutionUser = asyncHandler(async (req, res, next) => {
  const institutionId = req.institutionId;
  const { email, displayName } = req.body;

  if (!email || !displayName) {
    throw new AppError('Email and display name are required', 400, 'VALIDATION_ERROR');
  }

  const institution = await Institution.findById(institutionId);
  if (!institution) {
    throw new AppError('Institution not found', 404, 'RESOURCE_NOT_FOUND');
  }

  const currentUserCount = await User.countDocuments({ 
    institutionId,
    isInstitutionUser: true 
  });

  if (currentUserCount >= institution.subscription.maxUsers) {
    throw new AppError(`User limit reached. Maximum ${institution.subscription.maxUsers} users allowed.`, 400, 'LIMIT_REACHED');
  }

  let user = await User.findOne({ email: email.toLowerCase() });

  if (user) {
    if (!user.institutionId || user.institutionId.toString() !== institutionId.toString()) {
      user.institutionId = institutionId;
      user.isInstitutionUser = true;
      user.subscription.plan = 'institution';
      user.subscription.status = 'active';
      await user.save();
    } else {
      throw new AppError('User already exists in this institution', 400, 'DUPLICATE_ENTRY');
    }
  } else {
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
});

/**
 * Remove User from Institution
 * @route DELETE /api/institution-admin/users/:userId
 * @access Private (Institution Admin)
 */
const removeInstitutionUser = asyncHandler(async (req, res, next) => {
  const institutionId = req.institutionId;
  const { userId } = req.params;

  const user = await User.findOne({ 
    _id: userId,
    institutionId,
    isInstitutionUser: true 
  });

  if (!user) {
    throw new AppError('User not found in this institution', 404, 'RESOURCE_NOT_FOUND');
  }

  user.institutionId = null;
  user.isInstitutionUser = false;
  user.subscription.plan = 'free';
  user.subscription.status = 'active';
  await user.save();

  const institution = await Institution.findById(institutionId);
  institution.subscription.currentUsers = Math.max(0, institution.subscription.currentUsers - 1);
  await institution.save();

  res.status(200).json({
    success: true,
    message: 'User removed successfully'
  });
});

/**
 * Get All Presentations by Institution Users
 * @route GET /api/institution-admin/presentations
 * @access Private (Institution Admin)
 */
const getInstitutionPresentations = asyncHandler(async (req, res, next) => {
  const institutionId = req.institutionId;
  const { page = 1, limit = 20, search = '', status = 'all' } = req.query;

  const institutionUsers = await User.find({ 
    institutionId,
    isInstitutionUser: true 
  }).select('_id email displayName').lean();

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
    .limit(parseInt(limit))
    .lean();

  const total = await Presentation.countDocuments(query);

  const presentationIds = presentations.map(p => p._id);
  const slideCounts = await Slide.aggregate([
    { $match: { presentationId: { $in: presentationIds } } },
    { $group: { _id: '$presentationId', count: { $sum: 1 } } }
  ]);
  const slideCountMap = new Map(slideCounts.map(sc => [sc._id.toString(), sc.count]));

  const responseCounts = await Response.aggregate([
    { $match: { presentationId: { $in: presentationIds } } },
    { $group: { _id: '$presentationId', count: { $sum: 1 } } }
  ]);
  const responseCountMap = new Map(responseCounts.map(rc => [rc._id.toString(), rc.count]));

  const presentationsWithStats = presentations.map((presentation) => {
    const user = userMap.get(presentation.userId.toString());
    return {
      id: presentation._id,
      title: presentation.title,
      accessCode: presentation.accessCode,
      isLive: presentation.isLive,
      currentSlideIndex: presentation.currentSlideIndex,
      showResults: presentation.showResults,
      slideCount: slideCountMap.get(presentation._id.toString()) || 0,
      responseCount: responseCountMap.get(presentation._id.toString()) || 0,
      createdBy: {
        id: user?._id,
        email: user?.email,
        displayName: user?.displayName
      },
      createdAt: presentation.createdAt,
      updatedAt: presentation.updatedAt
    };
  });

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
});

/**
 * Get Analytics Data
 * @route GET /api/institution-admin/analytics
 * @access Private (Institution Admin)
 */
const getAnalytics = asyncHandler(async (req, res, next) => {
  const institutionId = req.institutionId;
  const { period = '30' } = req.query;

  const days = parseInt(period);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const institutionUsers = await User.find({ 
    institutionId,
    isInstitutionUser: true 
  }).select('_id').lean();

  const userIds = institutionUsers.map(user => user._id);

  const presentations = await Presentation.find({
    userId: { $in: userIds },
    createdAt: { $gte: startDate }
  }).select('_id createdAt').lean();

  const presentationIds = presentations.map(p => p._id);

  const responses = await Response.find({
    presentationId: { $in: presentationIds },
    submittedAt: { $gte: startDate }
  }).select('submittedAt').lean();

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
  }).select('title accessCode').lean();

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
});

/**
 * Update Institution Branding
 * @route PUT /api/institution-admin/branding
 * @access Private (Institution Admin)
 */
const updateBranding = asyncHandler(async (req, res, next) => {
  const institutionId = req.institutionId;
  const { primaryColor, secondaryColor, logoUrl, customDomain } = req.body;

  const institution = await Institution.findById(institutionId);
  if (!institution) {
    throw new AppError('Institution not found', 404, 'RESOURCE_NOT_FOUND');
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
});

/**
 * Update Institution Settings
 * @route PUT /api/institution-admin/settings
 * @access Private (Institution Admin)
 */
const updateSettings = asyncHandler(async (req, res, next) => {
  const institutionId = req.institutionId;
  const { aiFeaturesEnabled, exportEnabled, watermarkEnabled, analyticsEnabled } = req.body;

  const institution = await Institution.findById(institutionId);
  if (!institution) {
    throw new AppError('Institution not found', 404, 'RESOURCE_NOT_FOUND');
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
});

/**
 * Export Data
 * @route GET /api/institution-admin/export
 * @access Private (Institution Admin)
 */
const exportData = asyncHandler(async (req, res, next) => {
  const institutionId = req.institutionId;
  const { type = 'presentations', format = 'json' } = req.query;

  if (!['presentations', 'users'].includes(type)) {
    throw new AppError('Invalid export type', 400, 'VALIDATION_ERROR');
  }

  if (!['json', 'csv', 'excel'].includes(format)) {
    throw new AppError('Invalid export format. Use: json, csv, or excel', 400, 'VALIDATION_ERROR');
  }

  const institutionUsers = await User.find({ 
    institutionId,
    isInstitutionUser: true 
  }).select('_id email displayName').lean();

  const userIds = institutionUsers.map(user => user._id);

  if (type === 'presentations') {
    const presentations = await Presentation.find({ userId: { $in: userIds } })
      .populate('userId', 'email displayName')
      .sort({ createdAt: -1 })
      .lean();

    const presentationIds = presentations.map(p => p._id);
    const slideCounts = await Slide.aggregate([
      { $match: { presentationId: { $in: presentationIds } } },
      { $group: { _id: '$presentationId', count: { $sum: 1 } } }
    ]);
    const slideCountMap = new Map(slideCounts.map(sc => [sc._id.toString(), sc.count]));

    const responseCounts = await Response.aggregate([
      { $match: { presentationId: { $in: presentationIds } } },
      { $group: { _id: '$presentationId', count: { $sum: 1 } } }
    ]);
    const responseCountMap = new Map(responseCounts.map(rc => [rc._id.toString(), rc.count]));

    const presentationsData = presentations.map((presentation) => ({
      Title: presentation.title,
      'Access Code': presentation.accessCode,
      'Is Live': presentation.isLive ? 'Yes' : 'No',
      'Slide Count': slideCountMap.get(presentation._id.toString()) || 0,
      'Response Count': responseCountMap.get(presentation._id.toString()) || 0,
      'Created By': presentation.userId?.email || 'Unknown',
      'Created At': new Date(presentation.createdAt).toLocaleString(),
      'Updated At': new Date(presentation.updatedAt).toLocaleString()
    }));

    if (format === 'json') {
      return res.status(200).json({
        success: true,
        data: {
          type: 'presentations',
          exportedAt: new Date(),
          count: presentationsData.length,
          presentations: presentationsData
        }
      });
    } else if (format === 'csv') {
      // Convert to CSV
      const headers = Object.keys(presentationsData[0] || {});
      const csvRows = [
        headers.join(','),
        ...presentationsData.map(row => 
          headers.map(header => {
            const value = row[header] || '';
            // Escape commas and quotes in CSV
            if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          }).join(',')
        )
      ];
      const csv = csvRows.join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=institution-presentations-${new Date().toISOString().split('T')[0]}.csv`);
      return res.send(csv);
    } else if (format === 'excel') {
      // Convert to Excel
      const worksheet = XLSX.utils.json_to_sheet(presentationsData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Presentations');
      
      const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=institution-presentations-${new Date().toISOString().split('T')[0]}.xlsx`);
      return res.send(excelBuffer);
    }
  } else {
    const userIdsArray = institutionUsers.map(u => u._id);
    const presentationCounts = await Presentation.aggregate([
      { $match: { userId: { $in: userIdsArray } } },
      { $group: { _id: '$userId', count: { $sum: 1 } } }
    ]);
    const presentationCountMap = new Map(presentationCounts.map(pc => [pc._id.toString(), pc.count]));

    const usersData = institutionUsers.map((user) => ({
      Email: user.email,
      'Display Name': user.displayName || '',
      'Presentation Count': presentationCountMap.get(user._id.toString()) || 0,
      'Created At': new Date(user.createdAt).toLocaleString()
    }));

    if (format === 'json') {
      return res.status(200).json({
        success: true,
        data: {
          type: 'users',
          exportedAt: new Date(),
          count: usersData.length,
          users: usersData
        }
      });
    } else if (format === 'csv') {
      // Convert to CSV
      const headers = Object.keys(usersData[0] || {});
      const csvRows = [
        headers.join(','),
        ...usersData.map(row => 
          headers.map(header => {
            const value = row[header] || '';
            // Escape commas and quotes in CSV
            if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          }).join(',')
        )
      ];
      const csv = csvRows.join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=institution-users-${new Date().toISOString().split('T')[0]}.csv`);
      return res.send(csv);
    } else if (format === 'excel') {
      // Convert to Excel
      const worksheet = XLSX.utils.json_to_sheet(usersData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');
      
      const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=institution-users-${new Date().toISOString().split('T')[0]}.xlsx`);
      return res.send(excelBuffer);
    }
  }
});

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

