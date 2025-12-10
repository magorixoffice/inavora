const JobPosting = require('../models/JobPosting');
const JobApplication = require('../models/JobApplication');

/**
 * Create a new job posting
 */
const createJobPosting = async (req, res) => {
  try {
    const {
      title,
      department,
      location,
      type,
      description,
      requirements,
      responsibilities,
      benefits,
      salaryRange,
      experienceLevel,
      status,
      expiresAt
    } = req.body;

    if (!title || !department || !description) {
      return res.status(400).json({
        success: false,
        error: 'Title, department, and description are required'
      });
    }

    const jobPosting = new JobPosting({
      title,
      department,
      location: location || 'Remote / Chennai',
      type: type || 'Full-time',
      description,
      requirements: requirements || [],
      responsibilities: responsibilities || [],
      benefits: benefits || [],
      salaryRange: salaryRange || {},
      experienceLevel: experienceLevel || 'Mid Level',
      status: status || 'draft',
      postedBy: req.userId || 'admin',
      expiresAt: expiresAt ? new Date(expiresAt) : null
    });

    await jobPosting.save();

    // Emit real-time event
    const io = req.app.get('io');
    if (io) {
      io.emit('job-posting-created', jobPosting);
    }

    res.status(201).json({
      success: true,
      message: 'Job posting created successfully',
      data: jobPosting
    });
  } catch (error) {
    console.error('Create job posting error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create job posting'
    });
  }
};

/**
 * Get all job postings
 */
const getJobPostings = async (req, res) => {
  try {
    const { status, department, search, page = 1, limit = 10 } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (department) query.department = department;
    if (search) {
      query.$text = { $search: search };
    }

    const jobPostings = await JobPosting.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await JobPosting.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        jobPostings,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        total
      }
    });
  } catch (error) {
    console.error('Get job postings error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch job postings'
    });
  }
};

/**
 * Get active job postings (for careers page)
 */
const getActiveJobPostings = async (req, res) => {
  try {
    const jobPostings = await JobPosting.find({
      status: 'active',
      $or: [
        { expiresAt: null },
        { expiresAt: { $gte: new Date() } }
      ]
    })
      .sort({ createdAt: -1 })
      .select('title department location type description responsibilities requirements createdAt')
      .lean();

    res.status(200).json({
      success: true,
      data: jobPostings
    });
  } catch (error) {
    console.error('Get active job postings error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch job postings'
    });
  }
};

/**
 * Get single job posting by ID
 */
const getJobPosting = async (req, res) => {
  try {
    const { id } = req.params;

    const jobPosting = await JobPosting.findById(id);

    if (!jobPosting) {
      return res.status(404).json({
        success: false,
        error: 'Job posting not found'
      });
    }

    // Increment views
    jobPosting.views += 1;
    await jobPosting.save();

    res.status(200).json({
      success: true,
      data: jobPosting
    });
  } catch (error) {
    console.error('Get job posting error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch job posting'
    });
  }
};

/**
 * Update job posting
 */
const updateJobPosting = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const jobPosting = await JobPosting.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!jobPosting) {
      return res.status(404).json({
        success: false,
        error: 'Job posting not found'
      });
    }

    // Emit real-time event
    const io = req.app.get('io');
    if (io) {
      io.emit('job-posting-updated', jobPosting);
    }

    res.status(200).json({
      success: true,
      message: 'Job posting updated successfully',
      data: jobPosting
    });
  } catch (error) {
    console.error('Update job posting error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update job posting'
    });
  }
};

/**
 * Delete job posting
 */
const deleteJobPosting = async (req, res) => {
  try {
    const { id } = req.params;

    const jobPosting = await JobPosting.findByIdAndDelete(id);

    if (!jobPosting) {
      return res.status(404).json({
        success: false,
        error: 'Job posting not found'
      });
    }

    // Emit real-time event
    const io = req.app.get('io');
    if (io) {
      io.emit('job-posting-deleted', { id });
    }

    res.status(200).json({
      success: true,
      message: 'Job posting deleted successfully'
    });
  } catch (error) {
    console.error('Delete job posting error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete job posting'
    });
  }
};

/**
 * Get dashboard statistics
 */
const getDashboardStats = async (req, res) => {
  try {
    const totalJobs = await JobPosting.countDocuments();
    const activeJobs = await JobPosting.countDocuments({ status: 'active' });
    const totalApplications = await JobApplication.countDocuments();
    const pendingApplications = await JobApplication.countDocuments({ status: 'pending' });
    const recentApplications = await JobApplication.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('firstName lastName email position status createdAt')
      .lean();

    const applicationsByStatus = await JobApplication.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const applicationsByPosition = await JobApplication.aggregate([
      {
        $group: {
          _id: '$position',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalJobs,
        activeJobs,
        totalApplications,
        pendingApplications,
        recentApplications,
        applicationsByStatus,
        applicationsByPosition
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch dashboard statistics'
    });
  }
};

module.exports = {
  createJobPosting,
  getJobPostings,
  getActiveJobPostings,
  getJobPosting,
  updateJobPosting,
  deleteJobPosting,
  getDashboardStats
};

