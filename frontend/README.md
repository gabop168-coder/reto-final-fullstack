# Gestor de Tareas Full Stack (Reto Final)

Aplicación web Full Stack para la gestión de tareas con autenticación segura, control de acceso basado en roles (Admin/User), operaciones CRUD con filtros y paginación, integración con API externa del clima y pruebas automatizadas.

## Tecnologías Utilizadas

- **Backend:** Node.js, Express, MongoDB (Mongoose), JSON Web Tokens (JWT), bcryptjs, express-validator.
- **Frontend:** React, Vite, Axios, CSS personalizado.
- **API Externa:** Open-Meteo (clima en tiempo real para Guadalajara, Jalisco).
- **Pruebas:** Jest y Supertest (8/8 pruebas automatizadas).

## Funcionalidades Principales

- **Autenticación y Roles:** Registro e inicio de sesión con encriptación de contraseñas y tokens JWT. Roles de `user` y `admin`.
- **CRUD de Tareas:** Crear, listar, editar y eliminar tareas con título, descripción, estado (`pendiente`, `en progreso`, `completada`) y prioridad (`baja`, `media`, `alta`).
- **Filtros y Paginación:** Filtrado por estado y prioridad, con paginación de resultados desde el servidor.
- **Panel de Administrador:** Estadísticas globales en tiempo real (total de tareas, pendientes, en progreso y completadas) y visualización de autores.
- **Widget del Clima:** Consulta en vivo de temperatura y velocidad del viento mediante API externa.

## Estructura del Proyecto

```text
Reto final/
├── backend/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── tests/
│   ├── server.js
│   └── package.json
└── frontend/
    ├── src/
    │   ├── services/api.js
    │   ├── App.jsx
    │   └── App.css
    └── package.json