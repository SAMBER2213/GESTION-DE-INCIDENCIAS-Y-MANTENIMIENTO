# ADR-0002: Usar MongoDB Atlas con Mongoose como base de datos

- **Estado:** Aceptado
- **Fecha:** 2026-10-30

## Contexto
El sistema guarda incidencias con descripción, estado, fotos y historial de cambios, además de proveedores, órdenes de servicio y avisos. Los datos tienen estructuras variadas y pueden evolucionar durante el desarrollo. El equipo necesita una base de datos accesible desde la nube, sin instalar ni administrar un servidor.

## Decisión
Usar MongoDB como base de datos, alojada en MongoDB Atlas, y Mongoose como ODM desde Node.js.

## Alternativas consideradas
- **PostgreSQL:** relacional y muy sólida, pero exige diseñar el esquema completo desde el inicio y los cambios son más costosos.
- **MySQL:** similar a PostgreSQL, con las mismas limitaciones para este caso.

## Consecuencias
- (+) Esquema flexible: se pueden añadir campos sin migraciones complejas.
- (+) Los documentos JSON encajan de forma natural con JavaScript.
- (+) Atlas ofrece un plan gratuito y evita administrar infraestructura.
- (+) Mongoose aporta validación y modelos de datos claros.
- (-) El plan gratuito tiene límites de almacenamiento y rendimiento.
- (-) Las relaciones entre entidades (incidencia, técnico, proveedor) requieren más cuidado que en una base relacional.
