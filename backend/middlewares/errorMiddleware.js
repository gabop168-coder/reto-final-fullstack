const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err.stack || err.message);

  // Error de ID inválido en MongoDB (CastError)
  if (err.name === 'CastError') {
    return res.status(400).json({
      message: 'ID con formato inválido.'
    });
  }

  // Error de dato duplicado en MongoDB (ej. email o username repetido)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      message: `El campo '${field}' ya está registrado.`
    });
  }

  // Error genérico o personalizado
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || 'Error interno del servidor.'
  });
};

module.exports = errorHandler;