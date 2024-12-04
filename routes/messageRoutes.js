const express = require('express');
const mongoose = require('mongoose');
const authenticate = require('../middleware/auth');
const upload = require('../middleware/upload'); // Existing multer middleware
const Message = require('../models/message-model');
const User = require('../models/user-model'); // For recipient validation
const router = express.Router();

// Create a new message (text or media)
router.post('/messages', authenticate, upload.single('media'), async (req, res) => {
    try {
        let { content, recipient } = req.body;
        let mediaUrl = null;
        let mediaType = null;

        // Handle media upload if file exists
        if (req.file) {
            mediaUrl = req.file.path || req.file.filename;
            mediaType = req.file.mimetype.split('/')[0]; // Extract media type (e.g., "image")
            if (!['image', 'video', 'file'].includes(mediaType)) {
                return res.status(400).json({ message: 'Invalid media type. Allowed: image, video, file.' });
            }
        }

        // Validate content or mediaUrl
        if (!content && !mediaUrl) {
            return res.status(400).json({ message: 'Message content or media is required.' });
        }

        // Validate recipient (if private message)
        let isPrivate = false;
        if (recipient) {
            if (!mongoose.Types.ObjectId.isValid(recipient)) {
                return res.status(400).json({ message: 'Invalid recipient ID.' });
            }
            const recipientExists = await User.findById(recipient);
            if (!recipientExists) {
                return res.status(404).json({ message: 'Recipient not found.' });
            }
            isPrivate = true;
        }

        // Create the new message
        const newMessage = new Message({
            sender: req.user._id,
            username: req.user.username,
            content,
            mediaUrl,
            mediaType,
            recipient: recipient || null,
            isPrivate,
        });

        // Save to DB
        await newMessage.save();

        // Emit to Socket.IO (Assuming `io` is accessible)
        const io = req.app.get('socketio'); // Get the Socket.IO instance
        io.emit('new message', newMessage);

        res.status(201).json({ message: 'Message sent successfully', newMessage });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get messages (with pagination and filtering by recipient)
router.get('/messages', async (req, res) => {
    const { userId } = req.query; // User ID from query params
    try {
        const messages = await Message.find({
            $or: [
                { recipient: null }, // Public messages
                { recipient: userId }, // Private messages for this user
            ]
        })
            .sort({ createdAt: 1 }) // Oldest to newest
            .limit(50); // Optional: Limit number of messages
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch messages' });
    }
});

// Delete a message
router.delete('/messages/:messageId', authenticate, async (req, res) => {
    try {
        const { messageId } = req.params;

        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ message: 'Message not found.' });
        }

        if (message.sender.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You can only delete your own messages.' });
        }

        await Message.findByIdAndDelete(messageId);

        // Emit deletion event
        const io = req.app.get('socketio');
        io.emit('delete message', { messageId });

        res.status(200).json({ message: 'Message deleted successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to delete message.' });
    }
});

// Update a message
router.put('/messages/:messageId', authenticate, async (req, res) => {
    try {
        const { messageId } = req.params;
        const { content } = req.body;

        if (!content) {
            return res.status(400).json({ message: 'Content is required to update the message.' });
        }

        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ message: 'Message not found.' });
        }

        if (message.sender.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You can only edit your own messages.' });
        }

        message.content = content;
        await message.save();

        // Emit update event
        const io = req.app.get('socketio');
        io.emit('update message', message);

        res.status(200).json({ message: 'Message updated successfully.', message });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to update message.' });
    }
});

router.get('/search', async (req, res) => {
    const { query, userId } = req.query;
    try {
        const results = await Message.find({
            $or: [
                { content: { $regex: query, $options: 'i' } }, 
                { recipient: userId },
            ],
        });
        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({ message: 'Search failed' });
    }
});


module.exports = router;

