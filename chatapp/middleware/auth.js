const jwt = require('jsonwebtoken');
const User = require('../models/user-model');

const authenticate = async (req, res, next) => {
    try {
        // Extract the token from the Authorization header
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ message: 'Authentication token is missing' });
        }

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Validate the user in the database
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Attach only necessary details to `req.user`
        req.user = { userId: user._id, username: user.username }; // Simplified structure

        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        console.error('Authentication error:', error.message);
        res.status(401).json({ message: 'Invalid or expired token' });
    }
};

module.exports = authenticate;
