# Requerimientos técnicos

Definen las tecnologías, herramientas y restricciones con las que se construye el sistema.

## Stack tecnológico

| ID | Área | Requerimiento |
|----|------|---------------|
| RT-01 | Frontend | La interfaz se desarrolla con HTML, CSS y JavaScript (sin frameworks). |
| RT-02 | Servicios | Cada microservicio y la capa API (`api-bff`) se desarrollan con Node.js y el framework Express. |
| RT-03 | Base de datos | Se utiliza MongoDB como base de datos, alojada en MongoDB Atlas, con una base de datos lógica por microservicio dentro de un mismo clúster (ADR-0006). |
| RT-04 | Base de datos | El acceso a MongoDB se realiza mediante Mongoose, con un modelo por entidad dentro del microservicio dueño: Usuario (`ms-usuarios`), Incidencia (`ms-incidencias`), Proveedor y OrdenServicio (`ms-proveedores`), Gasto y Presupuesto (`ms-finanzas`), Aviso y Notificacion (`ms-comunicaciones`). |
| RT-05 | Despliegue | Cada microservicio y la capa API se despliegan como servicios independientes en Render, conectados al repositorio de GitHub. |
| RT-06 | Control de versiones | El código y la documentación se alojan en un único repositorio de GitHub. |

## Arquitectura

| ID | Área | Requerimiento |
|----|------|---------------|
| RT-07 | Arquitectura | La capa API y los microservicios exponen una API REST en formato JSON. |
| RT-08 | Arquitectura | `api-bff` sirve el frontend como archivos estáticos y es el único punto de entrada del cliente. |
| RT-09 | Arquitectura | Cada microservicio se organiza en las capas: modelos, controladores, rutas, middlewares y servicios. |
| RT-10 | Documentación | Los diagramas de secuencia se escriben en PlantUML y se guardan en `docs/diagramas/`. |
| RT-11 | Documentación | Las decisiones de arquitectura se registran como ADRs en `docs/adr/`. |

## Librerías y servicios

| ID | Área | Requerimiento |
|----|------|---------------|
| RT-12 | Seguridad | `bcrypt` para cifrar contraseñas y `jsonwebtoken` para la autenticación con tokens. |
| RT-13 | Configuración | `dotenv` para cargar variables de entorno; el archivo `.env` queda excluido con `.gitignore`. |
| RT-14 | Archivos | `multer` en `ms-incidencias` para recibir las fotos de las incidencias. |
| RT-15 | Archivos | Las fotos se almacenan en un servicio externo (por ejemplo, Cloudinary), porque el disco de Render no es persistente en el plan gratuito. |
| RT-16 | Notificaciones | `nodemailer` para enviar notificaciones por correo electrónico. |
| RT-17 | Comunicación | `cors` configurado en `api-bff`, solo si el frontend se sirve desde otro dominio. |

## Configuración y entorno

| ID | Área | Requerimiento |
|----|------|---------------|
| RT-18 | Entorno | Node.js en una versión LTS vigente. |
| RT-19 | Variables de entorno | Cada servicio define `PORT`; cada microservicio con base de datos define su propia `MONGODB_URI`. `ms-usuarios` y `api-bff` comparten `JWT_SECRET`; `api-bff` define además las URL de los microservicios; `ms-comunicaciones` define las credenciales del servicio de correo y `ms-incidencias` las del servicio de imágenes. |
| RT-20 | Base de datos | En MongoDB Atlas se configura un usuario con contraseña segura por servicio, con permisos solo sobre su base de datos, y el acceso de red necesario para que Render pueda conectarse. |
| RT-21 | Despliegue | Render usa `npm install` como comando de construcción y `node server.js` como comando de inicio, ejecutados desde la carpeta de cada servicio (`services/<nombre>`). |

## Microservicios

| ID | Área | Requerimiento |
|----|------|---------------|
| RT-24 | Datos | Cada microservicio es dueño de sus datos: ningún otro servicio lee ni modifica su base de datos; el acceso es solo a través de su API (ADR-0006). |
| RT-25 | Integración | Los microservicios no se llaman entre sí; la coordinación entre ellos se realiza en `api-bff` (ADR-0005). |
| RT-26 | Capa API | `api-bff` verifica el token JWT y el rol, orquesta los casos de uso que cruzan servicios y compone las lecturas; no contiene lógica de negocio ni base de datos. |

## Restricciones

| ID | Área | Requerimiento |
|----|------|---------------|
| RT-22 | Alcance | En esta fase no se incluye el módulo de mantenimiento programado (calendario de equipos críticos, hojas de vida de maquinaria y alertas de inspección). |
| RT-23 | Costos | Todos los servicios utilizados deben tener plan gratuito (Render, MongoDB Atlas, Cloudinary). |
