# Estructura del repositorio

Todo el código y la documentación viven en un único repositorio de GitHub (RT-06). Cada servicio mantiene la organización en capas (RT-09) y los nombres en español (RNF-14).

## Árbol

```
.
├── README.md
├── docs/
│   ├── descripcion-proyecto.md
│   ├── queries-actions.md
│   ├── historias-de-usuario.md
│   ├── job-stories.md
│   ├── requerimientos/        funcionales, no funcionales y técnicos
│   ├── adr/                   ADR-0001 a ADR-0006
│   ├── EventStorming/         event-storming-completo.md
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
├── server.js
├── package.json
├── openapi.yaml               especificación de sus endpoints
├── .env.example
└── src/
    ├── config/                conexión a la base de datos
    ├── modelos/
    ├── controladores/
    ├── rutas/
    ├── middlewares/
    └── servicios/
```

`api-bff` no tiene base de datos: en lugar de `modelos/` tiene `orquestadores/` (un orquestador por caso de uso que cruza servicios) y `clientes/` (un cliente HTTP por microservicio).

Qué contiene cada servicio:

| Servicio | Modelos | Piezas propias |
|----------|---------|----------------|
| `api-bff` | — | `middlewares/autenticacion.js`, `middlewares/roles.js`, orquestadores y clientes HTTP |
| `ms-usuarios` | Usuario | Emisión del token al iniciar sesión |
| `ms-incidencias` | Incidencia | `middlewares/subidaArchivos.js`, `servicios/imagenServicio.js` |
| `ms-proveedores` | Proveedor, OrdenServicio | Regla de documentos vigentes (RF-14) |
| `ms-finanzas` | Gasto, Presupuesto | — |
| `ms-comunicaciones` | Aviso, Notificacion | `servicios/notificacionServicio.js` (`nodemailer`) |

## Configuración por servicio

| Variable | Dónde | Descripción |
|----------|-------|-------------|
| `PORT` | Todos | Puerto del servicio |
| `MONGODB_URI` | Cada `ms-*` | Conexión a la base de datos de ese servicio (ADR-0006) |
| `JWT_SECRET` | `ms-usuarios` y `api-bff` | El primero firma el token; el segundo lo verifica |
| `URL_MS_USUARIOS`, `URL_MS_INCIDENCIAS`, `URL_MS_PROVEEDORES`, `URL_MS_FINANZAS`, `URL_MS_COMUNICACIONES` | `api-bff` | Direcciones de los microservicios |
| `CLAVE_INTERNA` | `api-bff` y cada `ms-*` | Clave que los servicios exigen en cada petición, si no se pueden aislar en una red privada (ADR-0005) |
| Credenciales de correo | `ms-comunicaciones` | Para `nodemailer` (RT-16) |
| Credenciales de imágenes | `ms-incidencias` | Para el servicio externo de fotos (RT-15) |

Los archivos `.env` se excluyen con `.gitignore` (RNF-06) y cada servicio publica un `.env.example`.

## Despliegue

Cada servicio se despliega como un servicio web independiente en Render, conectado al repositorio (ADR-0003). El comando de inicio es `node server.js` ejecutado desde `services/<nombre>` (RT-21). Conviene verificar los límites vigentes del plan gratuito (servicios privados, suspensión por inactividad) antes de decidir cómo proteger los servicios internos.

## Entorno de desarrollo local

La intención es levantar todos los servicios en la máquina de cada integrante con un solo comando, usando contenedores Docker: un contenedor por servicio y un contenedor de MongoDB con una base de datos por servicio. Así cada integrante prueba el sistema completo sin depender de Render ni de Atlas.
