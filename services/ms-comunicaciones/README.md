# ms-comunicaciones

**Bounded Context:** Comunicación y Avisos

## Responsabilidades

- Avisos publicados para la comunidad, con vigencia entre `fecha_inicio` y `fecha_fin`.
- Envío de notificaciones por correo y registro de cada envío y su resultado (H-08).
- Recibe destinatarios ya resueltos (correo y nombre): no conoce el modelo de Usuario ni el de Incidencia.

## Datos

Base de datos lógica: `comunicaciones_db` (MongoDB Atlas, ADR-0006). Colecciones:

- `avisos`: aviso con vigencia y autor
- `notificaciones`: registro de cada envío (tipo, referencia, estado y error)

El detalle de campos e índices está en la sección «Modelado de datos» de [Event Storming](../../docs/EventStorming/event-storming-completo.md).

## Operaciones

Contratos funcionales en [queries-actions.md](../../docs/queries-actions.md). Los endpoints son internos: solo `api-bff` los llama.

| Operación | Endpoint interno |
|-----------|------------------|
| A-15 Publicar aviso | `POST /avisos` |
| Q-10 Consultar avisos | `GET /avisos` |
| Notificaciones (C-18, C-19, C-20) | `POST /notificaciones` |

## Dependencias

No llama a ningún otro servicio.

## Variables de entorno

- `PORT`
- `MONGODB_URI` (de `comunicaciones_db`)
- Credenciales del servicio de correo (RT-16)

Cada servicio publica un `.env.example` y los archivos `.env` se excluyen con `.gitignore` (RNF-06).
