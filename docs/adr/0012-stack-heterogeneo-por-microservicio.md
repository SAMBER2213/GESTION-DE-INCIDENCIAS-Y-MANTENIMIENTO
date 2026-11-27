# ADR-0012: Adoptar una arquitectura políglota con Node.js y Python

- **Estado:** Aceptado
- **Fecha:** 2026-11-26

## Contexto
El profesor exige una arquitectura de microservicios con más de un lenguaje. El equipo decidió usar exactamente Node.js y Python. La distribución debe responder a las responsabilidades de cada servicio y mantener simples los contratos HTTP/JSON.

## Decisión
Usar exactamente dos lenguajes, según el requisito académico. MongoDB es el motor de datos para los cinco microservicios, con una base lógica por servicio (ADR-0006).

| Servicio | Lenguaje y framework | Acceso a datos y responsabilidad |
|----------|----------------------|-------------------------------|
| `api-bff` | Node.js + Express | Sin base de datos; JWT/roles, orquestación y composición con `Promise.all` |
| `ms-usuarios` | Node.js + Express | Mongoose; cuentas, roles, `bcrypt` y `jsonwebtoken` |
| `ms-incidencias` | Node.js + Express | Mongoose; incidencias, historial y fotos con `multer`/Cloudinary |
| `ms-proveedores` | Python 3.12 + FastAPI | Motor/Pydantic; proveedores, documentos vigentes y órdenes |
| `ms-finanzas` | Python 3.12 + FastAPI | Motor/Pydantic; gastos, presupuesto y cálculos |
| `ms-comunicaciones` | Python 3.12 + FastAPI | Motor/Pydantic; avisos y correos con `smtplib`/`aiosmtplib` |

Los servicios se comunican por REST/JSON solo a través de `api-bff`; los microservicios no se llaman entre sí. MongoDB se mantiene como motor común con bases lógicas separadas.

## Alternativas consideradas
- **Un solo lenguaje para todos los servicios:** simplifica el mantenimiento, pero incumple el requisito académico de arquitectura políglota.
- **Tres o más lenguajes:** agregan ecosistemas y complejidad sin aportar al alcance del proyecto.
- **Go para algún servicio:** buen rendimiento, pero el equipo no tiene experiencia con él.

## Consecuencias
- (+) Cada servicio usa una herramienta justificada y el sistema no depende de una sola tecnología.
- (+) Docker oculta las diferencias de instalación (ADR-0011).
- (-) Hay dos conjuntos de dependencias y dos formas de construir y probar los servicios.
- (-) El equipo mantiene dos ecosistemas y debe conocer Node.js y Python.
- (-) Cada runtime requiere su configuración propia de dependencias y despliegue (ADR-0011).
