# api-bff

**Bounded Context:** Capa de API (no es un Bounded Context)

## Responsabilidades

- Es el único punto de entrada del frontend, que además sirve como archivos estáticos.
- Verifica el token JWT y el rol antes de reenviar cada petición (RNF-04, RNF-05, RF-28).
- Orquesta los casos de uso que cruzan servicios (por ejemplo, asignar una incidencia y notificar al técnico).
- Compone las lecturas que combinan datos de varios servicios (detalle de incidencia con costo, historial, dashboard).
- No contiene lógica de negocio ni base de datos propia.

## Casos de uso que orquesta

- Notificaciones: tras confirmar una acción, `api-bff` pide el envío a `ms-comunicaciones` sin bloquear la respuesta (H-08).
- Validación de referencias: antes de escribir, comprueba que existan el técnico o la incidencia en el servicio dueño.
- Cierre de sesión (A-02): no tiene endpoint en un servicio; el token no tiene estado y el cliente lo descarta (H-11).

## Dependencias

Llama a los cinco microservicios. Ningún microservicio llama a otro.

## Variables de entorno

- `PORT`
- `JWT_SECRET` (para verificar el token que emite `ms-usuarios`)
- `URL_MS_USUARIOS`, `URL_MS_INCIDENCIAS`, `URL_MS_PROVEEDORES`, `URL_MS_FINANZAS`, `URL_MS_COMUNICACIONES`
- `CLAVE_INTERNA` (si los servicios no se aíslan en una red privada)

Cada servicio publica un `.env.example` y los archivos `.env` se excluyen con `.gitignore` (RNF-06).

## Tecnología definida (ADR-0012)

- **Lenguaje y framework:** Node.js + Express.
- **Responsabilidad que justifica el stack:** JWT y roles, orquestación y composición de lecturas.
- **Librerías:** express, jsonwebtoken, dotenv.
- **Base lógica:** No tiene base de datos propia.
- **Arranque en Docker/Render:** `node server.js`.
