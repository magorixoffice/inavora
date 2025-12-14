import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import {
    Palette,
    Image,
    Globe,
    Save,
    Eye,
    Upload,
    X,
    CheckCircle,
    AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const Branding = ({ branding, setBranding, loading, onUpdateBranding, institution }) => {
    const { t } = useTranslation();
    const [previewMode, setPreviewMode] = useState(false);
    const [logoPreview, setLogoPreview] = useState(null);
    const [logoError, setLogoError] = useState(false);

    // Initialize branding from institution when available
    useEffect(() => {
        if (institution?.branding) {
            setBranding({
                primaryColor: institution.branding.primaryColor || '#3b82f6',
                secondaryColor: institution.branding.secondaryColor || '#14b8a6',
                logoUrl: institution.branding.logoUrl || '',
                customDomain: institution.branding.customDomain || ''
            });
            if (institution.branding.logoUrl) {
                setLogoPreview(institution.branding.logoUrl);
            }
        }
    }, [institution, setBranding]);

    // Update logo preview when logoUrl changes
    useEffect(() => {
        if (branding.logoUrl) {
            setLogoPreview(branding.logoUrl);
            setLogoError(false);
        } else {
            setLogoPreview(null);
        }
    }, [branding.logoUrl]);

    const handleColorChange = (field, value) => {
        setBranding(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleLogoUrlChange = (e) => {
        const url = e.target.value;
        setBranding(prev => ({
            ...prev,
            logoUrl: url
        }));
    };

    const handleLogoError = () => {
        setLogoError(true);
        setLogoPreview(null);
    };

    const handleLogoLoad = () => {
        setLogoError(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate colors
        const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
        if (!colorRegex.test(branding.primaryColor)) {
            toast.error(t('institution_admin.invalid_primary_color') || 'Invalid primary color format');
            return;
        }
        if (!colorRegex.test(branding.secondaryColor)) {
            toast.error(t('institution_admin.invalid_secondary_color') || 'Invalid secondary color format');
            return;
        }

        // Validate custom domain if provided
        if (branding.customDomain && branding.customDomain.trim() !== '') {
            const domainRegex = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i;
            if (!domainRegex.test(branding.customDomain.trim())) {
                toast.error(t('institution_admin.invalid_domain_format') || 'Invalid domain format');
                return;
            }
        }

        await onUpdateBranding(e);
    };

    const resetToDefaults = () => {
        setBranding({
            primaryColor: '#3b82f6',
            secondaryColor: '#14b8a6',
            logoUrl: '',
            customDomain: ''
        });
        setLogoPreview(null);
        setLogoError(false);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8"
        >
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-white mb-2">
                    {t('institution_admin.custom_branding')}
                </h1>
                <p className="text-gray-400">
                    {t('institution_admin.customize_branding')}
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Branding Settings Form */}
                <div className="lg:col-span-2 space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Primary Color */}
                        <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm">
                            <label className="block text-sm font-medium text-white mb-3 flex items-center gap-2">
                                <Palette className="w-4 h-4 text-teal-400" />
                                {t('institution_admin.primary_color')}
                            </label>
                            <div className="flex items-center gap-4">
                                <input
                                    type="color"
                                    value={branding.primaryColor}
                                    onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                                    className="w-20 h-12 rounded-lg border border-white/20 cursor-pointer bg-transparent"
                                />
                                <input
                                    type="text"
                                    value={branding.primaryColor}
                                    onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                                    className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    placeholder="#3b82f6"
                                />
                            </div>
                            <p className="text-xs text-gray-400 mt-2">
                                {t('institution_admin.primary_color_desc') || 'Main brand color used throughout the platform'}
                            </p>
                        </div>

                        {/* Secondary Color */}
                        <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm">
                            <label className="block text-sm font-medium text-white mb-3 flex items-center gap-2">
                                <Palette className="w-4 h-4 text-teal-400" />
                                {t('institution_admin.secondary_color')}
                            </label>
                            <div className="flex items-center gap-4">
                                <input
                                    type="color"
                                    value={branding.secondaryColor}
                                    onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                                    className="w-20 h-12 rounded-lg border border-white/20 cursor-pointer bg-transparent"
                                />
                                <input
                                    type="text"
                                    value={branding.secondaryColor}
                                    onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                                    className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    placeholder="#14b8a6"
                                />
                            </div>
                            <p className="text-xs text-gray-400 mt-2">
                                {t('institution_admin.secondary_color_desc') || 'Accent color for highlights and secondary elements'}
                            </p>
                        </div>

                        {/* Logo URL */}
                        <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm">
                            <label className="block text-sm font-medium text-white mb-3 flex items-center gap-2">
                                <Image className="w-4 h-4 text-teal-400" />
                                {t('institution_admin.logo_url')}
                            </label>
                            <input
                                type="url"
                                value={branding.logoUrl}
                                onChange={handleLogoUrlChange}
                                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                placeholder="https://example.com/logo.png"
                            />
                            <p className="text-xs text-gray-400 mt-2">
                                {t('institution_admin.logo_url_desc') || 'Enter the URL of your institution logo (PNG, JPG, or SVG)'}
                            </p>
                            
                            {/* Logo Preview */}
                            {logoPreview && !logoError && (
                                <div className="mt-4 p-4 bg-white/5 border border-white/10 rounded-lg">
                                    <p className="text-xs text-gray-400 mb-2">Preview:</p>
                                    <div className="flex items-center justify-center p-4 bg-white/5 rounded-lg">
                                        <img
                                            src={logoPreview}
                                            alt="Logo preview"
                                            onError={handleLogoError}
                                            onLoad={handleLogoLoad}
                                            className="max-h-24 max-w-full object-contain"
                                        />
                                    </div>
                                </div>
                            )}
                            
                            {logoError && (
                                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 text-red-400" />
                                    <p className="text-xs text-red-400">
                                        {t('institution_admin.logo_load_error') || 'Failed to load logo. Please check the URL.'}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Custom Domain */}
                        <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm">
                            <label className="block text-sm font-medium text-white mb-3 flex items-center gap-2">
                                <Globe className="w-4 h-4 text-teal-400" />
                                {t('institution_admin.custom_domain')}
                            </label>
                            <input
                                type="text"
                                value={branding.customDomain}
                                onChange={(e) => setBranding(prev => ({ ...prev, customDomain: e.target.value }))}
                                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                placeholder={t('institution_admin.custom_domain_placeholder')}
                            />
                            <p className="text-xs text-gray-400 mt-2">
                                {t('institution_admin.custom_domain_desc') || 'Optional: Set up a custom domain for your institution presentations (e.g., presentations.yourinstitution.com)'}
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex items-center gap-2 px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Save className="w-4 h-4" />
                                {loading ? (t('institution_admin.saving') || 'Saving...') : (t('institution_admin.save_branding') || 'Save Branding')}
                            </button>
                            
                            <button
                                type="button"
                                onClick={resetToDefaults}
                                disabled={loading}
                                className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <X className="w-4 h-4" />
                                {t('institution_admin.reset_to_defaults') || 'Reset to Defaults'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Preview Panel */}
                <div className="lg:col-span-1">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm sticky top-24">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <Eye className="w-5 h-5 text-teal-400" />
                                {t('institution_admin.preview') || 'Preview'}
                            </h3>
                            <button
                                onClick={() => setPreviewMode(!previewMode)}
                                className="text-xs text-gray-400 hover:text-white transition-colors"
                            >
                                {previewMode ? t('institution_admin.hide_preview') || 'Hide' : t('institution_admin.show_preview') || 'Show'}
                            </button>
                        </div>

                        {previewMode && (
                            <div className="space-y-4">
                                {/* Preview Card */}
                                <div 
                                    className="rounded-lg p-6 border-2 transition-all"
                                    style={{
                                        borderColor: branding.primaryColor,
                                        backgroundColor: `${branding.primaryColor}15`
                                    }}
                                >
                                    {/* Logo Preview */}
                                    {logoPreview && !logoError ? (
                                        <div className="mb-4 flex justify-center">
                                            <img
                                                src={logoPreview}
                                                alt="Logo"
                                                className="max-h-16 max-w-full object-contain"
                                                onError={handleLogoError}
                                            />
                                        </div>
                                    ) : (
                                        <div className="mb-4 flex justify-center">
                                            <div 
                                                className="w-16 h-16 rounded-lg flex items-center justify-center text-white font-bold text-xl"
                                                style={{ backgroundColor: branding.primaryColor }}
                                            >
                                                {institution?.name?.charAt(0)?.toUpperCase() || 'I'}
                                            </div>
                                        </div>
                                    )}

                                    {/* Institution Name */}
                                    <h4 className="text-lg font-semibold text-white mb-2 text-center">
                                        {institution?.name || 'Institution Name'}
                                    </h4>

                                    {/* Color Swatches */}
                                    <div className="flex gap-2 justify-center mt-4">
                                        <div
                                            className="w-8 h-8 rounded-full border-2 border-white/20"
                                            style={{ backgroundColor: branding.primaryColor }}
                                            title="Primary Color"
                                        />
                                        <div
                                            className="w-8 h-8 rounded-full border-2 border-white/20"
                                            style={{ backgroundColor: branding.secondaryColor }}
                                            title="Secondary Color"
                                        />
                                    </div>

                                    {/* Sample Button */}
                                    <button
                                        className="w-full mt-4 py-2 rounded-lg text-white font-medium transition-all"
                                        style={{ backgroundColor: branding.primaryColor }}
                                        onMouseEnter={(e) => {
                                            e.target.style.opacity = '0.9';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.opacity = '1';
                                        }}
                                    >
                                        {t('institution_admin.sample_button') || 'Sample Button'}
                                    </button>

                                    {/* Secondary Button */}
                                    <button
                                        className="w-full mt-2 py-2 rounded-lg font-medium transition-all border-2"
                                        style={{
                                            borderColor: branding.secondaryColor,
                                            color: branding.secondaryColor,
                                            backgroundColor: 'transparent'
                                        }}
                                    >
                                        {t('institution_admin.sample_secondary') || 'Secondary Action'}
                                    </button>
                                </div>

                                {/* Custom Domain Info */}
                                {branding.customDomain && (
                                    <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Globe className="w-4 h-4 text-blue-400" />
                                            <p className="text-sm font-medium text-blue-400">
                                                {t('institution_admin.custom_domain')}
                                            </p>
                                        </div>
                                        <p className="text-xs text-gray-300 break-all">
                                            {branding.customDomain}
                                        </p>
                                    </div>
                                )}

                                {/* Info Note */}
                                <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                                    <p className="text-xs text-gray-400">
                                        {t('institution_admin.preview_note') || 'This is a preview of how your branding will appear to users.'}
                                    </p>
                                </div>
                            </div>
                        )}

                        {!previewMode && (
                            <div className="text-center py-8">
                                <Eye className="w-12 h-12 mx-auto mb-3 text-gray-500 opacity-50" />
                                <p className="text-sm text-gray-400">
                                    {t('institution_admin.click_to_preview') || 'Click "Show" to preview your branding'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default Branding;
