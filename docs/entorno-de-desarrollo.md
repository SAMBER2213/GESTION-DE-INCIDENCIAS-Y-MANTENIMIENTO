# Entorno de desarrollo

Este documento explica cómo levantar todo el sistema en un computador con un solo comando, cómo probarlo y cómo se trabaja en equipo. Las decisiones están en [ADR-0011](adr/0011-estandarizar-entorno-con-docker.md), [ADR-0012](adr/0012-stack-heterogeneo-por-microservicio.md) y [ADR-0013](adr/0013-traefik-como-punto-de-entrada-local.md).

## Requisitos

Solo se necesita **Docker** con **Docker Compose** y **Git**. No hay que instalar Node.js, Python, MongoDB ni Redis: todo corre dentro de contenedores.

```bash
docker --version
docker compose version
```

Recomendado: Visual Studio Code con las extensiones *Docker*, *Dev Containers* y *REST Client*. En Windows se trabaja desde una terminal de WSL (Ubuntu) con Docker Desktop.

## Levantar el sistema

```bash
git clone https://github.com/SAMBER2213/GESTION-DE-INCIDENCIAS-Y-MANTENIMIENTO.git
cd GESTION-DE-INCIDENCIAS-Y-MANTENIMIENTO
make start
```

La primera vez descarga las imágenes y puede tardar unos minutos. Si no se tiene `make`, el comando equivalente es `docker compose up -d --build`. Para comprobar el estado:

```bash
make ps
```

Deben aparecer nueve contenedores: `traefik`, `mongo`, `redis`, `api-bff` y los cinco microservicios, con el estado `healthy`.

## Servicios, tecnologías y rutas

| Servicio | Tecnología | Datos | Puerto interno | Ruta de prueba por el proxy |
|----------|-----------|-------|----------------|-----------------------------|
| `api-bff` | Node.js y Express | Sin base de datos | 3000 | `http://localhost:9080/api/...` y el frontend en `/` |
| `ms-usuarios` | Node.js y Express | MongoDB (`usuarios_db`) | 3001 | `http://localhost:9080/ms-usuarios/...` |
| `ms-incidencias` | Node.js y Express | MongoDB (`incidencias_db`) | 3002 | `http://localhost:9080/ms-incidencias/...` |
| `ms-proveedores` | Node.js y Express | MongoDB (`proveedores_db`) | 3003 | `http://localhost:9080/ms-proveedores/...` |
| `ms-finanzas` | Node.js y Express | MongoDB (`finanzas_db`) | 3004 | `http://localhost:9080/ms-finanzas/...` |
| `ms-comunicaciones` | Python y Flask | Redis | 3005 | `http://localhost:9080/ms-comunicaciones/...` |

Panel de Traefik (rutas y servicios activos): `http://localhost:8081`.

## Probar

Prueba automática de todos los endpoints a través del proxy:

```bash
make probar
```

Pruebas manuales, una por una, con el archivo [`api.http`](../api.http) y la extensión REST Client, o con `curl`:

```bash
curl http://localhost:9080/api/health
curl http://localhost:9080/api/resumen
curl http://localhost:9080/ms-incidencias/incidencias
curl http://localhost:9080/ms-comunicaciones/avisos
```

Todo servicio responde `GET /ping` (está vivo) y `GET /health` (además verifica su base de datos). `GET /api/resumen` es un ejemplo de lectura compuesta: `api-bff` junta datos de `ms-incidencias`, `ms-finanzas` y `ms-comunicaciones`, que no se llaman entre sí.

## Datos

- Cada servicio carga datos de ejemplo desde su archivo `seed.json`, solo si su colección está vacía.
- Los datos se guardan en volúmenes de Docker y se conservan después de `make stop`.
- Para borrar los datos y empezar de cero: `make limpiar`.

Consultar las bases de datos (solo lectura, para verificar):

```bash
docker compose exec mongo mongosh incidencias_db --quiet --eval "db.incidencias.find().toArray()"
docker compose exec redis redis-cli lrange avisos:ids 0 -1
docker compose exec redis redis-cli hgetall aviso:1
```

## Trabajar en un solo servicio

Cada carpeta `services/<nombre>/` tiene su propio `docker-compose.yml` que levanta solo ese servicio y su base de datos, sin proxy:

```bash
cd services/ms-incidencias
docker compose up -d --build
curl http://localhost:5002/ping
docker compose down
```

