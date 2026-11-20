# ADR-0001: Usar Node.js y Express para los microservicios y la capa API

- **Estado:** Aceptado
- **Fecha:** 2026-10-30

## Contexto
El sistema necesita servicios que gestionen incidencias, proveedores, avisos y gastos, con autenticación por roles y subida de fotos. El equipo es pequeño, el proyecto es académico y el frontend ya usa JavaScript.

## Decisión
Usar Node.js con el framework Express para construir cada microservicio y la capa API (`api-bff`).

## Alternativas consideradas
- **Django (Python):** completo, pero implica un segundo lenguaje para el equipo.
- **Spring Boot (Java):** robusto, pero con más configuración y curva de aprendizaje para un proyecto de este tamaño.
- **NestJS:** más estructura, pero añade conceptos que complican el proyecto sin necesidad.

## Consecuencias
- (+) Un solo lenguaje (JavaScript) en el frontend, los microservicios y la capa API.
- (+) Express es ligero, tiene mucha documentación y se integra bien con MongoDB mediante Mongoose.
- (+) Ecosistema amplio de librerías (autenticación, subida de archivos, notificaciones).
- (-) Express no impone estructura; el equipo debe definir y respetar sus propias convenciones.
