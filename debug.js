require('dotenv').config(); // Load .env file
const mongoose = require('mongoose');
const Message = require('./models/message-model'); // Adjust the path if necessary

const connectDB = async () => {
    try {
        await mongoose.connect('mongodb+srv://shariarkabirmehedi:pWlm4XpJAt6L6vXZ@cluster0.2iyqo.mongodb.net/RT-Chat-App-Info?retryWrites=true&w=majority&appName=Cluster0');
        console.log('Connected to MongoDB Atlas');
    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
    }
};

const getMessages = async () => {
    try {
        await connectDB();
        const messages = await Message.find();
        console.log('Messages in database:', messages);
        mongoose.disconnect();
    } catch (err) {
        console.error('Error retrieving messages:', err);
    }
};

getMessages();
