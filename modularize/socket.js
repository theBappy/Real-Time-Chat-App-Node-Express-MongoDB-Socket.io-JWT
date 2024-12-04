const jwt = require('jsonwebtoken');
const User = require('../models/user-model');
const Message = require('../models/message-model');
const Group = require('../models/group-model');
const groupMessageSchema = require('../models/group-msg-model')

const activeUsers = new Map();

// WebSocket authentication middleware
const authenticateSocket = async (socket, next) => {
    const token = socket.handshake.query.token;

    if (!token || token === 'null') {
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
        return next(new Error('Authentication error: Invalid token'));
    }
};

const setupSocket = (io) => {
    io.use(authenticateSocket);

    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.user.username}`);
        activeUsers.set(socket.id, socket.user);

        // Notify all clients about active users
        io.emit('active users', Array.from(activeUsers.values()));

        // Handle public messages
        socket.on('chat message', async ({ content }) => {
            if (!content) return;

            try {
                const newMessage = new Message({
                    sender: socket.user.userId,
                    username: socket.user.username,
                    content,
                    isPrivate: false,
                });

                await newMessage.save();

                // Broadcast the public message
                io.emit('chat message', {
                    username: socket.user.username,
                    message: content,
                    timestamp: new Date(),
                });
            } catch (error) {
                console.error('Public message save error:', error.message);
                socket.emit('error', { message: 'Failed to send public message' });
            }
        });

        // Handle private messages
        socket.on('private message', async ({ content, recipient }) => {
            if (!content || !recipient) {
                socket.emit('error', { message: 'Message content or recipient missing' });
                return;
            }

            try {
                const recipientUser = await User.findOne({ username: recipient }).select('_id');
                if (!recipientUser) {
                    socket.emit('error', { message: 'Recipient not found' });
                    return;
                }

                const newMessage = new Message({
                    sender: socket.user.userId,
                    username: socket.user.username,
                    content,
                    recipient: recipientUser._id,
                    isPrivate: true,
                });

                await newMessage.save();

                const recipientSocketId = Array.from(activeUsers.entries())
                    .find(([_, user]) => user.username === recipient)?.[0];

                if (recipientSocketId) {
                    io.to(recipientSocketId).emit('private message', {
                        sender: socket.user.username,
                        message: content,
                        timestamp: new Date(),
                    });
                }

                socket.emit('private message', {
                    sender: 'You',
                    message: content,
                    timestamp: new Date(),
                });
            } catch (error) {
                console.error('Private message save error:', error.message);
                socket.emit('error', { message: 'Failed to send private message' });
            }
        });

        // Handle group messages
        socket.on('group message', async ({ groupId, content }) => {
            if (!groupId || !content) return;

            try {
                const group = await Group.findById(groupId).populate('members');
                if (!group || !group.members.some(member => member._id.equals(socket.user.userId))) {
                    socket.emit('error', { message: 'You are not a member of this group' });
                    return;
                }

                const newMessage = new Message({
                    sender: socket.user.userId,
                    username: socket.user.username,
                    content,
                    group: groupId,
                    isPrivate: false,
                });

                await newMessage.save();

                group.members.forEach(member => {
                    const memberSocketId = Array.from(activeUsers.entries())
                        .find(([_, user]) => user.userId.equals(member._id))?.[0];

                    if (memberSocketId) {
                        io.to(memberSocketId).emit('group message', {
                            username: socket.user.username,
                            message: content,
                            groupId,
                            timestamp: new Date(),
                        });
                    }
                });
            } catch (error) {
                console.error('Group message error:', error.message);
                socket.emit('error', { message: 'Failed to send group message' });
            }
        });

        // Typing indicators
        socket.on('typing', () => {
            socket.broadcast.emit('typing', socket.user.username);
        });

        socket.on('stop typing', () => {
            socket.broadcast.emit('stop typing');
        });

        // Handle searching messages
        socket.on('search messages', async (query) => {
            try {
                const messages = await Message.find({
                    content: { $regex: query, $options: 'i' },
                }).populate('sender');

                socket.emit('message search results', messages);
            } catch (error) {
                console.error('Message search error:', error.message);
                socket.emit('error', { message: 'Failed to search messages' });
            }
        });

        // Handle group join/leave
        socket.on('join group', (groupId) => {
            socket.join(groupId);
        });

        socket.on('leave group', (groupId) => {
            socket.leave(groupId);
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
