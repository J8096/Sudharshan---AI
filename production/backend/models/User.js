const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['admin', 'member', 'viewer'], default: 'member' },
  avatar: { type: String, default: '' },
  department: { type: String, default: '' },
  status: { type: String, enum: ['active', 'inactive', 'pending'], default: 'active' },
  lastActive: { type: Date, default: Date.now },
  settings: {
    theme: { type: String, default: 'light' },
    notifications: { type: Boolean, default: true },
    defaultModel: { type: String, default: 'llama-3.3-70b-versatile' },
  },
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(pw) {
  return bcrypt.compare(pw, this.password);
};

userSchema.methods.toPublic = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
