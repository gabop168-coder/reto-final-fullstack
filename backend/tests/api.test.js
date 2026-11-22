jest.setTimeout(30000);
const request = require('supertest');
const mongoose = require('mongoose');
const { app, connectDB } = require('../server');
const User = require('../models/User');
const Task = require('../models/Task');

let userToken = '';
let adminToken = '';
let taskId = '';

beforeAll(async () => {
  await connectDB();
  // Limpiamos usuarios/tareas de pruebas anteriores si existen
  await User.deleteMany({ email: { $in: ['testuser@mail.com', 'testadmin@mail.com'] } });
  await Task.deleteMany({ title: /Prueba Jest/i });
});

afterAll(async () => {
  await User.deleteMany({ email: { $in: ['testuser@mail.com', 'testadmin@mail.com'] } });
  await Task.deleteMany({ title: /Prueba Jest/i });
  await mongoose.connection.close();
});

describe('Pruebas de Autenticación y Roles', () => {
  test('Debe registrar un usuario normal y un admin', async () => {
    const resUser = await request(app).post('/api/auth/register').send({
      username: 'testuser_jest',
      email: 'testuser@mail.com',
      password: 'password123',
      role: 'user'
    });
    expect(resUser.statusCode).toBe(201);

    const resAdmin = await request(app).post('/api/auth/register').send({
      username: 'testadmin_jest',
      email: 'testadmin@mail.com',
      password: 'password123',
      role: 'admin'
    });
    expect(resAdmin.statusCode).toBe(201);
  });

  test('Debe iniciar sesión y devolver tokens JWT', async () => {
    const resUser = await request(app).post('/api/auth/login').send({
      email: 'testuser@mail.com',
      password: 'password123'
    });
    expect(resUser.statusCode).toBe(200);
    expect(resUser.body.token).toBeDefined();
    userToken = resUser.body.token;

    const resAdmin = await request(app).post('/api/auth/login').send({
      email: 'testadmin@mail.com',
      password: 'password123'
    });
    expect(resAdmin.statusCode).toBe(200);
    adminToken = resAdmin.body.token;
  });
});

describe('Pruebas de Tareas (CRUD, Paginación y Roles)', () => {
  test('Debe crear una tarea con usuario autenticado', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        title: 'Tarea de Prueba Jest',
        description: 'Probando el CRUD completo',
        priority: 'alta'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe('Tarea de Prueba Jest');
    taskId = res.body._id;
  });

  test('Debe listar tareas con paginación', async () => {
    const res = await request(app)
      .get('/api/tasks?page=1&limit=5&priority=alta')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.tasks)).toBe(true);
    expect(res.body.pagination).toBeDefined();
  });

  test('Debe bloquear a un user normal en la ruta de admin (403)', async () => {
    const res = await request(app)
      .get('/api/tasks/admin/stats')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(403);
  });

  test('Debe permitir al admin ver las estadísticas (200)', async () => {
    const res = await request(app)
      .get('/api/tasks/admin/stats')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.total).toBeDefined();
  });

  test('Debe actualizar y luego eliminar la tarea', async () => {
    const resPut = await request(app)
      .put(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ title: 'Tarea de Prueba Jest Actualizada', status: 'completada' });

    expect(resPut.statusCode).toBe(200);
    expect(resPut.body.status).toBe('completada');

    const resDel = await request(app)
      .delete(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(resDel.statusCode).toBe(200);
  });
});

describe('Pruebas de API Externa (Clima)', () => {
  test('Debe consultar el clima correctamente desde Open-Meteo', async () => {
    const res = await request(app).get('/api/weather');
    expect(res.statusCode).toBe(200);
    expect(res.body.temperature).toBeDefined();
  });
});