const mongoose = require('mongoose');

// Chat Message Schema
const chatMessageSchema = new mongoose.Schema(
    {
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        username: { 
            type: String, 
            required: true 
        },
        content: {
            type: String,
            maxlength: 500, 
            default: null,
            required: false,
        },
        mediaUrl: {
            type: String,
            default: null,
            required: false,
        },
        mediaType: {
            type: String,
            enum: ['image', 'video', 'file'],
            default: null,
            required: false,
        },
        isPrivate: {
            type: Boolean,
            default: false,
        },
        recipient: {
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User',
            required: false,
            default: null, 
        },
        isMedia: {
            type: Boolean,
            default: false,
        },
        timestamp: {
            type: Date,
            default: Date.now,
            required: true,
        },
        group: {
            type: mongoose.Schema.Types.ObjectId,
            ref:'Group',
            default: null,
        },
    },
    {
        timestamps: true, 
    }
);

// Pre-save validation to ensure at least one of `content` or `mediaUrl` is provided
chatMessageSchema.pre('save', function (next) {
    console.log('Pre-save hook - content:', this.content, 'mediaUrl:', this.mediaUrl); // Debugging
    if (!this.content && !this.mediaUrl) {
        return next(new Error('Message content or media URL must be provided.'));
    }
    if (this.mediaType && !this.mediaUrl) {
        return next(new Error('Media URL is required when media type is specified.'));
    }
    next();
});

// Indexing for performance
chatMessageSchema.index({ sender: 1 });
chatMessageSchema.index({ recipient: 1, isPrivate: 1 });
chatMessageSchema.index({ timestamp: 1 });

module.exports = mongoose.model('ChatMessage', chatMessageSchema);



