# ADR-0011: Estandarizar el entorno de desarrollo y pruebas con Docker

- **Estado:** Propuesto
- **Fecha:** 2026-11-20

## Contexto
El sistema tiene un `api-bff` (que además sirve el frontend, ADR-0005) y cinco microservicios (`ms-usuarios`, `ms-incidencias`, `ms-proveedores`, `ms-finanzas`, `ms-comunicaciones`), cada uno con su base de datos lógica y su `MONGODB_URI` (ADR-0006). Levantarlos a mano exige coordinar seis procesos, puertos, versiones de Node y variables de entorno entre los integrantes del equipo.

## Decisión
Usar **Docker y Docker Compose** solo para desarrollo local, integración y pruebas (el despliegue sigue en Render, ADR-0003):

- Cada servicio, incluido `api-bff`, tiene su `Dockerfile` basado en una versión fija de Node LTS en Alpine (por ejemplo, `node:20-alpine`).
- Un `docker-compose.yml` en la raíz levanta todo con `docker compose up`. Los servicios se comunican por el DNS interno de Docker (`http://ms-incidencias:3002`). Solo `api-bff` expone puerto al host.
- Base de datos: MongoDB Atlas (ADR-0006) para el entorno compartido, o un contenedor `mongo` local con las cinco bases lógicas para pruebas aisladas.
- Cada servicio incluye un `.env.example` versionado (incluida la clave compartida entre `api-bff` y los servicios internos, ADR-0005). Los `.env` reales no se suben al repositorio.

## Alternativas consideradas
- **Instalación manual en cada equipo:** sin dependencias nuevas, pero genera diferencias de versión y de configuración entre integrantes.
- **Scripts npm que lanzan todos los servicios:** más simple, pero no aísla el runtime ni la base de datos de pruebas.

## Consecuencias
- (+) Mismo entorno para todo el equipo y un solo comando para levantar el sistema.
- (+) Facilita demostraciones y pruebas de integración de extremo a extremo.
- (-) Exige tener Docker instalado.
- (-) Hay que mantener sincronizados los `.env.example` y el `docker-compose.yml`.
