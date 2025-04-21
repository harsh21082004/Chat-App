const mongoose = require('mongoose');


const ConversationSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserData',
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserData',
  },
  lastMessage: {
    type: String,
    default: ''
  },
  lastMessageTimestamp: {
    type: Date,
    default: Date.now,
  },
  seen: {
    sender: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserData'
      },
      isSeen: {
        type: Boolean,
        default: false
      },
      unreadCount: {
        type: Number,
        default: 0
      }
    },
    receiver: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserData'
      },
      isSeen: {
        type: Boolean,
        default: false
      },
      unreadCount: {
        type: Number,
        default: 0
      }
    }
  }
}, {
  timestamps: true
});


module.exports = mongoose.model('Conversation', ConversationSchema);
