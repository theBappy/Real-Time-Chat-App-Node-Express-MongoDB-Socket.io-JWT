const jwt = require('jsonwebtoken');
const User = require('../models/user-model');
const Message = require('../models/message-model');

const activeUsers = new Map();

// WebSocket authentication middleware
const authenticateSocket = async (socket, next) => {
    const token = socket.handshake.query.token;
    console.log('Token from client:', token);

    if (!token || token === 'null') {
        console.error('Token is missing or invalid');
        return next(new Error('Authentication error: Token missing or malformed'));
    }    

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);

        if (!user) {
            return next(new Error('Authentication error: User not found'));
        }

        socket.user = {
            userId: user._id, 
            username: user.username,
        };

        next();
    } catch (error) {
        console.error('Authentication error:', error.message);
        next(new Error('Authentication error: Invalid token'));
    }
};

const setupSocket = (io) => {
    io.use(authenticateSocket);

    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.user.username}`);
        activeUsers.set(socket.id, socket.user);

        // Notify all clients about active users
        io.emit('active users', Array.from(activeUsers.values()));

        // Handle username setup
        socket.on('set username', async (username) => {
            if (!username || username.trim() === '') {
                socket.emit('username error', 'Invalid username.');
                return;
            }

            socket.user.username = username;
            activeUsers.set(socket.id, socket.user);

            io.emit('active users', Array.from(activeUsers.values()));
            socket.emit('username set');
        });

        // Handle public messages
        socket.on('chat message', async ({ content, recipient }) => {
            try {
                if (!content) return;
        
                const newMessage = new Message({
                    sender: socket.user.userId, // Use ObjectId
                    username: socket.user.username, // Attach username
                    content,
                    recipient: recipient || 'public', // Default to public
                    isPrivate: !!recipient, // True if recipient is specified
                });
        
                await newMessage.save();
                io.emit('new message', newMessage);
            } catch (error) {
                console.error('Message save error:', error.message);
                socket.emit('error', { message: 'Failed to send message' });
            }
        });
        ;

        // Typing indicators
        socket.on('typing', () => {
            socket.broadcast.emit('typing', socket.user.username);
        });

        socket.on('stop typing', () => {
            socket.broadcast.emit('stop typing', socket.user.username);
        });

        // Handle disconnect
        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.user?.username || 'Unknown'}`);
            activeUsers.delete(socket.id);
            io.emit('active users', Array.from(activeUsers.values()));
        });
    });
};

module.exports = setupSocket;