| Servicio | Puerto en el computador |
|----------|-------------------------|
| `ms-usuarios` | 5001 |
| `ms-incidencias` | 5002 |
| `ms-proveedores` | 5003 |
| `ms-finanzas` | 5004 |
| `ms-comunicaciones` | 5005 |

## Comandos

| Comando | Qué hace |
|---------|----------|
| `make start` | Construye y levanta todo |
| `make stop` | Baja los contenedores y conserva los datos |
| `make build` | Reconstruye las imágenes desde cero |
| `make logs` | Muestra los registros de todos los servicios |
| `make ps` | Lista los contenedores y su estado |
| `make probar` | Prueba los endpoints a través del proxy |
| `make limpiar` | Baja todo y borra los datos |

## Variables de entorno

Cada servicio incluye un `.env.example` con las variables que usa. Los archivos `.env` reales no se suben al repositorio. Para pedir una clave interna a los microservicios (ADR-0013), se define `CLAVE_INTERNA` en un archivo `.env` en la raíz; si se deja vacía, los servicios no exigen clave (solo para desarrollo local).

## Flujo de trabajo en equipo

1. Crear una rama para cada cambio: `git checkout -b feature/nombre-del-cambio`.
2. Probar localmente con `make start` y `make probar`.
3. Subir la rama y abrir un Pull Request hacia `main`.
4. GitHub Actions ejecuta la verificación automática. El resultado se ve en el propio Pull Request.
5. Otro integrante revisa y aprueba. No se sube directamente a `main`.

## Lineamientos del entorno y su estado

| Lineamiento | Cómo se cumple | Estado |
|-------------|----------------|--------|
| Docker como única dependencia | Todo corre en contenedores (ADR-0011) | Cumplido |
| Igual en el computador y en la nube | Mismos `Dockerfile`; la producción usa Render y Atlas | Parcial |
| Tecnologías variadas, sin exceso | Dos lenguajes y dos motores de datos (ADR-0012) | Cumplido |
| Trabajar en un servicio o en varios | `docker-compose.yml` por servicio y uno general | Cumplido |
| Bases de datos locales | Contenedores `mongo` y `redis` con volúmenes | Cumplido |
| Datos y estructura en archivos | `seed.json` por servicio | Cumplido |
| Pruebas automáticas | Verificación de sintaxis y `scripts/probar.sh` en cada Pull Request | Parcial |
| Ramas y revisión de Pull Request | Flujo descrito arriba | Cumplido |
| Control de calidad automático | GitHub Actions; falta un analizador de estilo (linter) | Parcial |
| Comandos comunes | `Makefile` | Cumplido |

## Solución de problemas

| Problema | Solución |
|----------|----------|
| `Cannot connect to the Docker daemon` | Abrir Docker Desktop y esperar a que diga que está corriendo |
| El puerto 9080 u 8081 está ocupado | Cerrar el programa que lo usa o cambiar el puerto en `docker-compose.yml` |
| Un servicio aparece `unhealthy` o reiniciándose | Ver `docker compose logs <servicio>`; suele ser que su base de datos aún está arrancando, esperar unos segundos |
| Traefik no encuentra rutas | Debe usarse la imagen `traefik:v3.6` o superior con versiones recientes de Docker |
| Cambié código y no se refleja | Ejecutar `make start`, que reconstruye las imágenes |

## Evidencias

Capturas del entorno funcionando, en [`docs/evidencias/`](evidencias/):

| Captura | Qué muestra |
|---------|-------------|
| `01-docker-version.png` | Docker y Docker Compose instalados |
| `02-contenedores.png` | Los nueve contenedores en estado `healthy` |
| `03-make-probar.png` | La prueba automática con todos los endpoints en OK |
| `04-traefik-panel.png` | El panel de Traefik con las rutas de los servicios |
| `05-rest-client.png` | Una petición probada con REST Client |
| `06-api-health.png` | La salud de todos los microservicios en `api-bff` |
| `07-api-resumen.png` | La lectura compuesta de tres microservicios |
| `08-mongo-datos.png` | Los datos de ejemplo dentro de MongoDB |
| `09-redis-datos.png` | Los datos de ejemplo dentro de Redis |
| `10-servicio-aislado.png` | Un microservicio levantado por separado |
| `11-github-actions.png` | La verificación automática en verde |
