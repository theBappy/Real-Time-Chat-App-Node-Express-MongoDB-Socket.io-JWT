const mongoose = require('mongoose');

const connectDB = async (url) => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected!');
    } catch (error) {
        console.error('Database connection error:', error);
        process.exit(1);
    }
};

module.exports = connectDB;


