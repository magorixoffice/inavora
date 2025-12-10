const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { verifyToken } = require('../middleware/auth'); 

router.post('/webhook', 
    express.raw({ type: 'application/json' }), 
    (req, res, next) => {
        try {
            req.body = JSON.parse(req.body.toString());
            req.rawBody = req.body.toString();
        } catch (error) {
            return res.status(400).json({ error: 'Invalid JSON' });
        }
        next();
    },
    paymentController.handleWebhook
);

router.post('/update-expired', paymentController.updateExpired);

router.use(verifyToken);

router.post('/create-order', paymentController.createOrder);
router.post('/verify-payment', paymentController.verifyPayment);
router.get('/history', paymentController.getPaymentHistory);
router.get('/subscription', paymentController.getSubscriptionStatus);

module.exports = router;
