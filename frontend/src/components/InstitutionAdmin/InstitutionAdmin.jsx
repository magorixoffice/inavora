import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { useInstitutionAdmin } from './hooks/useInstitutionAdmin';
import Sidebar from './components/Sidebar';
import TopNav from './components/TopNav';
import {
    Dashboard,
    Users,
    Presentations,
    Analytics,
    Subscription,
    Branding,
    AuditLogs,
    APIManagement,
    Settings,
    HelpCenter
} from './tabs';
import AddUserModal from './components/modals/AddUserModal';
import PaymentModal from './components/modals/PaymentModal';
import BulkImportModal from './components/modals/BulkImportModal';
import ReportsModal from './components/modals/ReportsModal';
import ApiKeyModal from './components/modals/ApiKeyModal';
import WebhookModal from './components/modals/WebhookModal';
import ProfileModal from './components/modals/ProfileModal';
import { useInstitutionAdminData } from './hooks/useInstitutionAdminData';

const InstitutionAdmin = () => {
    const { t } = useTranslation();
    const [searchParams, setSearchParams] = useSearchParams();
    const tabFromUrl = searchParams.get('tab') || 'dashboard';
    const [activeTab, setActiveTab] = useState(tabFromUrl);

    // Update URL when tab changes
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setSearchParams({ tab });
    };

    // Sync with URL on mount (when component first loads or URL changes externally)
    useEffect(() => {
        const urlTab = searchParams.get('tab') || 'dashboard';
        if (urlTab !== activeTab) {
            setActiveTab(urlTab);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);
    
    const {
        isAuthenticated,
        institution,
        stats,
        loading,
        adminUserId,
        fetchStats,
        handleLogout
    } = useInstitutionAdmin();

    const {
        // Users
        users,
        usersLoading,
        usersPage,
        setUsersPage,
        usersPagination,
        searchQuery,
        setSearchQuery,
        userFilter,
        setUserFilter,
        dateRange,
        setDateRange,
        fetchUsers,
        handleRemoveUser,
        handleAddUser,
        handleExport,
        newUser,
        setNewUser,
        
        // Presentations
        presentations,
        presentationsLoading,
        currentPage,
        setCurrentPage,
        pagination,
        presentationStatus,
        setPresentationStatus,
        showMyPresentations,
        setShowMyPresentations,
        fetchPresentations,
        
        // Analytics
        analytics,
        analyticsPeriod,
        setAnalyticsPeriod,
        fetchAnalytics,
        
        // Audit Logs
        auditLogs,
        auditLogsLoading,
        fetchAuditLogs,
        
        // Branding
        branding,
        setBranding,
        handleUpdateBranding,
        
        // Settings
        settings,
        setSettings,
        securitySettings,
        setSecuritySettings,
        handleUpdateSettings,
        handleUpdateSecuritySettings,
        
        // API Management
        apiKeys,
        webhooks,
        fetchApiKeys,
        fetchWebhooks,
        handleCreateApiKey,
        handleDeleteApiKey,
        handleCreateWebhook,
        handleDeleteWebhook,
        newApiKey,
        setNewApiKey,
        newWebhook,
        setNewWebhook,
        
        // Modals
        isAddUserModalOpen,
        setIsAddUserModalOpen,
        isPaymentModalOpen,
        setIsPaymentModalOpen,
        isBulkImportModalOpen,
        setIsBulkImportModalOpen,
        isReportsModalOpen,
        setIsReportsModalOpen,
        isApiKeyModalOpen,
        setIsApiKeyModalOpen,
        isWebhookModalOpen,
        setIsWebhookModalOpen,
        
        // Payment
        pendingEmails,
        paymentLoading,
        handlePayment,
        userValidation,
        setUserValidation,
        
        // Profile
        handleUpdateProfile,
        handleChangePassword
    } = useInstitutionAdminData({
        adminUserId,
        fetchStats
    });

    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

    // Hide body scrollbar when component is mounted
    useEffect(() => {
        document.body.style.overflow = 'auto';
        document.body.classList.add('scrollbar-hide');
        return () => {
            document.body.classList.remove('scrollbar-hide');
        };
    }, []);

    // Update page title based on active tab
    useEffect(() => {
        const tabTitles = {
            dashboard: t('institution_admin.dashboard_overview'),
            users: t('institution_admin.user_management'),
            presentations: t('institution_admin.presentations_title'),
            analytics: t('institution_admin.analytics_title'),
            subscription: t('institution_admin.subscription_billing'),
            branding: t('institution_admin.custom_branding'),
            audit: t('institution_admin.audit_logs'),
            api: t('institution_admin.api_management'),
            settings: t('institution_admin.settings_title'),
            help: t('institution_admin.help_center')
        };
        
        const tabTitle = tabTitles[activeTab] || t('page_titles.institution_admin');
        document.title = `${tabTitle} - Inavora`;
        
        return () => {
            document.title = t('page_titles.institution_admin');
        };
    }, [activeTab, t]);

    // Fetch data when tab changes
    useEffect(() => {
        if (!isAuthenticated) return;
        
        if (activeTab === 'dashboard') {
            fetchStats();
        } else if (activeTab === 'users') {
            fetchUsers();
        } else if (activeTab === 'presentations') {
            fetchPresentations();
        } else if (activeTab === 'analytics') {
            fetchAnalytics();
        } else if (activeTab === 'audit') {
            fetchAuditLogs();
        } else if (activeTab === 'api') {
            fetchApiKeys();
            fetchWebhooks();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab, isAuthenticated, currentPage, usersPage, searchQuery, presentationStatus, analyticsPeriod]);

    // Show loading or redirect if not authenticated
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-[#0f172a] text-white overflow-x-hidden font-sans flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="w-8 h-8 border-2 border-teal-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400">{t('institution_admin.redirecting_to_login')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0f172a] text-white overflow-x-hidden font-sans scrollbar-hide">
            {/* Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/20 blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-teal-600/10 blur-[120px] animate-pulse delay-1000" />
            </div>

            {/* Top Navigation Bar */}
            <TopNav 
                institution={institution} 
                onLogout={handleLogout}
                onOpenProfile={() => setIsProfileModalOpen(true)}
            />

            <div className="flex pt-16 relative z-10">
                {/* Sidebar Navigation */}
                <Sidebar activeTab={activeTab} setActiveTab={handleTabChange} />

                {/* Main Content */}
                <main className="flex-1 ml-64 p-8 relative z-10">
                    {activeTab === 'dashboard' && (
                        <Dashboard
                            stats={stats}
                            onAddUser={() => setIsAddUserModalOpen(true)}
                            onExport={handleExport}
                            onSetActiveTab={setActiveTab}
                            onOpenReportsModal={() => setIsReportsModalOpen(true)}
                            onOpenCustomReportModal={() => {}}
                        />
                    )}

                    {activeTab === 'users' && (
                        <Users
                            users={users}
                            usersLoading={usersLoading}
                            usersPage={usersPage}
                            setUsersPage={setUsersPage}
                            usersPagination={usersPagination}
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                            userFilter={userFilter}
                            setUserFilter={setUserFilter}
                            dateRange={dateRange}
                            setDateRange={setDateRange}
                            onAddUser={() => setIsAddUserModalOpen(true)}
                            onBulkImport={() => setIsBulkImportModalOpen(true)}
                            onRemoveUser={handleRemoveUser}
                            onFetchUsers={fetchUsers}
                        />
                    )}

                    {activeTab === 'presentations' && (
                        <Presentations
                            presentations={presentations}
                            presentationsLoading={presentationsLoading}
                            currentPage={currentPage}
                            setCurrentPage={setCurrentPage}
                            pagination={pagination}
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                            presentationStatus={presentationStatus}
                            setPresentationStatus={setPresentationStatus}
                            showMyPresentations={showMyPresentations}
                            setShowMyPresentations={setShowMyPresentations}
                            adminUserId={adminUserId}
                            onFetchPresentations={fetchPresentations}
                        />
                    )}

                    {activeTab === 'analytics' && (
                        <Analytics
                            analytics={analytics}
                            analyticsPeriod={analyticsPeriod}
                            setAnalyticsPeriod={setAnalyticsPeriod}
                            onFetchAnalytics={fetchAnalytics}
                        />
                    )}

                    {activeTab === 'subscription' && (
                        <Subscription
                            institution={institution}
                            stats={stats}
                            onRefresh={fetchStats}
                        />
                    )}

                    {activeTab === 'branding' && (
                        <Branding
                            branding={branding}
                            setBranding={setBranding}
                            loading={loading}
                            onUpdateBranding={handleUpdateBranding}
                            institution={institution}
                        />
                    )}

                    {activeTab === 'audit' && (
                        <AuditLogs
                            auditLogs={auditLogs}
                            auditLogsLoading={auditLogsLoading}
                            dateRange={dateRange}
                            setDateRange={setDateRange}
                            onFetchAuditLogs={fetchAuditLogs}
                        />
                    )}

                    {activeTab === 'api' && (
                        <APIManagement
                            apiKeys={apiKeys}
                            webhooks={webhooks}
                            loading={loading}
                            onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
                            onOpenWebhookModal={() => setIsWebhookModalOpen(true)}
                            onCreateApiKey={handleCreateApiKey}
                            onDeleteApiKey={handleDeleteApiKey}
                            onCreateWebhook={handleCreateWebhook}
                            onDeleteWebhook={handleDeleteWebhook}
                            onFetchApiKeys={fetchApiKeys}
                            onFetchWebhooks={fetchWebhooks}
                        />
                    )}

                    {activeTab === 'settings' && (
                        <Settings
                            settings={settings}
                            setSettings={setSettings}
                            securitySettings={securitySettings}
                            setSecuritySettings={setSecuritySettings}
                            loading={loading}
                            onUpdateSettings={handleUpdateSettings}
                            onUpdateSecuritySettings={handleUpdateSecuritySettings}
                            institution={institution}
                        />
                    )}

                    {activeTab === 'help' && (
                        <HelpCenter />
                    )}
                </main>
            </div>

            {/* Modals */}
            <AddUserModal
                isOpen={isAddUserModalOpen}
                onClose={() => setIsAddUserModalOpen(false)}
                onAddUser={handleAddUser}
                loading={loading}
                newUser={newUser}
                setNewUser={setNewUser}
            />

            <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => {
                    setIsPaymentModalOpen(false);
                    setUserValidation(null);
                }}
                pendingEmails={pendingEmails}
                paymentLoading={paymentLoading}
                userValidation={userValidation}
                institution={institution}
                onPayment={handlePayment}
            />

            <BulkImportModal
                isOpen={isBulkImportModalOpen}
                onClose={() => setIsBulkImportModalOpen(false)}
                onImport={() => {}}
            />

            <ReportsModal
                isOpen={isReportsModalOpen}
                onClose={() => setIsReportsModalOpen(false)}
                onGenerate={() => {}}
                loading={loading}
            />

            <ApiKeyModal
                isOpen={isApiKeyModalOpen}
                onClose={() => setIsApiKeyModalOpen(false)}
                onCreate={handleCreateApiKey}
                loading={loading}
                newApiKey={newApiKey}
                setNewApiKey={setNewApiKey}
            />

            <WebhookModal
                isOpen={isWebhookModalOpen}
                onClose={() => setIsWebhookModalOpen(false)}
                onCreate={handleCreateWebhook}
                loading={loading}
                newWebhook={newWebhook}
                setNewWebhook={setNewWebhook}
            />

            <ProfileModal
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
                institution={institution}
                onUpdateProfile={async (profileData) => {
                    const updated = await handleUpdateProfile(profileData);
                    if (updated?.institution) {
                        // Refresh institution data
                        window.location.reload(); // Simple refresh for now
                    }
                }}
                onChangePassword={handleChangePassword}
                loading={loading}
            />
        </div>
    );
};

export default InstitutionAdmin;

