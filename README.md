# ParkIoT - Sistema de Gestión de Parqueadero IoT

Sistema completo de gestión de parqueadero con lavadero, interfaz futurista y soporte para dispositivos IoT.

## 🚀 Inicio Rápido

### Requisitos
- Python 3.11+
- Node.js 18+
- PostgreSQL (usando Neon)

### Backend

```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## 📋 Credenciales de Prueba

Registra un usuario admin primero:
```bash
curl -X POST "http://localhost:8000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@parkiot.com","username":"admin","password":"admin123","full_name":"Administrador","role":"admin"}'
```

## 🏗️ Estructura del Proyecto

```
Parqueadero/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI entry point
│   │   ├── config.py        # Settings
│   │   ├── database.py      # Database connection
│   │   ├── models.py        # SQLAlchemy models
│   │   ├── schemas.py       # Pydantic schemas
│   │   ├── auth.py          # JWT authentication
│   │   ├── websocket.py     # WebSocket manager
│   │   └── routers/         # API endpoints
│   ├── .env                 # Environment variables
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   └── stores/          # Zustand stores
│   ├── package.json
│   └── vite.config.ts
├── INFORME.md               # Plan de implementación
└── BORRADORES_FRONTEND.md   # Mockups visuales
```

## 🔌 API Endpoints

- `POST /api/auth/login` - Autenticación
- `POST /api/auth/register` - Registro de usuario
- `GET /api/dashboard/stats` - Estadísticas en tiempo real
- `GET /api/zones` - Listar zonas
- `GET /api/spaces` - Listar espacios
- `POST /api/vehicles/entry` - Registrar entrada
- `POST /api/vehicles/exit/{id}` - Registrar salida
- `POST /api/payments` - Procesar pago
- `GET /api/wash` - Servicios de lavado
- `GET /api/iot` - Dispositivos IoT
- `WS /ws/{channel}` - WebSocket tiempo real

## 🎨 Características del Frontend

- 🌙 Tema oscuro futurista con efectos neón
- 📊 Dashboard con gráficas en tiempo real
- 🗺️ Mapa visual de zonas y espacios
- 🚗 Gestión de vehículos con pagos integrados
- 🧼 Módulo de lavadero con flujo de trabajo
- 📡 Monitoreo de dispositivos IoT
- 🔐 Autenticación JWT con roles

## 👥 Roles de Usuario

| Rol | Permisos |
|-----|----------|
| Admin | Acceso total, gestión de zonas/usuarios |
| Operario | Registro entrada/salida |
| Lavador | Gestión de servicios de lavado |
| Supervisor | Reportes y monitoreo |
| Cajero | Procesamiento de pagos |

## 📱 Tecnologías

- **Backend**: FastAPI + SQLAlchemy + PostgreSQL
- **Frontend**: React + TypeScript + Vite + Tailwind
- **Gráficas**: Recharts
- **Animaciones**: Framer Motion
- **Estado**: Zustand + TanStack Query
