// eslint-disable-next-line
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Menu, X, Shield, Zap, Users, BarChart, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next'; // Added useTranslation import

const Enterprise = () => {
    const navigate = useNavigate();
    const { t } = useTranslation(); // Added useTranslation hook

    const features = [
        {
            icon: <Shield className="w-8 h-8" />,
            title: t('enterprise.features.security.title'),
            description: t('enterprise.features.security.description'),
            color: "text-blue-400 bg-blue-500/10"
        },
        {
            icon: <Users className="w-8 h-8" />,
            title: t('enterprise.features.management.title'),
            description: t('enterprise.features.management.description'),
            color: "text-teal-400 bg-teal-500/10"
        },
        {
            icon: <BarChart className="w-8 h-8" />,
            title: t('enterprise.features.analytics.title'),
            description: t('enterprise.features.analytics.description'),
            color: "text-orange-400 bg-orange-500/10"
        },
        {
            icon: <Zap className="w-8 h-8" />,
            title: t('enterprise.features.support.title'),
            description: t('enterprise.features.support.description'),
            color: "text-purple-400 bg-purple-500/10"
        }
    ];

    return (
        <div className="min-h-screen bg-[#0f172a] text-white overflow-x-hidden selection:bg-teal-500 selection:text-white font-sans">
            {/* Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/20 blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-teal-600/10 blur-[120px] animate-pulse delay-1000" />
            </div>

            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-40 backdrop-blur-md bg-[#0f172a]/80 border-b border-white/5">
                <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                    <div
                        className="flex items-center gap-2 cursor-pointer"
                        onClick={() => navigate('/')}
                    >
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <span className="text-xl font-bold text-white">𝑖</span>
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">{t('navbar.brand_name')}</span>
                    </div>

                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center border border-white/30 px-3 py-1 rounded-lg gap-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        {t('enterprise.back')}
                    </button>
                </div>
            </nav>

            <main className="relative z-10 pt-32 pb-20 container mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-4xl mx-auto text-center mb-20"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-8 backdrop-blur-sm">
                        <span className="text-sm font-medium text-blue-200">{t('enterprise.badge')}</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-teal-400 to-orange-400">
                        {t('enterprise.title')}
                    </h1>
                    <p className="text-xl text-gray-400 leading-relaxed max-w-2xl mx-auto mb-10">
                        {t('enterprise.description')}
                    </p>
                    <button
                        onClick={() => toast.success(t('enterprise.contact_sales'))}
                        className="px-8 py-4 bg-white text-slate-900 font-bold rounded-xl hover:bg-gray-100 transition-all text-lg"
                    >
                        {t('enterprise.contact_sales')}
                    </button>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-20">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white/5 p-8 rounded-2xl border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all group"
                        >
                            <div className={`w-16 h-16 rounded-2xl ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                {feature.icon}
                            </div>
                            <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                            <p className="text-gray-400 leading-relaxed">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>

                <div className="bg-gradient-to-br from-blue-900/20 via-teal-900/20 to-slate-900 border border-white/10 rounded-3xl p-12 text-center relative overflow-hidden max-w-5xl mx-auto">
                    <div className="relative z-10">
                        <h2 className="text-3xl font-bold mb-6">{t('enterprise.cta_title')}</h2>
                        <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
                            {t('enterprise.cta_description')}
                        </p>
                        <button
                            onClick={() => toast.success(t('enterprise.request_demo'))}
                            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-teal-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-teal-500/25 transition-all"
                        >
                            {t('enterprise.request_demo')}
                        </button>
                    </div>
                </div>
            </main>

            <footer className="border-t border-white/10 bg-[#0f172a] pt-16 pb-8">
                <div className="container mx-auto px-6 text-center">
                    <p className="text-gray-500">{t('enterprise.footer_rights')}</p>
                </div>
            </footer>
        </div>
    );
};

export default Enterprise;