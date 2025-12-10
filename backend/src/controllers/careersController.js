const JobApplication = require('../models/JobApplication');
const cloudinaryService = require('../services/cloudinaryService');

/**
 * Submit job application
 */
const submitApplication = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      location,
      linkedinUrl,
      portfolioUrl,
      githubUrl,
      position,
      department,
      expectedSalary,
      availability,
      experience,
      education,
      skills,
      coverLetter,
      whyInavora,
      additionalInfo,
      resume
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !location || !position || !department || !coverLetter || !resume) {
      return res.status(400).json({
        success: false,
        error: 'Please fill in all required fields'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid email address'
      });
    }

    // Upload resume to Cloudinary if it's base64
    let resumeUrl = resume.url;
    let resumePublicId = resume.publicId || '';
    let resumeFileName = resume.fileName || 'resume.pdf';
    let resumeFileSize = resume.fileSize || 0;

    if (resume.base64) {
      // Validate file size (max 5MB)
      const sizeInBytes = (resume.base64.length * 3) / 4;
      const sizeInMB = sizeInBytes / (1024 * 1024);
      
      if (sizeInMB > 5) {
        return res.status(400).json({
          success: false,
          error: `Resume file is too large (${sizeInMB.toFixed(1)}MB). Maximum size is 5MB.`
        });
      }

      // Upload to Cloudinary
      const uploadResult = await cloudinaryService.uploadDocument(resume.base64, `resumes/${email}_${Date.now()}`);
      resumeUrl = uploadResult.url;
      resumePublicId = uploadResult.publicId;
      resumeFileName = resume.fileName || 'resume.pdf';
      resumeFileSize = sizeInBytes;
    }

    // Get IP address and user agent
    const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
    const userAgent = req.headers['user-agent'];

    // Create job application
    const application = new JobApplication({
      firstName,
      lastName,
      email,
      phone,
      location,
      linkedinUrl: linkedinUrl || '',
      portfolioUrl: portfolioUrl || '',
      githubUrl: githubUrl || '',
      position,
      department,
      expectedSalary: expectedSalary || '',
      availability: availability || '1 month',
      experience: experience || [],
      education: education || [],
      skills: skills || { technical: [], soft: [] },
      coverLetter,
      whyInavora: whyInavora || '',
      additionalInfo: additionalInfo || '',
      resume: {
        url: resumeUrl,
        publicId: resumePublicId,
        fileName: resumeFileName,
        fileSize: resumeFileSize
      },
      ipAddress,
      userAgent
    });

    await application.save();

    // Update job posting application count if position matches
    const JobPosting = require('../models/JobPosting');
    await JobPosting.updateOne(
      { title: position, status: 'active' },
      { $inc: { applicationCount: 1 } }
    );

    // Emit real-time notification to admin
    const io = req.app.get('io');
    if (io) {
      io.emit('new-application', {
        applicationId: application._id,
        candidateName: `${firstName} ${lastName}`,
        email,
        position,
        department,
        status: 'pending',
        createdAt: application.createdAt
      });
    }

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully! We will review it and get back to you soon.',
      data: {
        applicationId: application._id
      }
    });
  } catch (error) {
    console.error('Submit application error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to submit application. Please try again.'
    });
  }
};

/**
 * Get all applications (Admin only - can add auth later)
 */
const getApplications = async (req, res) => {
  try {
    const { status, position, page = 1, limit = 10 } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (position) query.position = { $regex: position, $options: 'i' };

    const applications = await JobApplication.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-resume.publicId -ipAddress -userAgent');

    const total = await JobApplication.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        applications,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      }
    });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch applications'
    });
  }
};

/**
 * Get single application by ID
 */
const getApplication = async (req, res) => {
  try {
    const { id } = req.params;

    const application = await JobApplication.findById(id);

    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Application not found'
      });
    }

    res.status(200).json({
      success: true,
      data: application
    });
  } catch (error) {
    console.error('Get application error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch application'
    });
  }
};

/**
 * Update application status (Admin only)
 */
const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['pending', 'reviewing', 'shortlisted', 'interview', 'rejected', 'accepted'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status'
      });
    }

    const application = await JobApplication.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Application not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Application status updated successfully',
      data: application
    });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update application status'
    });
  }
};

module.exports = {
  submitApplication,
  getApplications,
  getApplication,
  updateApplicationStatus
};

