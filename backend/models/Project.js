const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  status: { type: String, enum: ['backlog', 'todo', 'in-progress', 'review', 'done'], default: 'todo' },
  priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  dueDate: Date,
  labels: [String],
  order: { type: Number, default: 0 },
}, { timestamps: true });

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  status: { type: String, enum: ['active', 'paused', 'completed', 'archived'], default: 'active' },
  color: { type: String, default: '#5b8dee' },
  icon: { type: String, default: '📁' },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  tasks: [taskSchema],
  progress: { type: Number, default: 0 },
  dueDate: Date,
  tags: [String],
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
