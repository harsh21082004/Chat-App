const mongoose = require('mongoose');

const FileSchema = new mongoose.Schema({
  url: {
    type: String,
  },
  filename: {
    type: String,
  },
  fileType: {
    type: String,  
  },
  fileSize: {
    type: Number,  // size in bytes
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

const ChatSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true,
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserData',
    required: true,
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserData',
    required: true,
  },
  messages: [{
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserData',
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserData',
    },
    messageType: {
      type: String,  // 'text', 'file', 'image', etc.
    },
    content: {
      type: String,  // for text messages
    },
    files: [FileSchema],  // array of file metadata
    timestamp: {
      type: Date,
      default: Date.now,
    },
  }],
});

module.exports = mongoose.model('Chat', ChatSchema);
