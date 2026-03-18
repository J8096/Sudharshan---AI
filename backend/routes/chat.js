const router = require('express').Router();
const ctrl = require('../controllers/chatController');
const { auth } = require('../middlewares/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`),
});
const upload = multer({ storage, limits: { fileSize: 25 * 1024 * 1024 } });

router.get('/models', ctrl.getModels);
router.get('/sessions', auth, ctrl.getSessions);
router.get('/session/:id', auth, ctrl.getSession);
router.delete('/session/:id', auth, ctrl.deleteSession);
router.put('/session/:id/title', auth, ctrl.updateTitle);
router.post('/upload', auth, upload.array('files', 20), ctrl.uploadFiles);
router.delete('/file/:fileId', auth, ctrl.deleteFile);
router.post('/chat', auth, ctrl.chat);

module.exports = router;
