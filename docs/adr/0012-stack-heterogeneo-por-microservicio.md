# ADR-0012: Elegir la tecnología de cada microservicio según su necesidad

- **Estado:** Aceptado
- **Fecha:** 2026-11-26

## Contexto
Cada microservicio es autónomo y es dueño de sus datos (ADR-0006), por lo que puede usar la tecnología que mejor se ajuste a su contexto. Si todos los servicios usan exactamente el mismo lenguaje y el mismo motor de datos, el sistema queda atado a una sola tecnología y no se aprovecha esa autonomía. Tener demasiadas tecnologías, en cambio, complica el mantenimiento de un equipo pequeño.

## Decisión
Aplicar la **regla de los dos**: usar al menos dos lenguajes y dos motores de datos, sin pasar de tres de cada uno.

| Servicio | Lenguaje y framework | Datos | Razón |
|----------|---------------------|-------|-------|
| `api-bff` | Node.js y Express | Sin base de datos | Comparte lenguaje con el frontend y solo reenvía y compone peticiones |
| `ms-usuarios` | Node.js y Express | MongoDB | Documentos de usuario con rol; `bcrypt` y `jsonwebtoken` (RT-12) |
| `ms-incidencias` | Node.js y Express | MongoDB | Documentos con historial de estados y fotos embebidos (ADR-0007 y ADR-0008) |
| `ms-proveedores` | Node.js y Express | MongoDB | Documentos con calificaciones y documentos de seguridad social embebidos |
| `ms-finanzas` | Node.js y Express | MongoDB | Gastos y presupuesto con soportes embebidos (ADR-0007) |
| `ms-comunicaciones` | Python y Flask | Redis | Avisos y registros de envío son datos simples, sin relaciones, que se consultan por clave o en orden cronológico; el envío de correo se resuelve con la biblioteca estándar de Python |

Resultado: dos lenguajes (JavaScript y Python) y dos motores de datos (MongoDB y Redis). Redis guarda sus datos en disco (modo AOF) para que no se pierdan al reiniciar.

## Alternativas consideradas
- **Todos los servicios en Node.js y MongoDB:** es lo más simple, pero no hay diversidad y el equipo queda atado a una sola tecnología.
- **PostgreSQL para `ms-finanzas`:** el modelo relacional ofrece mejor integridad para datos de dinero, pero agrega un tercer motor y otro servicio gratuito que verificar (RT-23).
- **Go para algún servicio:** buen rendimiento, pero el equipo no tiene experiencia con él.

## Consecuencias
- (+) Cada servicio usa una herramienta justificada y el sistema no depende de una sola tecnología.
- (+) Docker oculta las diferencias de instalación (ADR-0011).
- (-) Hay dos conjuntos de dependencias y dos formas de construir y probar los servicios.
- (-) Hace falta un Redis gestionado con plan gratuito para el despliegue (RT-23), que debe verificarse.
- (-) Este ADR ajusta parcialmente el ADR-0001 (`ms-comunicaciones` usa Python) y el ADR-0002 (`ms-comunicaciones` usa Redis).
