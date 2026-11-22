import { useState, useEffect } from 'react';
import api from './services/api';
import './App.css';

function App() {
  // Estado de autenticación
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isRegister, setIsRegister] = useState(false);
  const [authForm, setAuthForm] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user'
  });

  // Estado de tareas, filtros y paginación
  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [filters, setFilters] = useState({ status: '', priority: '' });
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    status: 'pendiente',
    priority: 'media'
  });
  const [editingId, setEditingId] = useState(null);

  // Estado de clima y estadísticas de admin
  const [weather, setWeather] = useState(null);
  const [adminStats, setAdminStats] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3500);
  };

  // Cargar clima al iniciar
  useEffect(() => {
    api.get('/weather')
      .then((res) => setWeather(res.data))
      .catch(() => setWeather(null));
  }, []);

  // Cargar tareas (y stats si es admin) cuando hay usuario o cambian filtros/página
  useEffect(() => {
    if (user) {
      fetchTasks(pagination.page);
      if (user.role === 'admin') {
        fetchAdminStats();
      }
    }
  }, [user, filters, pagination.page]);

  const fetchTasks = async (page = 1) => {
    try {
      const params = { page, limit: 5 };
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;

      const res = await api.get('/tasks', { params });
      setTasks(res.data.tasks);
      setPagination(res.data.pagination);
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Error al cargar tareas.');
    }
  };

  const fetchAdminStats = async () => {
    try {
      const res = await api.get('/tasks/admin/stats');
      setAdminStats(res.data);
    } catch {
      setAdminStats(null);
    }
  };

  // Registro / Login
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isRegister) {
        await api.post('/auth/register', authForm);
        showMessage('success', 'Usuario registrado. Ahora inicia sesión.');
        setIsRegister(false);
      } else {
        const res = await api.post('/auth/login', {
          email: authForm.email,
          password: authForm.password
        });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        setUser(res.data.user);
        showMessage('success', `¡Bienvenido, ${res.data.user.username}!`);
      }
    } catch (error) {
      const errMsg =
        error.response?.data?.errors?.[0]?.msg ||
        error.response?.data?.message ||
        'Error de autenticación.';
      showMessage('error', errMsg);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setTasks([]);
    setAdminStats(null);
  };

  // Crear o actualizar tarea
  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/tasks/${editingId}`, taskForm);
        showMessage('success', 'Tarea actualizada.');
        setEditingId(null);
      } else {
        await api.post('/tasks', taskForm);
        showMessage('success', 'Tarea creada.');
      }
      setTaskForm({ title: '', description: '', status: 'pendiente', priority: 'media' });
      fetchTasks(pagination.page);
      if (user.role === 'admin') fetchAdminStats();
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Error al guardar la tarea.');
    }
  };

  const handleEdit = (task) => {
    setEditingId(task._id);
    setTaskForm({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority
    });
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      showMessage('success', 'Tarea eliminada.');
      fetchTasks(pagination.page);
      if (user.role === 'admin') fetchAdminStats();
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Error al eliminar la tarea.');
    }
  };

  return (
    <div className="container">
      {/* Widget de Clima (API Externa) */}
      {weather && (
        <div className="weather-card">
          <div>
            <strong>Clima actual (Guadalajara)</strong>
            <div>Viento: {weather.windspeed} km/h</div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>
            {weather.temperature} {weather.unit}
          </div>
        </div>
      )}

      {message.text && (
        <div className={`alert ${message.type === 'error' ? 'alert-error' : 'alert-success'}`}>
          {message.text}
        </div>
      )}

      {!user ? (
        /* Vista de Login / Registro */
        <div className="card auth-card">
          <h2 style={{ marginBottom: '16px' }}>
            {isRegister ? 'Crear Cuenta' : 'Iniciar Sesión'}
          </h2>
          <form onSubmit={handleAuthSubmit}>
            {isRegister && (
              <div className="form-group">
                <label>Nombre de usuario</label>
                <input
                  type="text"
                  required
                  value={authForm.username}
                  onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })}
                />
              </div>
            )}
            <div className="form-group">
              <label>Correo electrónico</label>
              <input
                type="email"
                required
                value={authForm.email}
                onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Contraseña</label>
              <input
                type="password"
                required
                minLength={6}
                value={authForm.password}
                onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
              />
            </div>
            {isRegister && (
              <div className="form-group">
                <label>Rol</label>
                <select
                  value={authForm.role}
                  onChange={(e) => setAuthForm({ ...authForm, role: e.target.value })}
                >
                  <option value="user">Usuario</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
            )}
            <button type="submit" className="btn-primary" style={{ width: '100%' }}>
              {isRegister ? 'Registrarse' : 'Entrar'}
            </button>
          </form>
          <button className="btn-link" onClick={() => setIsRegister(!isRegister)}>
            {isRegister ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
          </button>
        </div>
      ) : (
        /* Vista Principal del Gestor de Tareas */
        <>
          <header className="header">
            <h1>Gestor de Tareas</h1>
            <div className="user-info">
              <span>{user.username}</span>
              <span className="role-badge">{user.role}</span>
              <button className="btn-secondary" onClick={handleLogout}>
                Cerrar sesión
              </button>
            </div>
          </header>

          {/* Panel exclusivo de Administrador */}
          {user.role === 'admin' && adminStats && (
            <div className="admin-stats">
              <div className="stat-box">
                <span>{adminStats.total}</span>
                <small>Total Tareas</small>
              </div>
              <div className="stat-box">
                <span>{adminStats.pendientes}</span>
                <small>Pendientes</small>
              </div>
              <div className="stat-box">
                <span>{adminStats.enProgreso}</span>
                <small>En Progreso</small>
              </div>
              <div className="stat-box">
                <span>{adminStats.completadas}</span>
                <small>Completadas</small>
              </div>
            </div>
          )}

          {/* Formulario de Tareas */}
          <div className="card">
            <h2 style={{ marginBottom: '14px' }}>
              {editingId ? 'Editar Tarea' : 'Nueva Tarea'}
            </h2>
            <form onSubmit={handleTaskSubmit}>
              <div className="form-group">
                <label>Título</label>
                <input
                  type="text"
                  required
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  rows="2"
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Estado</label>
                  <select
                    value={taskForm.status}
                    onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="en progreso">En progreso</option>
                    <option value="completada">Completada</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Prioridad</label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                  >
                    <option value="baja">Baja</option>
                    <option value="media">Media</option>
                    <option value="alta">Alta</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn-primary">
                  {editingId ? 'Guardar Cambios' : 'Agregar Tarea'}
                </button>
                {editingId && (
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                      setEditingId(null);
                      setTaskForm({ title: '', description: '', status: 'pendiente', priority: 'media' });
                    }}
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Filtros y Lista de Tareas */}
          <div className="card">
            <div className="filters">
              <select
                value={filters.status}
                onChange={(e) => {
                  setFilters({ ...filters, status: e.target.value });
                  setPagination((p) => ({ ...p, page: 1 }));
                }}
              >
                <option value="">Todos los estados</option>
                <option value="pendiente">Pendiente</option>
                <option value="en progreso">En progreso</option>
                <option value="completada">Completada</option>
              </select>

              <select
                value={filters.priority}
                onChange={(e) => {
                  setFilters({ ...filters, priority: e.target.value });
                  setPagination((p) => ({ ...p, page: 1 }));
                }}
              >
                <option value="">Todas las prioridades</option>
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
              </select>
            </div>

            {tasks.length === 0 ? (
              <p style={{ color: '#64748b', textAlign: 'center', padding: '20px 0' }}>
                No hay tareas para mostrar.
              </p>
            ) : (
              <div className="task-list">
                {tasks.map((task) => (
                  <div key={task._id} className="task-item">
                    <div className="task-info">
                      <h3>{task.title}</h3>
                      {task.description && <p>{task.description}</p>}
                      <div className="badges">
                        <span className={`badge status-${task.status.replace(' ', '-')}`}>
                          {task.status}
                        </span>
                        <span className={`badge priority-${task.priority}`}>
                          Prioridad: {task.priority}
                        </span>
                        {user.role === 'admin' && task.user && (
                          <span className="badge" style={{ background: '#f1f5f9', color: '#334155' }}>
                            Autor: {task.user.username}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="task-actions">
                      <button className="btn-secondary" onClick={() => handleEdit(task)}>
                        Editar
                      </button>
                      <button className="btn-danger" onClick={() => handleDelete(task._id)}>
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Paginación */}
            <div className="pagination">
              <button
                className="btn-secondary"
                disabled={pagination.page <= 1}
                onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
              >
                Anterior
              </button>
              <span>
                Página {pagination.page} de {pagination.totalPages} ({pagination.total} tareas)
              </span>
              <button
                className="btn-secondary"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
              >
                Siguiente
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default App;