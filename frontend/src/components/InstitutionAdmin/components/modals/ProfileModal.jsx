import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Building, Lock, Save, Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';

const ProfileModal = ({ isOpen, onClose, institution, onUpdateProfile, onChangePassword, loading }) => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('profile');
    const [profileData, setProfileData] = useState({
        adminName: institution?.adminName || '',
        adminEmail: institution?.adminEmail || ''
    });
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState({});

    // Disable body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            // Save current overflow style
            const originalOverflow = document.body.style.overflow;
            // Disable scrolling
            document.body.style.overflow = 'hidden';
            
            // Cleanup: restore original overflow when modal closes
            return () => {
                document.body.style.overflow = originalOverflow;
            };
        }
    }, [isOpen]);

    // Update profile data when institution changes
    useEffect(() => {
        if (institution) {
            setProfileData({
                adminName: institution.adminName || '',
                adminEmail: institution.adminEmail || ''
            });
        }
    }, [institution]);

    const handleProfileChange = (field, value) => {
        setProfileData(prev => ({
            ...prev,
            [field]: value
        }));
        // Clear error for this field
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const handlePasswordChange = (field, value) => {
        setPasswordData(prev => ({
            ...prev,
            [field]: value
        }));
        // Clear error for this field
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const validateProfile = () => {
        const newErrors = {};
        
        if (!profileData.adminName.trim()) {
            newErrors.adminName = t('institution_admin.name_required') || 'Name is required';
        }
        
        if (!profileData.adminEmail.trim()) {
            newErrors.adminEmail = t('institution_admin.email_required') || 'Email is required';
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(profileData.adminEmail)) {
                newErrors.adminEmail = t('institution_admin.invalid_email') || 'Invalid email format';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validatePassword = () => {
        const newErrors = {};
        
        if (!passwordData.currentPassword) {
            newErrors.currentPassword = t('institution_admin.current_password_required') || 'Current password is required';
        }
        
        if (!passwordData.newPassword) {
            newErrors.newPassword = t('institution_admin.new_password_required') || 'New password is required';
        } else if (passwordData.newPassword.length < 8) {
            newErrors.newPassword = t('institution_admin.password_min_length') || 'Password must be at least 8 characters';
        }
        
        if (!passwordData.confirmPassword) {
            newErrors.confirmPassword = t('institution_admin.confirm_password_required') || 'Please confirm your new password';
        } else if (passwordData.newPassword !== passwordData.confirmPassword) {
            newErrors.confirmPassword = t('institution_admin.passwords_not_match') || 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        if (!validateProfile()) return;

        await onUpdateProfile(profileData);
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (!validatePassword()) return;

        await onChangePassword({
            currentPassword: passwordData.currentPassword,
            newPassword: passwordData.newPassword
        });

        // Reset password form on success
        setPasswordData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        });
    };

    const handleClose = () => {
        setActiveTab('profile');
        setErrors({});
        setPasswordData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        });
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                    onClick={handleClose}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-[#1e293b] rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-2xl border border-white/10"
                    >
                        <div className="p-6 border-b border-white/10 flex items-center justify-between">
                            <h2 className="text-xl sm:text-2xl font-bold text-white">
                                {t('institution_admin.profile') || 'Profile'}
                            </h2>
                            <button
                                onClick={handleClose}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        {/* Tab Navigation */}
                        <div className="flex gap-2 px-6 pt-4 border-b border-white/10">
                            <button
                                onClick={() => setActiveTab('profile')}
                                className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                                    activeTab === 'profile'
                                        ? 'text-teal-400 border-teal-400'
                                        : 'text-gray-400 border-transparent hover:text-white'
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    {t('institution_admin.profile_info') || 'Profile Information'}
                                </div>
                            </button>
                            <button
                                onClick={() => setActiveTab('password')}
                                className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                                    activeTab === 'password'
                                        ? 'text-teal-400 border-teal-400'
                                        : 'text-gray-400 border-transparent hover:text-white'
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                    <Lock className="w-4 h-4" />
                                    {t('institution_admin.change_password') || 'Change Password'}
                                </div>
                            </button>
                        </div>

                        <div className="p-6">
                            {/* Profile Information Tab */}
                            {activeTab === 'profile' && (
                                <form onSubmit={handleProfileSubmit} className="space-y-6">
                                    {/* Institution Name (Read-only) */}
                                    <div>
                                        <label className="block text-sm font-medium text-white mb-2 flex items-center gap-2">
                                            <Building className="w-4 h-4 text-teal-400" />
                                            {t('institution_admin.institution_name') || 'Institution Name'}
                                        </label>
                                        <input
                                            type="text"
                                            value={institution?.name || ''}
                                            disabled
                                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-400 cursor-not-allowed"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            {t('institution_admin.institution_name_readonly') || 'Institution name cannot be changed'}
                                        </p>
                                    </div>

                                    {/* Admin Name */}
                                    <div>
                                        <label className="block text-sm font-medium text-white mb-2 flex items-center gap-2">
                                            <User className="w-4 h-4 text-teal-400" />
                                            {t('institution_admin.admin_name') || 'Admin Name'}
                                        </label>
                                        <input
                                            type="text"
                                            value={profileData.adminName}
                                            onChange={(e) => handleProfileChange('adminName', e.target.value)}
                                            className={`w-full px-4 py-2 bg-white/5 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                                                errors.adminName ? 'border-red-500' : 'border-white/10'
                                            }`}
                                            placeholder={t('institution_admin.admin_name_placeholder') || 'Enter your name'}
                                        />
                                        {errors.adminName && (
                                            <p className="text-xs text-red-400 mt-1">{errors.adminName}</p>
                                        )}
                                    </div>

                                    {/* Admin Email */}
                                    <div>
                                        <label className="block text-sm font-medium text-white mb-2 flex items-center gap-2">
                                            <Mail className="w-4 h-4 text-teal-400" />
                                            {t('institution_admin.admin_email') || 'Admin Email'}
                                        </label>
                                        <input
                                            type="email"
                                            value={profileData.adminEmail}
                                            onChange={(e) => handleProfileChange('adminEmail', e.target.value)}
                                            className={`w-full px-4 py-2 bg-white/5 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                                                errors.adminEmail ? 'border-red-500' : 'border-white/10'
                                            }`}
                                            placeholder={t('institution_admin.admin_email_placeholder') || 'Enter your email'}
                                        />
                                        {errors.adminEmail && (
                                            <p className="text-xs text-red-400 mt-1">{errors.adminEmail}</p>
                                        )}
                                    </div>

                                    {/* Institution Email (Read-only) */}
                                    <div>
                                        <label className="block text-sm font-medium text-white mb-2 flex items-center gap-2">
                                            <Mail className="w-4 h-4 text-gray-400" />
                                            {t('institution_admin.institution_email') || 'Institution Email'}
                                        </label>
                                        <input
                                            type="email"
                                            value={institution?.email || ''}
                                            disabled
                                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-400 cursor-not-allowed"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            {t('institution_admin.institution_email_readonly') || 'Institution email cannot be changed'}
                                        </p>
                                    </div>

                                    <div className="flex justify-end pt-4 border-t border-white/10">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="flex items-center gap-2 px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Save className="w-4 h-4" />
                                            {loading ? (t('institution_admin.saving') || 'Saving...') : (t('institution_admin.save_profile') || 'Save Profile')}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* Change Password Tab */}
                            {activeTab === 'password' && (
                                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                                    {/* Current Password */}
                                    <div>
                                        <label className="block text-sm font-medium text-white mb-2 flex items-center gap-2">
                                            <Lock className="w-4 h-4 text-teal-400" />
                                            {t('institution_admin.current_password') || 'Current Password'}
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showCurrentPassword ? 'text' : 'password'}
                                                value={passwordData.currentPassword}
                                                onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                                                className={`w-full px-4 py-2 pr-10 bg-white/5 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                                                    errors.currentPassword ? 'border-red-500' : 'border-white/10'
                                                }`}
                                                placeholder={t('institution_admin.current_password_placeholder') || 'Enter current password'}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                            >
                                                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        {errors.currentPassword && (
                                            <p className="text-xs text-red-400 mt-1">{errors.currentPassword}</p>
                                        )}
                                    </div>

                                    {/* New Password */}
                                    <div>
                                        <label className="block text-sm font-medium text-white mb-2 flex items-center gap-2">
                                            <Lock className="w-4 h-4 text-teal-400" />
                                            {t('institution_admin.new_password') || 'New Password'}
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showNewPassword ? 'text' : 'password'}
                                                value={passwordData.newPassword}
                                                onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                                                className={`w-full px-4 py-2 pr-10 bg-white/5 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                                                    errors.newPassword ? 'border-red-500' : 'border-white/10'
                                                }`}
                                                placeholder={t('institution_admin.new_password_placeholder') || 'Enter new password'}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                            >
                                                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        {errors.newPassword && (
                                            <p className="text-xs text-red-400 mt-1">{errors.newPassword}</p>
                                        )}
                                        <p className="text-xs text-gray-400 mt-1">
                                            {t('institution_admin.password_min_8_chars') || 'Password must be at least 8 characters long'}
                                        </p>
                                    </div>

                                    {/* Confirm Password */}
                                    <div>
                                        <label className="block text-sm font-medium text-white mb-2 flex items-center gap-2">
                                            <Lock className="w-4 h-4 text-teal-400" />
                                            {t('institution_admin.confirm_password') || 'Confirm New Password'}
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                value={passwordData.confirmPassword}
                                                onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                                                className={`w-full px-4 py-2 pr-10 bg-white/5 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                                                    errors.confirmPassword ? 'border-red-500' : 'border-white/10'
                                                }`}
                                                placeholder={t('institution_admin.confirm_password_placeholder') || 'Confirm new password'}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                            >
                                                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        {errors.confirmPassword && (
                                            <p className="text-xs text-red-400 mt-1">{errors.confirmPassword}</p>
                                        )}
                                    </div>

                                    <div className="flex justify-end pt-4 border-t border-white/10">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="flex items-center gap-2 px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Lock className="w-4 h-4" />
                                            {loading ? (t('institution_admin.changing') || 'Changing...') : (t('institution_admin.change_password') || 'Change Password')}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ProfileModal;

