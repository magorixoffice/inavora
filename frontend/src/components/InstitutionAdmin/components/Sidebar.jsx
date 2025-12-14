import { useTranslation } from 'react-i18next';
import {
    BarChart3,
    Users,
    Presentation,
    TrendingUp,
    CreditCard,
    Palette,
    History,
    Key,
    Settings,
    HelpCircle
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab }) => {
    const { t } = useTranslation();

    const tabs = [
        { id: 'dashboard', label: t('navbar.dashboard'), icon: BarChart3 },
        { id: 'users', label: t('institution_admin.users_label'), icon: Users },
        { id: 'presentations', label: t('institution_admin.presentations_title'), icon: Presentation },
        { id: 'analytics', label: t('institution_admin.analytics_title'), icon: TrendingUp },
        { id: 'subscription', label: t('institution_admin.subscription_billing'), icon: CreditCard },
        { id: 'branding', label: t('institution_admin.custom_branding'), icon: Palette },
        { id: 'audit', label: t('institution_admin.audit_logs'), icon: History },
        { id: 'api', label: t('institution_admin.api_management'), icon: Key },
        { id: 'settings', label: t('institution_admin.settings_title'), icon: Settings },
        { id: 'help', label: t('institution_admin.help_center'), icon: HelpCircle }
    ];

    return (
        <aside className="fixed left-0 top-16 bottom-0 w-64 backdrop-blur-md bg-[#0f172a]/80 border-r border-white/5 overflow-y-auto scrollbar-hide">
            <nav className="p-4 space-y-1">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all ${
                                activeTab === tab.id
                                    ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            }`}
                        >
                            <Icon className="w-5 h-5" />
                            <span>{tab.label}</span>
                        </button>
                    );
                })}
            </nav>
        </aside>
    );
};

export default Sidebar;

