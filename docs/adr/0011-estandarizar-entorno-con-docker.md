# ADR-0011: Estandarizar el entorno de desarrollo y pruebas con Docker

- **Estado:** Aceptado
- **Fecha:** 2026-11-26 (ajusta la propuesta del 2026-11-20)

## Contexto
El sistema tiene un `api-bff` (que además sirve el frontend, ADR-0005) y cinco microservicios (`ms-usuarios`, `ms-incidencias`, `ms-proveedores`, `ms-finanzas`, `ms-comunicaciones`), cada uno con su propia base de datos (ADR-0006). Los servicios usan dos lenguajes y un motor de datos compartido en instancias/base lógica aisladas (ADR-0012). Levantarlos a mano exige coordinar nueve procesos, puertos, versiones de Node.js y Python, y variables de entorno entre los integrantes del equipo. Una persona nueva debería poder tener el sistema funcionando en menos de una hora.

## Decisión
Usar **Docker y Docker Compose** como única dependencia para desarrollo local, integración y pruebas (el despliegue sigue en Render, ADR-0003):

- **Un `Dockerfile` por servicio**, con versión fija de la imagen base: `node:20-alpine` para `api-bff`, `ms-usuarios` y `ms-incidencias`, y `python:3.12-slim` para `ms-proveedores`, `ms-finanzas` y `ms-comunicaciones`.
- **Un `docker-compose.yml` en la raíz** que levanta todo el sistema con un solo comando (`make start` o `docker compose up -d --build`): el proxy Traefik (ADR-0013), `api-bff`, los cinco microservicios, un contenedor MongoDB con las cinco bases lógicas del proyecto y el contenedor Redis que requiere la implementación actual de `ms-comunicaciones`.
- **Un `docker-compose.yml` por servicio** que levanta solo ese servicio y su base de datos, para trabajar de forma aislada.
- **Bases de datos locales con volúmenes** (`mongo_data`, `redis_data`): los datos sobreviven a `docker compose down`. El contenedor MongoDB contiene una base lógica por servicio (`usuarios_db`, `incidencias_db`, `proveedores_db`, `finanzas_db`, `comunicaciones_db`), igual que en el clúster de Atlas (ADR-0006). Atlas se usa para el entorno compartido y la producción.
- **Datos de ejemplo en archivos:** cada servicio tiene un `seed.json` que se carga solo cuando su colección está vacía.
- **Orden de arranque:** cada base de datos tiene `healthcheck`, los servicios usan `depends_on` con `service_healthy` y reintentan la conexión al iniciar.
- **Variables de entorno:** cada servicio publica un `.env.example` versionado (incluida `CLAVE_INTERNA`, ADR-0005 y ADR-0013). Los `.env` reales no se suben al repositorio.
- **Comandos comunes en un `Makefile`:** `make start`, `make stop`, `make build`, `make logs`, `make ps`, `make probar` y `make limpiar`.
- **Integración continua con GitHub Actions** (`.github/workflows/ci.yml`): en cada Pull Request verifica la sintaxis de los servicios, valida el `docker-compose.yml`, construye las imágenes, levanta el entorno y ejecuta `scripts/probar.sh`.
- **Flujo de trabajo:** cada cambio se hace en una rama propia y entra a `main` mediante Pull Request con la verificación en verde y la revisión de otro integrante.
- **Excepciones:** si un integrante no puede cumplir una de estas reglas, la excepción se documenta en este ADR y la aprueba el equipo.

## Alternativas consideradas
- **Instalación manual en cada equipo:** sin herramientas nuevas, pero genera diferencias de versión y de configuración entre integrantes.
- **Scripts npm que lanzan todos los servicios:** más simple, pero no aísla el entorno ni sirve para el servicio en Python ni para los distintos runtimes de los servicios.
- **Kubernetes local (por ejemplo, minikube):** más cercano a una nube real, pero demasiado pesado para un equipo pequeño y un proyecto académico.

## Consecuencias
- (+) Mismo entorno para todo el equipo y un solo comando para levantar el sistema.
- (+) Las diferencias entre lenguajes y bases de datos quedan ocultas dentro de los contenedores.
- (+) Facilita demostraciones y pruebas de integración de extremo a extremo, también de forma automática en cada Pull Request.
- (-) Exige tener Docker instalado y recursos suficientes (memoria) en el equipo.
- (-) Hay que mantener sincronizados los `.env.example`, los `docker-compose.yml` y el `Makefile`.
