const router = require('express').Router();
const ctrl = require('../controllers/projectController');
const { auth } = require('../middlewares/auth');

router.get('/', auth, ctrl.getProjects);
router.get('/:id', auth, ctrl.getProject);
router.post('/', auth, ctrl.createProject);
router.put('/:id', auth, ctrl.updateProject);
router.delete('/:id', auth, ctrl.deleteProject);
router.post('/:id/tasks', auth, ctrl.createTask);
router.put('/:id/tasks/:taskId', auth, ctrl.updateTask);
router.delete('/:id/tasks/:taskId', auth, ctrl.deleteTask);

module.exports = router;
