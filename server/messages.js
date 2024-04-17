const mongoose = require('mongoose');

// Define the message schema
const messageSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Create the Message model
const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
