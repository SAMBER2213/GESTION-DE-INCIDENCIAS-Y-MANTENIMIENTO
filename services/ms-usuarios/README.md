# ms-usuarios

**Bounded Context:** Identidad y Acceso

## Responsabilidades

- Cuentas de usuario, roles (Residente, Técnico, Administrador) y sesiones.
- Emite el token JWT al iniciar sesión.
- Guarda las contraseñas cifradas con `bcrypt` y nunca las devuelve (RNF-03).
- Un usuario inactivo no inicia sesión; desactivar no borra el registro (RNF-17).

## Datos

Base de datos lógica: `usuarios_db` (MongoDB Atlas, ADR-0006). Colecciones:

- `usuarios`: nombre, correo (único), contrasena_hash, rol, activo

El detalle de campos e índices está en la sección «Modelado de datos» de [Event Storming](../../docs/EventStorming/event-storming-completo.md).

## Operaciones

Contratos funcionales en [queries-actions.md](../../docs/queries-actions.md). Los endpoints son internos: solo `api-bff` los llama.

| Operación | Endpoint interno |
|-----------|------------------|
| A-01 Iniciar sesión | `POST /usuarios/login` |
| A-03 Crear usuario | `POST /usuarios` |
| A-04 Editar usuario y asignar rol | `PUT /usuarios/{usuario_id}` |
| A-05 Desactivar usuario | `PATCH /usuarios/{usuario_id}/desactivar` |
| Q-15 Listar usuarios | `GET /usuarios` |

A-02 Cerrar sesión no tiene endpoint: el token no tiene estado y el cliente lo descarta (H-11).

## Dependencias

No llama a ningún otro servicio.

## Variables de entorno

- `PORT`
- `MONGODB_URI` (de `usuarios_db`)
- `JWT_SECRET`

Cada servicio publica un `.env.example` y los archivos `.env` se excluyen con `.gitignore` (RNF-06).
