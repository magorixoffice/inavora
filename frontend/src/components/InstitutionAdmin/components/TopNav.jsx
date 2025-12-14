import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Presentation, Plus, Lock, User, ChevronDown, Settings, LogOut } from 'lucide-react';
import LanguageSelector from '../../common/LanguageSelector/LanguageSelector';
import { JoinPresentationDialog } from '../../common/JoinPresentationDialog';
import { useState, useRef, useEffect } from 'react';

const TopNav = ({ institution, onLogout, onOpenProfile }) => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const profileMenuRef = useRef(null);

    // Close profile menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
                setIsProfileMenuOpen(false);
            }
        };

        if (isProfileMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isProfileMenuOpen]);

    const getInitials = (name) => {
        if (!name) return 'A';
        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-[#0f172a]/80 border-b border-white/5">
                <div className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div
                            className="flex items-center gap-3 cursor-pointer"
                            onClick={() => navigate('/')}
                        >
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                <span className="text-xl font-bold text-white">𝑖</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">Inavora</span>
                                <span className="text-xs text-gray-400">{institution?.name || 'Institution Admin'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <LanguageSelector />
                        <button
                            onClick={() => setIsJoinDialogOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-teal-400 hover:text-teal-300 hover:bg-teal-500/10 rounded-lg transition-colors"
                        >
                            <Presentation className="w-4 h-4" />
                            <span className="hidden sm:inline">{t('institution_admin.join_presentation')}</span>
                        </button>
                        <button
                            onClick={() => navigate('/presentation/new', { state: { fromInstitutionAdmin: true } })}
                            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-teal-500 text-white text-sm font-medium rounded-lg hover:shadow-lg hover:shadow-teal-500/25 transition-all"
                        >
                            <Plus className="w-4 h-4" />
                            <span className="hidden sm:inline">{t('institution_admin.new_presentation')}</span>
                        </button>
                        
                        {/* Profile Dropdown */}
                        <div className="relative" ref={profileMenuRef}>
                            <button
                                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-blue-500 flex items-center justify-center text-white text-sm font-semibold">
                                    {getInitials(institution?.adminName)}
                                </div>
                                <span className="hidden md:inline max-w-[120px] truncate">
                                    {institution?.adminName || 'Admin'}
                                </span>
                                <ChevronDown className={`w-4 h-4 transition-transform ${isProfileMenuOpen ? 'transform rotate-180' : ''}`} />
                            </button>

                            {/* Profile Dropdown Menu */}
                            {isProfileMenuOpen && (
                                <div className="absolute right-0 mt-2 w-56 bg-[#1e293b] border border-white/10 rounded-lg shadow-xl overflow-hidden">
                                    <div className="p-4 border-b border-white/10">
                                        <p className="text-sm font-semibold text-white truncate">
                                            {institution?.adminName || 'Admin'}
                                        </p>
                                        <p className="text-xs text-gray-400 truncate mt-1">
                                            {institution?.adminEmail || ''}
                                        </p>
                                    </div>
                                    <div className="py-1">
                                        <button
                                            onClick={() => {
                                                setIsProfileMenuOpen(false);
                                                if (onOpenProfile) onOpenProfile();
                                            }}
                                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                                        >
                                            <User className="w-4 h-4" />
                                            {t('institution_admin.profile') || 'Profile'}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsProfileMenuOpen(false);
                                                onLogout();
                                            }}
                                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            {t('institution_admin.logout')}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>
            {isJoinDialogOpen && (
                <JoinPresentationDialog onCancel={() => setIsJoinDialogOpen(false)} />
            )}
        </>
    );
};

export default TopNav;
