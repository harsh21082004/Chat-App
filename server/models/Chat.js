const mongoose = require('mongoose');

const FileSchema = new mongoose.Schema({
  url: String,
  filename: String,
  fileType: String,
  fileSize: Number,
  filecaption: String,
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
}, { _id: false });

const MessageSchema = new mongoose.Schema({
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
  messageType: {
    type: String,
    enum: ['text', 'image', 'file', 'video'],
    default: 'text',
  },
  content: {
    type: String,
  },
  files: [FileSchema],
  isSeen: {
    type: Boolean,
    default: false,
  },
  isDelivered: {
    type: Boolean,
    default: false,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
}, { _id: false });

const ChatSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true,
    index: true,
  },
  messages: [MessageSchema],
}, {
  timestamps: true,
});

module.exports = mongoose.model('Chat', ChatSchema);
