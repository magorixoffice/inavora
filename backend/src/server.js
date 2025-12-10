// Load environment variables silently
// Suppress dotenv verbose output
process.env.DOTENV_CONFIG_DEBUG = 'false';
require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const Logger = require('./utils/logger');
const connectDB = require('./config/database');
const initializeFirebase = require('./config/firebase');
const authRoutes = require('./routes/authRoutes');
const presentationRoutes = require('./routes/presentationRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const careersRoutes = require('./routes/careersRoutes');
const jobPostingRoutes = require('./routes/jobPostingRoutes');
const superAdminRoutes = require('./routes/superAdminRoutes');
const institutionAdminRoutes = require('./routes/institutionAdminRoutes');
const setupSocketHandlers = require('./socket/socketHandlers');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: [`${process.env.FRONTEND_URL}`],
        methods: ['GET', 'POST']
    }
});

const PORT = process.env.PORT || 4001;

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' })); // Increase limit for base64 images
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Make io accessible to routes
app.set('io', io);

// Routes
app.get('/', (req, res) => {
    res.json({
        message: 'welcome to Inavora! All systems are Healthy :)',
        status: 'running'
    });
});

app.use('/api/auth', authRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/presentations', presentationRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/careers', careersRoutes);
app.use('/api/job-postings', jobPostingRoutes);
app.use('/api/super-admin', superAdminRoutes);
app.use('/api/institution-admin', institutionAdminRoutes);

// Setup Socket.IO handlers
io.on('connection', (socket) => {
    Logger.debug(`Client connected: ${socket.id}`);
    setupSocketHandlers(io, socket);
});

// Initialize services
const startServer = async () => {
    try {
        await connectDB();
        initializeFirebase();
        
        server.listen(PORT, () => {
            console.log('\n' + '='.repeat(50));
            Logger.startup('Server initialized successfully');
            Logger.info(`Server running on port ${PORT}`);
            Logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
            Logger.info(`Socket.IO ready for connections`);
            console.log('='.repeat(50) + '\n');
        });
    } catch (error) {
        Logger.error('Failed to start server', error);
        process.exit(1);
    }
};

startServer();
