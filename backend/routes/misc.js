const router = require('express').Router();
const analyticsCtrl = require('../controllers/analyticsController');
const notifCtrl = require('../controllers/notificationController');
const { auth } = require('../middlewares/auth');

router.get('/analytics', auth, analyticsCtrl.getStats);

// IMPORTANT: /read-all must come before /:id routes to avoid Express param conflict
router.get('/notifications', auth, notifCtrl.getNotifications);
router.post('/notifications', auth, notifCtrl.createNotification);
router.put('/notifications/read-all', auth, notifCtrl.markAllRead);
router.put('/notifications/:id/read', auth, notifCtrl.markRead);
router.delete('/notifications/:id', auth, notifCtrl.deleteNotification);

module.exports = router;
