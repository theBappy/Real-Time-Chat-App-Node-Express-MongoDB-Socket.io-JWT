const express = require('express');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs'); // Import bcrypt at the top
const authenticate = require('../middleware/auth');
const { cloudinary, upload } = require('../config/cloudinary');
const multer = require('../middleware/upload');
const User = require('../models/user-model');
const router = express.Router();

// Get User Profile
router.get('/me', authenticate, async (req, res) => {
    console.log('User ID:', req.user?.userId);
    try {
        const user = await User.findById(req.user.userId).select('-password');
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ success: false, message: 'Error fetching user profile', error: error.message });
    }
});

// Update User Profile
router.put('/me/update', authenticate, async (req, res) => {
    try {
        const { email, password, bio } = req.body;
        const updates = {};

        if (email) updates.email = email;
        if (password) {
            const salt = await bcrypt.genSalt(10);
            updates.password = await bcrypt.hash(password, salt);
        }
        if (bio) updates.bio = bio;

        const user = await User.findByIdAndUpdate(req.user.userId, updates, { new: true }).select('-password');
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        res.status(200).json({ success: true, user });
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ success: false, message: 'Error updating user profile', error: error.message });
    }
});

// Update User Avatar
router.post('/me/avatar', authenticate, upload.single('avatar'), async (req, res) => {
    try {
        // Check if a new avatar was uploaded
        if (!req.file || !req.file.path) {
            return res.status(400).json({ success: false, message: 'No avatar file uploaded.' });
        }

        // Get the current user
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        // Delete the old avatar from Cloudinary if it exists
        if (user.avatar && user.avatar.includes('res.cloudinary.com')) {
            // Extract the public_id from the Cloudinary URL
            const publicId = user.avatar.split('/').slice(-2).join('/').split('.')[0];
            await cloudinary.uploader.destroy(publicId); // Cloudinary SDK handles this deletion
        }

        // Update the user's avatar with the new Cloudinary URL
        user.avatar = req.file.path;
        await user.save();

        res.status(200).json({ success: true, message: 'Avatar updated successfully.', avatar: user.avatar });
    } catch (error) {
        console.error('Error updating avatar:', error);
        res.status(500).json({ success: false, message: 'Error updating avatar.', error: error.message });
    }
});


// Test Authentication
if (process.env.NODE_ENV !== 'production') {
    router.get('/test-auth', authenticate, (req, res) => {
        res.json({ user: req.user });
    });
}

module.exports = router;



