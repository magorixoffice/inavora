const User = require('../models/User');

const updateExpiredSubscriptions = async () => {
    try {
        const now = new Date();
        
        const expiredSubscriptions = await User.find({
            'subscription.status': 'active',
            'subscription.plan': { $ne: 'free' },
            'subscription.plan': { $ne: 'lifetime' },
            'subscription.endDate': { $exists: true, $lt: now }
        });

        let updatedCount = 0;

        for (const user of expiredSubscriptions) {
            user.subscription.status = 'expired';
            await user.save();
            updatedCount++;
        }

        return {
            success: true,
            updatedCount,
            message: `Updated ${updatedCount} expired subscription(s)`
        };
    } catch (error) {
        console.error('Error updating expired subscriptions:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

const isSubscriptionActive = (subscription) => {
    if (!subscription || subscription.plan === 'free') {
        return false;
    }

    if (subscription.status !== 'active') {
        return false;
    }

    if (subscription.plan === 'lifetime') {
        return true;
    }

    if (subscription.endDate) {
        const now = new Date();
        const endDate = new Date(subscription.endDate);
        if (endDate < now) {
            return false;
        }
    }

    return true;
};

const getSubscriptionStatus = (subscription) => {
    const isActive = isSubscriptionActive(subscription);
    
    let daysRemaining = null;
    if (subscription?.endDate && subscription.plan !== 'lifetime') {
        const now = new Date();
        const endDate = new Date(subscription.endDate);
        const diffTime = endDate - now;
        daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    return {
        isActive,
        plan: subscription?.plan || 'free',
        status: subscription?.status || 'active',
        startDate: subscription?.startDate,
        endDate: subscription?.endDate,
        daysRemaining: daysRemaining !== null ? Math.max(0, daysRemaining) : null,
        isExpired: subscription?.endDate && new Date(subscription.endDate) < new Date(),
        isLifetime: subscription?.plan === 'lifetime'
    };
};

module.exports = {
    updateExpiredSubscriptions,
    isSubscriptionActive,
    getSubscriptionStatus
};

