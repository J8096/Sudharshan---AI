const router = require('express').Router();
const ctrl = require('../controllers/authController');
const { auth } = require('../middlewares/auth');

router.post('/register', ctrl.register);
router.post('/login', ctrl.login);
router.get('/me', auth, ctrl.me);
router.put('/profile', auth, ctrl.updateProfile);
router.get('/team', auth, ctrl.getTeam);

module.exports = router;
