const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
  content: { type: String, required: true },
  ts: { type: Date, default: Date.now },
  tokens: { type: Number, default: 0 },
});

const chatSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, default: 'New Chat' },
  model: { type: String, default: 'llama-3.3-70b-versatile' },
  messages: [messageSchema],
  files: [{
    id: String, name: String, type: String,
    size: Number, path: String, url: String, content: String,
  }],
  pinned: { type: Boolean, default: false },
  archived: { type: Boolean, default: false },
  lastActive: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Chat', chatSchema);
