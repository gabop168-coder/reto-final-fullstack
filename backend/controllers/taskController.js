const Task = require('../models/Task');

// GET /api/tasks?page=1&limit=5&status=pendiente&priority=alta
const getTasks = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 5);
    const skip = (page - 1) * limit;

    // Filtro base: admin ve todas, user solo las suyas
    const filter = req.user.role === 'admin' ? {} : { user: req.user.id };

    if (req.query.status) filter.status = req.query.status;
    if (req.query.priority) filter.priority = req.query.priority;

    const [tasks, total] = await Promise.all([
      Task.find(filter)
        .populate('user', 'username email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Task.countDocuments(filter)
    ]);

    res.json({
      tasks,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1
      }
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/tasks/:id
const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id).populate('user', 'username email');
    if (!task) {
      return res.status(404).json({ message: 'Tarea no encontrada.' });
    }

    if (req.user.role !== 'admin' && task.user._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'No tienes permiso para ver esta tarea.' });
    }

    res.json(task);
  } catch (error) {
    next(error);
  }
};

// POST /api/tasks
const createTask = async (req, res, next) => {
  try {
    const { title, description, status, priority } = req.body;

    const task = new Task({
      title,
      description,
      status,
      priority,
      user: req.user.id
    });

    await task.save();
    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};

// PUT /api/tasks/:id
const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Tarea no encontrada.' });
    }

    if (req.user.role !== 'admin' && task.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'No tienes permiso para editar esta tarea.' });
    }

    const { title, description, status, priority } = req.body;
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;

    await task.save();
    res.json(task);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/tasks/:id
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Tarea no encontrada.' });
    }

    if (req.user.role !== 'admin' && task.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'No tienes permiso para eliminar esta tarea.' });
    }

    await task.deleteOne();
    res.json({ message: 'Tarea eliminada correctamente.' });
  } catch (error) {
    next(error);
  }
};

// GET /api/tasks/admin/stats (solo admin)
const getAdminStats = async (req, res, next) => {
  try {
    const [total, pendientes, enProgreso, completadas] = await Promise.all([
      Task.countDocuments(),
      Task.countDocuments({ status: 'pendiente' }),
      Task.countDocuments({ status: 'en progreso' }),
      Task.countDocuments({ status: 'completada' })
    ]);

    res.json({ total, pendientes, enProgreso, completadas });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getAdminStats
};