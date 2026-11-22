const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Error de validación en los datos enviados.',
      errors: errors.array()
    });
  }
  next();
};

const validateRegister = [
  body('username').trim().notEmpty().withMessage('El nombre de usuario es obligatorio.'),
  body('email').isEmail().withMessage('Debe ser un correo electrónico válido.'),
  body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres.'),
  body('role').optional().isIn(['user', 'admin']).withMessage('Rol inválido.'),
  handleValidationErrors
];

const validateLogin = [
  body('email').isEmail().withMessage('Debe ser un correo electrónico válido.'),
  body('password').notEmpty().withMessage('La contraseña es obligatoria.'),
  handleValidationErrors
];

const validateTask = [
  body('title').trim().notEmpty().withMessage('El título de la tarea es obligatorio.'),
  body('status').optional().isIn(['pendiente', 'en progreso', 'completada']).withMessage('Estado inválido.'),
  body('priority').optional().isIn(['baja', 'media', 'alta']).withMessage('Prioridad inválida.'),
  handleValidationErrors
];

module.exports = {
  validateRegister,
  validateLogin,
  validateTask
};