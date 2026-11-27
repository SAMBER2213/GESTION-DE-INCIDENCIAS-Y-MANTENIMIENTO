# Gestión de Incidencias y Mantenimiento

Aplicación web para gestionar las incidencias y el mantenimiento de edificios, apartamentos y conjuntos residenciales. Permite que los residentes reporten daños con fotos, que la administración asigne técnicos y haga seguimiento, y que se lleve el control de proveedores, avisos y gastos en un solo lugar.

## Funcionalidades principales

- **Gestión de incidencias:** los residentes reportan problemas (bombillas, filtraciones, ascensores) con fotos, consultan el estado de su reporte (Pendiente, En proceso, Solucionado) y se guarda el historial de reparaciones.
- **Proveedores y contratistas:** registro de proveedores, órdenes de servicio, documentos de seguridad social y calificación del trabajo realizado.
- **Comunicación y transparencia:** avisos y notificaciones a la comunidad, y evidencia de antes y después al cerrar cada reporte.
- **Dashboard y presupuestos:** estadísticas de daños y control de gastos frente al presupuesto anual de mantenimiento.

## Arquitectura

El sistema se compone de cinco microservicios, uno por contexto de negocio, y una capa API que los orquesta:

| Servicio | Responsabilidad | Lenguaje |
|----------|-----------------|-----------|
| `api-bff` | Entrada única del frontend: verifica identidad y rol, orquesta los casos de uso y compone las lecturas | Node.js + Express |
| `ms-usuarios` | Cuentas, roles y sesiones | Node.js + Express |
| `ms-incidencias` | Reportes, estados, evidencia, historial y estadísticas | Node.js + Express |
| `ms-proveedores` | Proveedores, documentos de seguridad social, órdenes de servicio y calificaciones | Python + FastAPI |
| `ms-finanzas` | Gastos y presupuesto anual | Python + FastAPI |
| `ms-comunicaciones` | Avisos y notificaciones por correo | Python + FastAPI |

Cada microservicio tiene una base lógica propia en MongoDB. Los servicios se comunican por REST/JSON solo a través de `api-bff`; no se llaman entre sí. Más detalle en [Event Storming](docs/EventStorming/event-storming.md) y en los [ADR](docs/adr/).

## Tecnologías

- **Frontend:** HTML, CSS y JavaScript
- **Arquitectura:** exactamente dos lenguajes. Node.js + Express para `api-bff`, `ms-usuarios` y `ms-incidencias`; Python 3.12 + FastAPI para `ms-proveedores`, `ms-finanzas` y `ms-comunicaciones`.
- **Datos:** MongoDB, con una base lógica por microservicio; Mongoose en Node.js y Motor/Pydantic en Python.
- **Contenedores:** un Dockerfile por servicio y Docker Compose para desarrollo local. Traefik es el punto de entrada local (ADR-0013).
- **Despliegue:** Render, con comando de inicio según el runtime del servicio.

## Estructura del repositorio

- `docs/`: descripción, requerimientos, ADRs, Event Storming, diagramas de secuencia y queries/actions
- `services/`: capa API y microservicios Node.js/Python, una carpeta por servicio
- `frontend/`: páginas y estilos
- `docker-compose.yml`: entorno local con Docker Compose

