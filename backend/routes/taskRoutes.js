const express = require('express');
const router = express.Router();
const {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getAdminStats
} = require('../controllers/taskController');
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');
const { validateTask } = require('../middlewares/validateMiddleware');

// Todas las rutas de tareas requieren autenticación
router.use(verifyToken);

// Ruta exclusiva para administradores
router.get('/admin/stats', authorizeRoles('admin'), getAdminStats);

// Rutas CRUD de tareas
router.get('/', getTasks);
router.get('/:id', getTaskById);
router.post('/', validateTask, createTask);
router.put('/:id', validateTask, updateTask);
router.delete('/:id', deleteTask);

module.exports = router;