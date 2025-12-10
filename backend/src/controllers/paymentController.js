const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const User = require('../models/User');
const { updateExpiredSubscriptions, getSubscriptionStatus } = require('../services/subscriptionService');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

const PLAN_PRICES = {
    'pro-monthly': { amount: 19900, currency: 'INR', durationDays: 30 },
    'pro-yearly': { amount: 99900, currency: 'INR', durationDays: 365 },
    'lifetime': { amount: 299900, currency: 'INR', durationDays: null },
    'institution': { amount: 49900, currency: 'INR', durationDays: 365 },
};

const createOrder = async (req, res) => {
    try {
        const { plan } = req.body;
        const userId = req.userId;

        if (!plan || !PLAN_PRICES[plan]) {
            return res.status(400).json({ error: 'Invalid or missing plan selected' });
        }

        // Convert userId to string (it's a MongoDB ObjectId)
        const userIdString = userId.toString();

        const planDetails = PLAN_PRICES[plan];

        const options = {
            amount: planDetails.amount,
            currency: planDetails.currency,
            receipt: `receipt_${Date.now()}_${userIdString.substring(0, 5)}`,
            notes: {
                userId: userIdString,
                plan
            }
        };

        const order = await razorpay.orders.create(options);

        res.status(200).json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId: process.env.RAZORPAY_KEY_ID,
            plan
        });
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ error: 'Failed to create order' });
    }
};

const verifyPayment = async (req, res) => {
    try {
        const {
            razorpayOrderId,
            razorpayPaymentId,
            razorpaySignature,
            plan
        } = req.body;
        const userId = req.userId;

        if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !plan) {
            return res.status(400).json({ error: 'Missing payment details' });
        }

        const body = razorpayOrderId + '|' + razorpayPaymentId;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        const isAuthentic = expectedSignature === razorpaySignature;

        if (!isAuthentic) {
            return res.status(400).json({ error: 'Invalid payment signature' });
        }

        const existingPayment = await Payment.findOne({ razorpayOrderId });
        if (existingPayment) {
            if (existingPayment.status === 'captured') {
                return res.status(200).json({ message: 'Payment already processed', subscription: null });
            }
        }

        const planDetails = PLAN_PRICES[plan];
        if (!planDetails) {
            return res.status(400).json({ error: 'Invalid plan' });
        }

        const startDate = new Date();
        let endDate = null;

        if (planDetails.durationDays) {
            endDate = new Date();
            endDate.setDate(endDate.getDate() + planDetails.durationDays);
        }

        let normalizedPlan = plan;
        let billingCycle = null;
        
        if (plan === 'pro-monthly') {
            normalizedPlan = 'pro';
            billingCycle = 'monthly';
        } else if (plan === 'pro-yearly') {
            normalizedPlan = 'pro';
            billingCycle = 'yearly';
        } else if (plan === 'lifetime') {
            billingCycle = 'lifetime';
        } else if (plan === 'institution') {
            normalizedPlan = 'institution';
            billingCycle = 'yearly';
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.subscription = {
            plan: normalizedPlan,
            status: 'active',
            startDate,
            endDate,
            billingCycle,
            razorpayCustomerId: null
        };

        await user.save();

        const payment = new Payment({
            userId,
            razorpayOrderId,
            razorpayPaymentId,
            razorpaySignature,
            amount: planDetails.amount / 100,
            currency: planDetails.currency,
            status: 'captured',
            plan: normalizedPlan,
            originalPlan: plan !== normalizedPlan ? plan : undefined
        });

        await payment.save();

        res.status(200).json({
            message: 'Payment verified and subscription updated',
            subscription: user.subscription
        });

    } catch (error) {
        console.error('Verify payment error:', error);
        res.status(500).json({ error: 'Failed to verify payment' });
    }
};

const getPaymentHistory = async (req, res) => {
    try {
        const userId = req.userId;

        const payments = await Payment.find({ userId })
            .sort({ createdAt: -1 })
            .select('-razorpaySignature')
            .lean();

        res.status(200).json({
            success: true,
            payments: payments.map(payment => ({
                id: payment._id,
                amount: payment.amount,
                currency: payment.currency,
                plan: payment.originalPlan || payment.plan,
                status: payment.status,
                orderId: payment.razorpayOrderId,
                paymentId: payment.razorpayPaymentId,
                createdAt: payment.createdAt,
                updatedAt: payment.updatedAt
            }))
        });
    } catch (error) {
        console.error('Get payment history error:', error);
        res.status(500).json({ error: 'Failed to fetch payment history' });
    }
};

const getSubscriptionStatusEndpoint = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const subscriptionStatus = getSubscriptionStatus(user.subscription);

        res.status(200).json({
            success: true,
            subscription: subscriptionStatus
        });
    } catch (error) {
        console.error('Get subscription status error:', error);
        res.status(500).json({ error: 'Failed to fetch subscription status' });
    }
};

const updateExpired = async (req, res) => {
    try {
        const secretKey = req.query.secret || req.headers['x-cron-secret'];
        const expectedSecret = process.env.CRON_SECRET_KEY || 'your-secret-cron-key-change-this';

        if (secretKey !== expectedSecret) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const result = await updateExpiredSubscriptions();

        res.status(200).json(result);
    } catch (error) {
        console.error('Update expired subscriptions error:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to update expired subscriptions' 
        });
    }
};

const handleWebhook = async (req, res) => {
    try {
        const webhookSignature = req.headers['x-razorpay-signature'];
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

        if (!webhookSecret) {
            console.error('Razorpay webhook secret not configured');
            return res.status(200).json({ received: true, error: 'Webhook secret not configured' });
        }

        const body = req.rawBody || JSON.stringify(req.body);
        
        const expectedSignature = crypto
            .createHmac('sha256', webhookSecret)
            .update(body)
            .digest('hex');

        if (webhookSignature !== expectedSignature) {
            console.error('Invalid webhook signature');
            return res.status(200).json({ received: true, error: 'Invalid signature' });
        }

        const event = req.body.event;
        const payload = req.body.payload;

        console.log('Razorpay webhook event received:', event);

        switch (event) {
            case 'payment.captured':
                const paymentId = payload.payment?.entity?.id;
                console.log('Payment captured via webhook:', paymentId);
                
                if (paymentId) {
                    const existingPayment = await Payment.findOne({ razorpayPaymentId: paymentId });
                    if (!existingPayment) {
                        console.log('Payment not found in database, may need manual verification');
                    }
                }
                break;

            case 'payment.failed':
                const failedPaymentId = payload.payment?.entity?.id;
                console.log('Payment failed via webhook:', failedPaymentId);
                
                if (failedPaymentId) {
                    await Payment.findOneAndUpdate(
                        { razorpayPaymentId: failedPaymentId },
                        { 
                            status: 'failed', 
                            error: payload.payment?.entity || { message: 'Payment failed' }
                        }
                    );
                }
                break;

            case 'order.paid':
                const orderId = payload.order?.entity?.id;
                console.log('Order paid via webhook:', orderId);
                break;

            default:
                console.log('Unhandled webhook event:', event, payload);
        }

        res.status(200).json({ received: true, event });
    } catch (error) {
        console.error('Webhook handler error:', error);
        res.status(200).json({ received: true, error: error.message });
    }
};

module.exports = {
    createOrder,
    verifyPayment,
    getPaymentHistory,
    getSubscriptionStatus: getSubscriptionStatusEndpoint,
    updateExpired,
    handleWebhook
};
