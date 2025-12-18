import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../../config/api';
import { 
  UserPlus, Mail, User, CreditCard, Calendar, 
  CheckCircle, XCircle, Loader, ArrowLeft, Eye, EyeOff 
} from 'lucide-react';

const AddUserPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    displayName: '',
    plan: 'free',
    status: 'active',
    billingCycle: '',
    endDate: '',
    password: '',
    createFirebaseAccount: false
  });
  const [errors, setErrors] = useState({});

  const plans = [
    { value: 'free', label: 'Free', description: 'Basic features, limited presentations' },
    { value: 'pro', label: 'Pro', description: 'Advanced features, unlimited presentations' },
    { value: 'lifetime', label: 'Lifetime', description: 'One-time payment, lifetime access' },
    { value: 'institution', label: 'Institution', description: 'For institution users' }
  ];

  const billingCycles = [
    { value: '', label: 'None' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' },
    { value: 'lifetime', label: 'Lifetime' },
    { value: 'one-time', label: 'One-time' }
  ];

  const statuses = [
    { value: 'active', label: 'Active' },
    { value: 'expired', label: 'Expired' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Auto-set billing cycle for lifetime plan
    if (name === 'plan' && value === 'lifetime') {
      setFormData(prev => ({
        ...prev,
        billingCycle: 'lifetime'
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.displayName.trim()) {
      newErrors.displayName = 'Display name is required';
    } else if (formData.displayName.trim().length < 2) {
      newErrors.displayName = 'Display name must be at least 2 characters';
    }

    if (formData.createFirebaseAccount && !formData.password) {
      newErrors.password = 'Password is required when creating Firebase account';
    } else if (formData.createFirebaseAccount && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.plan !== 'free' && formData.plan !== 'lifetime' && !formData.billingCycle) {
      newErrors.billingCycle = 'Billing cycle is required for paid plans';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        email: formData.email.trim(),
        displayName: formData.displayName.trim(),
        plan: formData.plan,
        status: formData.status,
        billingCycle: formData.billingCycle || null,
        endDate: formData.endDate || null
      };

      // Only include password if creating Firebase account
      if (formData.createFirebaseAccount && formData.password) {
        payload.password = formData.password;
      }

      const response = await api.post('/super-admin/users', payload);

      if (response.data.success) {
        toast.success('User created successfully!');
        // Reset form
        setFormData({
          email: '',
          displayName: '',
          plan: 'free',
          status: 'active',
          billingCycle: '',
          endDate: '',
          password: '',
          createFirebaseAccount: false
        });
        setErrors({});
        
        // Optionally navigate to users page
        setTimeout(() => {
          navigate('/super-admin/users');
        }, 1500);
      }
    } catch (error) {
      console.error('Error creating user:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Failed to create user. Please try again.';
      toast.error(errorMessage);
      
      // Set field-specific errors if available
      if (error.response?.data?.code === 'DUPLICATE_ENTRY') {
        setErrors(prev => ({ ...prev, email: 'User with this email already exists' }));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      className="max-w-4xl mx-auto"
    >
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/super-admin/users')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Users</span>
        </button>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <UserPlus className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Add New User
            </h1>
            <p className="text-slate-400 mt-1">Create a new user account with custom subscription plan</p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 lg:p-8 shadow-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information Section */}
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <User className="w-5 h-5 text-blue-400" />
                Basic Information
              </h2>
              <p className="text-sm text-slate-400 mt-1">Enter user's basic details</p>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email Address <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 bg-slate-800/50 border rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                    errors.email ? 'border-red-500' : 'border-slate-700'
                  }`}
                  placeholder="user@example.com"
                  required
                />
              </div>
              {errors.email && (
                <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                  <XCircle className="w-4 h-4" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Display Name */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Display Name <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 bg-slate-800/50 border rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                    errors.displayName ? 'border-red-500' : 'border-slate-700'
                  }`}
                  placeholder="John Doe"
                  required
                />
              </div>
              {errors.displayName && (
                <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                  <XCircle className="w-4 h-4" />
                  {errors.displayName}
                </p>
              )}
            </div>
          </div>

          {/* Subscription Section */}
          <div className="space-y-6 pt-6 border-t border-slate-800">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-teal-400" />
                Subscription Plan
              </h2>
              <p className="text-sm text-slate-400 mt-1">Configure user's subscription plan</p>
            </div>

            {/* Plan Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Plan <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {plans.map((plan) => (
                  <label
                    key={plan.value}
                    className={`relative flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      formData.plan === plan.value
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-slate-700 bg-slate-800/30 hover:border-slate-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="plan"
                      value={plan.value}
                      checked={formData.plan === plan.value}
                      onChange={handleChange}
                      className="mt-1 w-4 h-4 text-blue-500 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-white">{plan.label}</div>
                      <div className="text-xs text-slate-400 mt-1">{plan.description}</div>
                    </div>
                    {formData.plan === plan.value && (
                      <CheckCircle className="w-5 h-5 text-blue-400" />
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Status <span className="text-red-400">*</span>
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              >
                {statuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Billing Cycle */}
            {formData.plan !== 'free' && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Billing Cycle {formData.plan !== 'lifetime' && <span className="text-red-400">*</span>}
                </label>
                <select
                  name="billingCycle"
                  value={formData.billingCycle}
                  onChange={handleChange}
                  disabled={formData.plan === 'lifetime'}
                  className={`w-full px-4 py-3 bg-slate-800/50 border rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                    errors.billingCycle ? 'border-red-500' : 'border-slate-700'
                  } ${formData.plan === 'lifetime' ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {billingCycles.map((cycle) => (
                    <option key={cycle.value} value={cycle.value}>
                      {cycle.label}
                    </option>
                  ))}
                </select>
                {errors.billingCycle && (
                  <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                    <XCircle className="w-4 h-4" />
                    {errors.billingCycle}
                  </p>
                )}
              </div>
            )}

            {/* End Date */}
            {formData.plan !== 'free' && formData.plan !== 'lifetime' && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Subscription End Date (Optional)
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Leave empty to auto-calculate based on billing cycle
                </p>
              </div>
            )}
          </div>

          {/* Firebase Account Section */}
          <div className="space-y-6 pt-6 border-t border-slate-800">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <User className="w-5 h-5 text-purple-400" />
                Firebase Authentication (Optional)
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Create Firebase account for immediate login access
              </p>
            </div>

            {/* Create Firebase Account Toggle */}
            <div className="flex items-center gap-3 p-4 bg-slate-800/30 rounded-lg border border-slate-700">
              <input
                type="checkbox"
                name="createFirebaseAccount"
                checked={formData.createFirebaseAccount}
                onChange={handleChange}
                className="w-5 h-5 text-blue-500 focus:ring-blue-500 rounded"
              />
              <label className="text-sm text-slate-300 cursor-pointer">
                Create Firebase authentication account
              </label>
            </div>

            {/* Password */}
            {formData.createFirebaseAccount && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Password <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 pr-12 bg-slate-800/50 border rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                      errors.password ? 'border-red-500' : 'border-slate-700'
                    }`}
                    placeholder="Enter password (min 6 characters)"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center z-10"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer" />
                    ) : (
                      <Eye className="h-5 w-5 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                    <XCircle className="w-4 h-4" />
                    {errors.password}
                  </p>
                )}
                <p className="text-xs text-slate-400 mt-1">
                  User can change this password after first login
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-800">
            <button
              type="button"
              onClick={() => navigate('/super-admin/users')}
              className="px-6 py-3 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors font-medium"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-lg hover:shadow-lg hover:shadow-blue-500/25 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Creating User...
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Create User
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default AddUserPage;

