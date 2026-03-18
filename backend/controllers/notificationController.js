const { v4: uuid } = require('uuid');

// In-memory notifications per user
const memNotifications = new Map();

function getUserNotifs(userId) {
  if (!memNotifications.has(userId)) {
    // Seed demo notifications
    memNotifications.set(userId, [
      { _id: uuid(), id: uuid(), userId, type: 'success', title: 'Welcome to SUDHARSHAN AI!', message: 'Your account is set up and ready to go.', read: false, createdAt: new Date(Date.now() - 300000) },
      { _id: uuid(), id: uuid(), userId, type: 'info', title: 'New feature: Analytics Dashboard', message: 'Check out the new analytics dashboard to track your AI usage.', read: false, createdAt: new Date(Date.now() - 3600000) },
      { _id: uuid(), id: uuid(), userId, type: 'task', title: 'Task updated', message: 'Analytics dashboard moved to Review.', read: true, createdAt: new Date(Date.now() - 7200000) },
      { _id: uuid(), id: uuid(), userId, type: 'system', title: 'System maintenance', message: 'Scheduled maintenance on Sunday 2AM UTC.', read: true, createdAt: new Date(Date.now() - 86400000) },
    ]);
  }
  return memNotifications.get(userId);
}

exports.getNotifications = (req, res) => {
  const notifs = getUserNotifs(req.user.id);
  res.json(notifs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
};

exports.markRead = (req, res) => {
  const notifs = getUserNotifs(req.user.id);
  const n = notifs.find(n => n._id === req.params.id || n.id === req.params.id);
  if (n) n.read = true;
  res.json({ ok: true });
};

exports.markAllRead = (req, res) => {
  const notifs = getUserNotifs(req.user.id);
  notifs.forEach(n => n.read = true);
  res.json({ ok: true });
};

exports.deleteNotification = (req, res) => {
  const notifs = getUserNotifs(req.user.id);
  const idx = notifs.findIndex(n => n._id === req.params.id || n.id === req.params.id);
  if (idx !== -1) notifs.splice(idx, 1);
  res.json({ ok: true });
};

exports.createNotification = (req, res) => {
  const { type = 'info', title, message } = req.body;
  const notifs = getUserNotifs(req.user.id);
  const n = { _id: uuid(), id: uuid(), userId: req.user.id, type, title, message, read: false, createdAt: new Date() };
  notifs.unshift(n);
  res.status(201).json(n);
};
