import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import {
    Users,
    Presentation,
    FileText,
    Activity,
    Plus,
    Download,
    TrendingUp,
    FileSpreadsheet
} from 'lucide-react';

const Dashboard = ({ stats, onAddUser, onExport, onSetActiveTab, onOpenReportsModal, onOpenCustomReportModal }) => {
    const { t } = useTranslation();
    const [activityFeed, setActivityFeed] = useState([]);
    const [users, setUsers] = useState([]);

    useEffect(() => {
        if (stats && (users.length > 0 || stats.recentPresentations > 0)) {
            generateActivityFeed();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stats?.totalUsers, stats?.recentPresentations, stats?.livePresentations, users.length]);

    const generateActivityFeed = () => {
        const activities = [];
        
        if (stats?.recentPresentations > 0) {
            activities.push({
                id: 'recent-presentations',
                type: 'presentation',
                message: `${stats.recentPresentations} new presentation(s) created recently`,
                timestamp: new Date(),
                icon: Presentation
            });
        }
        
        if (users.length > 0) {
            const recentUser = users[0];
            activities.push({
                id: 'recent-user',
                type: 'user',
                message: `User ${recentUser.displayName} added to institution`,
                timestamp: new Date(),
                icon: Users
            });
        }

        if (stats?.livePresentations > 0) {
            activities.push({
                id: 'live-presentations',
                type: 'activity',
                message: `${stats.livePresentations} presentation(s) currently live`,
                timestamp: new Date(),
                icon: Activity
            });
        }

        setActivityFeed(activities.slice(0, 10));
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">{t('institution_admin.dashboard_overview')}</h1>
                <p className="text-gray-400">{t('institution_admin.dashboard_description')}</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm hover:bg-white/10 transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium text-gray-400">{t('institution_admin.total_users')}</span>
                        <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                            <Users className="w-5 h-5 text-blue-400" />
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-white mb-1">{stats?.totalUsers || 0}</p>
                    <p className="text-sm text-gray-500">{stats?.activeUsers || 0} {t('institution_admin.active')}</p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm hover:bg-white/10 transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium text-gray-400">{t('institution_admin.presentations')}</span>
                        <div className="w-10 h-10 bg-teal-500/20 rounded-lg flex items-center justify-center">
                            <Presentation className="w-5 h-5 text-teal-400" />
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-white mb-1">{stats?.totalPresentations || 0}</p>
                    <p className="text-sm text-gray-500">{stats?.livePresentations || 0} {t('institution_admin.live')}</p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm hover:bg-white/10 transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium text-gray-400">{t('institution_admin.total_slides')}</span>
                        <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-purple-400" />
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-white mb-1">{stats?.totalSlides || 0}</p>
                    <p className="text-sm text-gray-500">{stats?.recentPresentations || 0} {t('institution_admin.recent')}</p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm hover:bg-white/10 transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium text-gray-400">{t('institution_admin.total_responses')}</span>
                        <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                            <Activity className="w-5 h-5 text-green-400" />
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-white mb-1">{stats?.totalResponses || 0}</p>
                    <p className="text-sm text-gray-500">{stats?.recentResponses || 0} {t('institution_admin.recent')}</p>
                </div>
            </div>

            {/* Activity Feed */}
            {activityFeed.length > 0 && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8 backdrop-blur-sm">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-teal-400" />
                        {t('institution_admin.recent_activity')}
                    </h3>
                    <div className="space-y-3">
                        {activityFeed.map((activity) => {
                            const Icon = activity.icon || Activity;
                            return (
                                <div key={activity.id} className="flex items-start gap-3 p-4 bg-black/20 rounded-lg border border-white/10">
                                    <div className="p-2 bg-teal-500/20 rounded-lg">
                                        <Icon className="w-4 h-4 text-teal-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-white font-medium">{activity.message}</p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {activity.timestamp.toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm">
                <h3 className="text-lg font-semibold text-white mb-4">{t('institution_admin.quick_actions')}</h3>
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={onAddUser}
                        className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-teal-500 text-white text-sm font-medium rounded-lg hover:shadow-lg hover:shadow-teal-500/25 transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        {t('institution_admin.add_user')}
                    </button>
                    <div className="relative group">
                        <button className="flex items-center gap-2 px-4 py-2.5 bg-white/10 border border-white/20 text-white text-sm font-medium rounded-lg hover:bg-white/20 transition-colors">
                            <Download className="w-4 h-4" />
                            {t('institution_admin.export_presentations')}
                        </button>
                        <div className="absolute left-0 top-full mt-1 w-48 bg-[#1e293b] border border-white/10 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                            <button
                                onClick={() => onExport('presentations', 'json')}
                                className="w-full text-left px-4 py-2 hover:bg-white/5 text-sm text-white rounded-t-lg"
                            >
                                {t('institution_admin.export_as_json')}
                            </button>
                            <button
                                onClick={() => onExport('presentations', 'csv')}
                                className="w-full text-left px-4 py-2 hover:bg-white/5 text-sm text-white"
                            >
                                {t('institution_admin.export_as_csv')}
                            </button>
                            <button
                                onClick={() => onExport('presentations', 'excel')}
                                className="w-full text-left px-4 py-2 hover:bg-white/5 text-sm text-white rounded-b-lg"
                            >
                                {t('institution_admin.export_as_excel')}
                            </button>
                        </div>
                    </div>
                    <div className="relative group">
                        <button className="flex items-center gap-2 px-4 py-2.5 bg-white/10 border border-white/20 text-white text-sm font-medium rounded-lg hover:bg-white/20 transition-colors">
                            <Download className="w-4 h-4" />
                            {t('institution_admin.export_users')}
                        </button>
                        <div className="absolute left-0 top-full mt-1 w-48 bg-[#1e293b] border border-white/10 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                            <button
                                onClick={() => onExport('users', 'json')}
                                className="w-full text-left px-4 py-2 hover:bg-white/5 text-sm text-white rounded-t-lg"
                            >
                                {t('institution_admin.export_as_json')}
                            </button>
                            <button
                                onClick={() => onExport('users', 'csv')}
                                className="w-full text-left px-4 py-2 hover:bg-white/5 text-sm text-white"
                            >
                                {t('institution_admin.export_as_csv')}
                            </button>
                            <button
                                onClick={() => onExport('users', 'excel')}
                                className="w-full text-left px-4 py-2 hover:bg-white/5 text-sm text-white rounded-b-lg"
                            >
                                {t('institution_admin.export_as_excel')}
                            </button>
                        </div>
                    </div>
                    <button
                        onClick={() => onSetActiveTab('analytics')}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white/10 border border-white/20 text-white text-sm font-medium rounded-lg hover:bg-white/20 transition-colors"
                    >
                        <TrendingUp className="w-4 h-4" />
                        {t('institution_admin.view_analytics')}
                    </button>
                    <button
                        onClick={onOpenReportsModal}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white/10 border border-white/20 text-white text-sm font-medium rounded-lg hover:bg-white/20 transition-colors"
                    >
                        <FileSpreadsheet className="w-4 h-4" />
                        {t('institution_admin.generate_report')}
                    </button>
                    <button
                        onClick={onOpenCustomReportModal}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white/10 border border-white/20 text-white text-sm font-medium rounded-lg hover:bg-white/20 transition-colors"
                    >
                        <FileText className="w-4 h-4" />
                        {t('institution_admin.custom_report_builder')}
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default Dashboard;

