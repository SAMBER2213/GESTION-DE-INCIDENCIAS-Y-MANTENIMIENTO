# ADR-0013: Usar Traefik como punto de entrada del entorno local y exponer ping y health en cada servicio

- **Estado:** Aceptado
- **Fecha:** 2026-11-26

## Contexto
En el entorno local hay nueve contenedores que atienden peticiones. Si cada uno publicara su propio puerto, el equipo tendría que recordar una lista de puertos y no habría un solo lugar donde se vea qué servicios están activos. Además, cada microservicio debe poder probarse por separado, y hay que comprobar de forma automática si un servicio está vivo y si llega a su base de datos.

## Decisión
- **Traefik** (proxy inverso) es el único contenedor que publica puertos al equipo: `9080` para todas las peticiones y `8081` para su panel de monitoreo. Descubre los servicios por las etiquetas (`labels`) definidas en el `docker-compose.yml`.
- **Rutas:**
  - `/ms-<nombre>/...` va al microservicio correspondiente, sin el prefijo. Por ejemplo, `/ms-incidencias/incidencias` llega a `GET /incidencias` de `ms-incidencias`.
  - Todo lo demás (`/api/...` y el frontend) va a `api-bff`.
- Las rutas `/ms-*` existen **solo en el entorno local**, para probar cada API por separado. En producción solo `api-bff` es público (ADR-0005). Si se define la variable `CLAVE_INTERNA`, cada microservicio exige la cabecera `x-clave-interna` en todas sus rutas, salvo `/ping` y `/health`.
- `api-bff` llama a cada microservicio por la red interna de Docker (por ejemplo, `http://ms-incidencias:3002`). Los microservicios no se llaman entre sí (ADR-0005).
- **Convención de salud:** todo servicio publica `GET /ping` (está vivo) y `GET /health` (además verifica la conexión con su base de datos y responde 503 si falla). `api-bff` publica `GET /api/ping` y `GET /api/health`, este último consulta el estado de los cinco microservicios.

## Alternativas consideradas
- **Nginx como proxy:** muy conocido, pero requiere editar un archivo de configuración cada vez que cambia un servicio.
- **Publicar el puerto de cada servicio:** simple, pero no hay un punto único de entrada ni un panel con el estado de las rutas.
- **Probar solo a través de `api-bff`:** respeta el punto de entrada único, pero impide probar un microservicio de forma aislada.

## Consecuencias
- (+) Un solo puerto de entrada y un panel donde se ven rutas y servicios.
- (+) Permite subir varias copias de un servicio y repartir la carga entre ellas.
- (+) `/ping` y `/health` dejan comprobar el estado del sistema con una sola consulta.
- (-) Traefik necesita acceso de lectura al socket de Docker; esto es aceptable solo en desarrollo local.
- (-) Las rutas `/ms-*` no deben existir en producción y hay que recordar desactivarlas al desplegar.
- (-) Es una herramienta más que el equipo debe conocer.
