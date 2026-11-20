# Gestión de Incidencias y Mantenimiento

Aplicación web para gestionar las incidencias y el mantenimiento de edificios, apartamentos y conjuntos residenciales. Permite que los residentes reporten daños con fotos, que la administración asigne técnicos y haga seguimiento, y que se lleve el control de proveedores, avisos y gastos en un solo lugar.

## Funcionalidades principales

- **Gestión de incidencias:** los residentes reportan problemas (bombillas, filtraciones, ascensores) con fotos, consultan el estado de su reporte (Pendiente, En proceso, Solucionado) y se guarda el historial de reparaciones.
- **Proveedores y contratistas:** registro de proveedores, órdenes de servicio, documentos de seguridad social y calificación del trabajo realizado.
- **Comunicación y transparencia:** avisos y notificaciones a la comunidad, y evidencia de antes y después al cerrar cada reporte.
- **Dashboard y presupuestos:** estadísticas de daños y control de gastos frente al presupuesto anual de mantenimiento.

## Arquitectura

El sistema se compone de cinco microservicios, uno por contexto de negocio, y una capa API que los orquesta:

| Servicio | Responsabilidad |
|----------|-----------------|
| `api-bff` | Entrada única del frontend: verifica identidad y rol, orquesta los casos de uso y compone las lecturas |
| `ms-usuarios` | Cuentas, roles y sesiones |
| `ms-incidencias` | Reportes, estados, evidencia, historial y estadísticas |
| `ms-proveedores` | Proveedores, documentos de seguridad social, órdenes de servicio y calificaciones |
| `ms-finanzas` | Gastos y presupuesto anual |
| `ms-comunicaciones` | Avisos y notificaciones por correo |

Cada microservicio tiene su propia base de datos lógica y los microservicios no se llaman entre sí. Más detalle en [`docs/EventStorming/event-storming-completo.md`](docs/EventStorming/event-storming-completo.md) y en los [ADR](docs/adr/).

## Tecnologías

- **Frontend:** HTML, CSS y JavaScript
- **Arquitectura:** microservicios por contexto (Node.js y Express) con una capa API (`api-bff`) que los orquesta
- **Base de datos:** MongoDB (Atlas)
- **Despliegue:** Render

## Estructura del repositorio

- `docs/`: descripción, requerimientos, ADRs, Event Storming, diagramas de secuencia y queries/actions
- `services/`: capa API y microservicios, una carpeta por servicio
- `frontend/`: páginas y estilos

