const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuid } = require('uuid');
const mongoose = require('mongoose');

// In-memory user store (used when MongoDB is NOT connected)
const memUsers = new Map();

// Generate the demo hash at startup so it is always correct
bcrypt.hash('password123', 10).then(hash => {
  memUsers.set('admin@kova.ai', {
    _id: 'demo-admin-001',
    id:  'demo-admin-001',
    name: 'Alex Johnson',
    email: 'admin@kova.ai',
    password: hash,
    role: 'admin',
    avatar: '',
    department: 'Engineering',
    status: 'active',
    createdAt: new Date('2024-01-15'),
  });
  console.log('  ✓ Demo user ready  →  admin@kova.ai / password123');
});

// Only use Mongoose if DB is actually connected (readyState 1)
function isDbReady() { return mongoose.connection.readyState === 1; }
function getUser() {
  if (!isDbReady()) return null;
  try { return require('../models/User'); } catch { return null; }
}

function signToken(user) {
  return jwt.sign(
    { id: user._id || user.id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET || 'dev_secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

// REGISTER
exports.register = async (req, res) => {
  try {
    const { name, email, password, role = 'member' } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: 'All fields required' });
    if (password.length < 6)
      return res.status(400).json({ error: 'Password must be at least 6 characters' });

    const User = getUser();
    if (User) {
      const existing = await User.findOne({ email });
      if (existing) return res.status(409).json({ error: 'Email already registered' });
      const user = await User.create({ name, email, password, role });
      return res.status(201).json({ token: signToken(user), user: user.toPublic() });
    }

    if (memUsers.has(email))
      return res.status(409).json({ error: 'Email already registered' });
    const hashed = await bcrypt.hash(password, 10);
    const user = { _id: uuid(), id: uuid(), name, email, password: hashed, role, avatar: '', department: '', status: 'active', createdAt: new Date() };
    memUsers.set(email, user);
    const { password: _, ...safe } = user;
    return res.status(201).json({ token: signToken(user), user: safe });
  } catch (err) { console.error('Register error:', err.message); res.status(500).json({ error: err.message }); }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Email and password required' });

    const User = getUser();
    if (User) {
      const user = await User.findOne({ email });
      if (!user) return res.status(401).json({ error: 'Invalid credentials' });
      const match = await user.comparePassword(password);
      if (!match) return res.status(401).json({ error: 'Invalid credentials' });
      user.lastActive = new Date(); await user.save();
      return res.json({ token: signToken(user), user: user.toPublic() });
    }

    const user = memUsers.get(email);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });
    const { password: _, ...safe } = user;
    return res.json({ token: signToken(user), user: safe });
  } catch (err) { console.error('Login error:', err.message); res.status(500).json({ error: err.message }); }
};

// GET ME
exports.me = async (req, res) => {
  try {
    const User = getUser();
    if (User) {
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ error: 'User not found' });
      return res.json({ user: user.toPublic() });
    }
    for (const u of memUsers.values()) {
      if (u._id === req.user.id || u.id === req.user.id) {
        const { password: _, ...safe } = u;
        return res.json({ user: safe });
      }
    }
    res.status(404).json({ error: 'User not found' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// GET TEAM
exports.getTeam = async (req, res) => {
  try {
    const User = getUser();
    if (User) { const users = await User.find({}).select('-password'); return res.json(users); }
    const list = [...memUsers.values()].map(({ password: _, ...u }) => u);
    res.json(list);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// UPDATE PROFILE
exports.updateProfile = async (req, res) => {
  try {
    const { name, department, avatar } = req.body;
    const User = getUser();
    if (User) {
      const user = await User.findByIdAndUpdate(req.user.id, { name, department, avatar }, { new: true });
      return res.json({ user: user.toPublic() });
    }
    for (const [email, u] of memUsers.entries()) {
      if (u._id === req.user.id || u.id === req.user.id) {
        if (name) u.name = name;
        if (department !== undefined) u.department = department;
        if (avatar !== undefined) u.avatar = avatar;
        memUsers.set(email, u);
        const { password: _, ...safe } = u;
        return res.json({ user: safe });
      }
    }
    res.status(404).json({ error: 'User not found' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
