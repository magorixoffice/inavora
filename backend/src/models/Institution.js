const mongoose = require('mongoose');

/**
 * Institution Schema
 */
const institutionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    unique: true
  },
  adminEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  adminName: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  logo: {
    url: {
      type: String,
      default: null
    },
    publicId: {
      type: String,
      default: null
    }
  },
  branding: {
    primaryColor: {
      type: String,
      default: '#3b82f6' // Blue
    },
    secondaryColor: {
      type: String,
      default: '#14b8a6' // Teal
    },
    logoUrl: {
      type: String,
      default: null
    },
    customDomain: {
      type: String,
      default: null
    }
  },
  subscription: {
    plan: {
      type: String,
      enum: ['institution'],
      default: 'institution'
    },
    status: {
      type: String,
      enum: ['active', 'expired', 'cancelled', 'trial'],
      default: 'active'
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: {
      type: Date
    },
    maxUsers: {
      type: Number,
      default: 10,
      min: 10
    },
    currentUsers: {
      type: Number,
      default: 0
    },
    billingCycle: {
      type: String,
      enum: ['yearly'],
      default: 'yearly'
    },
    razorpayCustomerId: {
      type: String
    }
  },
  settings: {
    aiFeaturesEnabled: {
      type: Boolean,
      default: true
    },
    exportEnabled: {
      type: Boolean,
      default: true
    },
    watermarkEnabled: {
      type: Boolean,
      default: false
    },
    analyticsEnabled: {
      type: Boolean,
      default: true
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
// Note: email already has unique: true which creates an index, so we don't need to add it again
institutionSchema.index({ adminEmail: 1 });
institutionSchema.index({ 'subscription.status': 1 });

const Institution = mongoose.model('Institution', institutionSchema);

module.exports = Institution;

