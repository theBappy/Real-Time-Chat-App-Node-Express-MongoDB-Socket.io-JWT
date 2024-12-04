require('dotenv').config();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const setupSocket = require('./modularize/socket');
const connectDB = require('./data/connect');
const Group = require('./models/group-model');

// Routes
const authRoutes = require('./routes/auth');
const protectedMessage = require('./routes/chatRoutes');
const messageRoutes = require('./routes/messageRoutes');
const userRoutes = require('./routes/userRoutes');
const groupRoutes = require('./routes/group-routes');
const ensureUploadsDirectory = require('./config/upload');


// Validate required environment variables
['MONGO_URI', 'JWT_SECRET', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'].forEach((key) => {
    if (!process.env[key]) {
        throw new Error(`${key} not set in environment variables.`);
    }
});

const app = express();
app.use(express.json()); // Middleware for parsing JSON
app.use(express.urlencoded({ extended: true })); // Middleware for parsing URL-encoded form data

// CORS
app.use(cors({
    origin: ['http://localhost:3000', 'https://your-production-url.com'],
    methods: ['GET', 'POST'],
}));

// Serve static assets
app.use(express.static('public')); 

// Ensure uploads directory exists before setting up routes
ensureUploadsDirectory();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', protectedMessage);
app.use('/api/chat', messageRoutes);
app.use('/api/users', userRoutes);
app.use('/api/groups', groupRoutes);

// Serve HTML pages
app.get('/api/auth/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});
app.get('/api/auth/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});
app.get('/api/users/profile', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'profile.html'));
});
app.get('/api/groups/user/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const groups = await Group.find({ userId }); // Example, depending on your database model
        res.json(groups);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching groups' });
    }
});

// 404 Error handling (for undefined routes)
app.use((req, res, next) => {
    res.status(404).json({ error: 'Route not found' });
});

// Centralized error-handling middleware
app.use((err, req, res, next) => {
    console.error(`Error occurred in ${req.method} ${req.url}:`, err.stack);
    res.status(500).json({ error: 'Internal server error' });
});

// Setup and start server
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ['http://localhost:3000', 'https://your-production-url.com'],
        methods: ['GET', 'POST'],
    },
});

// Initialize Socket.IO
setupSocket(io);

const port = 3000;

const start = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await connectDB(process.env.MONGO_URI); // Connect to MongoDB
        server.listen(port, () => {
            console.log(`Server is listening on port ${port}...`);
        });
    } catch (error) {
        console.error('Error starting server:', error);
    }
};

start();




