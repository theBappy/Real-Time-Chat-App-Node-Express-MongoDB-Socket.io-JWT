const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user-model');
const router = express.Router();

// Registration Route
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({ message: 'All fields are required.' });
    }
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists.' });
        }
        const newUser = new User({ username, email, password });
        await newUser.save();
        res.status(201).json({ success:true, message: 'User registered successfully.' });
    } catch (error) {
        res.status(500).json({ error: 'Registration failed.' });
    }
});

// Login Route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'All fields are required.' });
    }
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password.' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password.' });
        }
        const token = jwt.sign({ userId: user._id}, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.status(200).json({ success:true, token });
    } catch (error) {
        res.status(500).json({ error: 'Login failed.' });
    }
});

module.exports = router;
