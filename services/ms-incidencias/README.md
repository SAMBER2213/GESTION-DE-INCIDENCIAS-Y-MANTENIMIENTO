# ms-incidencias

**Bounded Context:** Gestión de Incidencias

## Responsabilidades

- Reporte de incidencias con fotos, ciclo de estados (Pendiente → En proceso → Solucionado) y evidencia de antes y después.
- Historial de cambios de estado (`historial_estados`) y estadísticas de incidencias.
- Reglas: solo el técnico asignado cambia el estado; no se pasa a Solucionado sin foto del antes y del después (RF-10); no se asigna una incidencia ya solucionada.
- No guarda el costo: es la suma de los gastos y vive en `ms-finanzas`.

## Datos

Base de datos lógica: `incidencias_db` (MongoDB Atlas, ADR-0006). Colecciones:

- `incidencias`: datos del reporte, estado, referencias a usuarios (`reportado_por`, `tecnico_id`) con copia del nombre, fotos, evidencia y `historial_estados`

El detalle de campos e índices está en la sección «Modelado de datos» de [Event Storming](../../docs/EventStorming/event-storming-completo.md).

## Operaciones

Contratos funcionales en [queries-actions.md](../../docs/queries-actions.md). Los endpoints son internos: solo `api-bff` los llama.

| Operación | Endpoint interno |
|-----------|------------------|
| A-06 Reportar incidencia | `POST /incidencias` (con archivos) |
| A-07 Asignar incidencia a un técnico | `PUT /incidencias/{incidencia_id}/asignacion` |
| A-08 Poner una incidencia en proceso | `PATCH /incidencias/{incidencia_id}/estado` |
| A-09 Cerrar incidencia con evidencia | `POST /incidencias/{incidencia_id}/cierre` (con archivos) |
| Q-01 Consultar mis incidencias | `GET /incidencias?reportado_por={usuario_id}` |
| Q-02 Consultar detalle de una incidencia | `GET /incidencias/{incidencia_id}` (el costo lo agrega `api-bff`) |
| Q-03 Listar incidencias con filtros | `GET /incidencias` |
| Q-04 Consultar incidencias asignadas a mí | `GET /incidencias?tecnico_id={usuario_id}` |
| Q-05 Consultar historial de reparaciones | `GET /incidencias/historial` (el costo lo agrega `api-bff`) |
| Q-11 Consultar estadísticas de incidencias | `GET /estadisticas/incidencias` |
| Q-12 Comparar frecuencia de daños entre zonas | `GET /estadisticas/zonas` |

## Dependencias

No llama a ningún otro servicio.

## Variables de entorno

- `PORT`
- `MONGODB_URI` (de `incidencias_db`)
- Credenciales del servicio externo de imágenes (RT-15)

Cada servicio publica un `.env.example` y los archivos `.env` se excluyen con `.gitignore` (RNF-06).
