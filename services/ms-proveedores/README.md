# ms-proveedores

**Bounded Context:** Proveedores y Contratistas

## Responsabilidades

- Registro de proveedores, documentos de seguridad social (ARL y EPS), órdenes de servicio y calificaciones.
- Regla RF-14: no se genera una orden de servicio si el proveedor no tiene ARL y EPS vigentes. Se resuelve dentro del servicio, que es dueño de proveedores y órdenes.
- Un documento vigente por tipo; el anterior queda como histórico.

## Datos

Base de datos lógica: `proveedores_db` (MongoDB Atlas, ADR-0006). Colecciones:

- `proveedores`: datos del proveedor con `documentos` y `calificaciones` anidados
- `ordenes_servicio`: orden con tareas, referencia al proveedor y a la incidencia (opcional)

El detalle de campos e índices está en la sección «Modelado de datos» de [Event Storming](../../docs/EventStorming/event-storming.md).

## Operaciones

Contratos funcionales en [queries-actions.md](../../docs/queries-actions.md). Los endpoints son internos: solo `api-bff` los llama.

| Operación | Endpoint interno |
|-----------|------------------|
| A-10 Registrar proveedor | `POST /proveedores` |
| A-11 Editar o desactivar proveedor | `PUT /proveedores/{proveedor_id}` |
| A-12 Cargar documento de seguridad social | `POST /proveedores/{proveedor_id}/documentos` |
| A-13 Generar orden de servicio | `POST /ordenes-servicio` |
| A-14 Calificar proveedor | `POST /proveedores/{proveedor_id}/calificaciones` |
| Q-06 Listar proveedores | `GET /proveedores` |
| Q-07 Consultar ficha de un proveedor | `GET /proveedores/{proveedor_id}` |
| Q-08 Consultar vigencia de documentos | `GET /proveedores/{proveedor_id}/documentos/vigencia` |
| Q-09 Consultar órdenes de servicio | `GET /ordenes-servicio` |

## Dependencias

No llama a ningún otro servicio.

## Variables de entorno

- `PORT`
- `MONGODB_URI` (de `proveedores_db`)

Cada servicio publica un `.env.example` y los archivos `.env` se excluyen con `.gitignore` (RNF-06).

## Tecnología definida (ADR-0012)

- **Lenguaje y framework:** Python 3.12 + FastAPI.
- **Responsabilidad que justifica el stack:** Reglas de proveedores, vigencia de ARL/EPS y órdenes de servicio.
- **Librerías:** fastapi, uvicorn, motor, pydantic, python-dotenv.
- **Base lógica:** MongoDB, base lógica propia del servicio; Mongoose para Node.js o Motor/Pydantic para Python.
- **Arranque en Docker/Render:** `uvicorn main:app --host 0.0.0.0 --port $PORT`.
