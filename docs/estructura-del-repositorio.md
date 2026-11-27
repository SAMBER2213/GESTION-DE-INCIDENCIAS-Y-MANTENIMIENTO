# Estructura del repositorio

Todo el código y la documentación viven en un único repositorio de GitHub (RT-06). Cada servicio mantiene la organización en capas (RT-09) y los nombres en español (RNF-14).

## Árbol

```
.
├── README.md
├── docker-compose.yml
├── docs/
│   ├── descripcion-proyecto.md
│   ├── queries-actions.md
│   ├── historias-de-usuario.md
│   ├── job-stories.md
│   ├── requerimientos/        funcionales, no funcionales y técnicos
│   ├── adr/                   ADR-0001 a ADR-0013
│   ├── EventStorming/         event-storming.md
│   └── diagramas/             DS-01 a DS-13, mapa de contextos (.puml) e img/
├── frontend/
│   ├── index.html
│   ├── css/estilos.css
│   ├── js/                    api.js, autenticacion.js
│   └── paginas/               login, incidencias, proveedores, avisos, dashboard
└── services/
    ├── api-bff/
    ├── ms-usuarios/
    ├── ms-incidencias/
    ├── ms-proveedores/
    ├── ms-finanzas/
    └── ms-comunicaciones/
```

El frontend lo sirve `api-bff` como archivos estáticos (RT-08).

## Forma de cada servicio

```
services/<nombre>/
├── Dockerfile
├── .dockerignore
├── .env.example
├── Dockerfile / docker-compose.yml
├── server.js / package.json   (Node.js)
├── main.py / requirements.txt (Python)
└── src/ o app/                (capas del servicio)
    ├── config/                conexión a la base de datos
    ├── modelos/
    ├── controladores/
    ├── rutas/
    ├── middlewares/
    └── servicios/
```

`api-bff` no tiene base de datos: en lugar de `modelos/` tiene `orquestadores/` (un orquestador por caso de uso que cruza servicios) y `clientes/` (un cliente HTTP por microservicio).

Qué contiene cada servicio:

| Servicio | Lenguaje y acceso a datos | Modelos | Piezas propias |
|----------|---------------------------|---------|----------------|
| `api-bff` | Node.js + Express; sin base de datos | — | `middlewares/autenticacion.js`, `middlewares/roles.js`, orquestadores y clientes HTTP |
| `ms-usuarios` | Node.js + Express; Mongoose | Usuario | Emisión del token al iniciar sesión |
| `ms-incidencias` | Node.js + Express; Mongoose | Incidencia | `middlewares/subidaArchivos.js`, `servicios/imagenServicio.js` |
| `ms-proveedores` | Python + FastAPI; Motor/Pydantic | Proveedor, OrdenServicio | Regla de documentos vigentes (RF-14) |
| `ms-finanzas` | Python + FastAPI; Motor/Pydantic | Gasto, Presupuesto | — |
| `ms-comunicaciones` | Python + FastAPI; Motor/Pydantic | Aviso, Notificacion | `app/servicios/notificacion_servicio.py` (`smtplib`/`aiosmtplib`) |

## Librerías por servicio

| Servicio | Librerías principales |
|----------|-----------------------|
| `api-bff` | Express, jsonwebtoken, cliente HTTP y dotenv |
| `ms-usuarios` | Express, Mongoose, bcrypt, jsonwebtoken y dotenv |
| `ms-incidencias` | Express, Mongoose, multer, Cloudinary y dotenv |
| `ms-proveedores` | FastAPI, Motor, Pydantic y python-dotenv |
| `ms-finanzas` | FastAPI, Motor, Pydantic y python-dotenv |
| `ms-comunicaciones` | FastAPI, Motor, Pydantic, python-dotenv y smtplib/aiosmtplib |

## Configuración por servicio

| Variable | Dónde | Descripción |
|----------|-------|-------------|
| `PORT` | Todos | Puerto del servicio |
| `MONGODB_URI` | Cada `ms-*` | Conexión a la base de datos de ese servicio (ADR-0006) |
| `JWT_SECRET` | `ms-usuarios` y `api-bff` | El primero firma el token; el segundo lo verifica |
| `URL_MS_USUARIOS`, `URL_MS_INCIDENCIAS`, `URL_MS_PROVEEDORES`, `URL_MS_FINANZAS`, `URL_MS_COMUNICACIONES` | `api-bff` | Direcciones de los microservicios |
| `CLAVE_INTERNA` | `api-bff` y cada `ms-*` | Clave que los servicios exigen en cada petición, si no se pueden aislar en una red privada (ADR-0005) |
| Credenciales de correo | `ms-comunicaciones` | Para `smtplib`/`aiosmtplib` (RT-16) |
| Credenciales de imágenes | `ms-incidencias` | Para el servicio externo de fotos (RT-15) |

Los archivos `.env` se excluyen con `.gitignore` (RNF-06) y cada servicio publica un `.env.example`.

## Despliegue

Cada servicio se despliega como un servicio web independiente en Render, conectado al repositorio (ADR-0003). Node.js usa `npm install` y `node server.js`; Python usa `pip install -r requirements.txt` y `uvicorn main:app --host 0.0.0.0 --port $PORT` desde `services/<nombre>` (RT-21). Cada carpeta de servicio incluye un Dockerfile; el `docker-compose.yml` raíz coordina el entorno local (ADR-0011). Conviene verificar los límites vigentes del plan gratuito (servicios privados, suspensión por inactividad) antes de decidir cómo proteger los servicios internos.

## Entorno de desarrollo local

La intención es levantar todos los servicios en la máquina de cada integrante con un solo comando, usando contenedores Docker: un contenedor por servicio y un contenedor de MongoDB con una base de datos por servicio. Así cada integrante prueba el sistema completo sin depender de Render ni de Atlas.
