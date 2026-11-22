require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const weatherRoutes = require('./routes/weatherRoutes');
const errorHandler = require('./middlewares/errorMiddleware');

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());

// Ruta de prueba / salud del servidor
app.get('/', (req, res) => {
  res.json({ message: 'API de Gestor de Tareas funcionando correctamente 🚀' });
});

// Rutas principales
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/weather', weatherRoutes);

// Manejo de rutas no encontradas (404)
app.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada.' });
});

// Middleware global de errores (siempre al final)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Conexión a MongoDB y arranque del servidor
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      driverInfo: { name: 'nodejs', version: '6.0.0' }
    });
    console.log('✅ Conectado a MongoDB');
  } catch (error) {
    console.error('❌ Error al conectar a MongoDB:', error.message);
    process.exit(1);
  }
};

if (require.main === module) {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
  });
}

module.exports = { app, connectDB };