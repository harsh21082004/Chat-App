const mongoose = require('mongoose');

const AuthUserSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600, // 10 minutes
  },
});

module.exports = mongoose.model('AuthUser', AuthUserSchema);
