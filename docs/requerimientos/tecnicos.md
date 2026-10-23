# Requerimientos técnicos

Definen las tecnologías, herramientas y restricciones con las que se construye el sistema.

## Stack tecnológico

| ID | Área | Requerimiento |
|----|------|---------------|
| RT-01 | Frontend | La interfaz se desarrolla con HTML, CSS y JavaScript (sin frameworks). |
| RT-02 | Backend | El servidor se desarrolla con Node.js y el framework Express. |
| RT-03 | Base de datos | Se utiliza MongoDB como base de datos, alojada en MongoDB Atlas. |
| RT-04 | Base de datos | El acceso a MongoDB se realiza mediante Mongoose, con un modelo por entidad (Usuario, Incidencia, Proveedor, OrdenServicio, Aviso, Gasto). |
| RT-05 | Despliegue | La aplicación se despliega en Render, conectada al repositorio de GitHub. |
| RT-06 | Control de versiones | El código y la documentación se alojan en un único repositorio de GitHub. |

## Arquitectura

| ID | Área | Requerimiento |
|----|------|---------------|
| RT-07 | Arquitectura | El backend expone una API REST en formato JSON. |
| RT-08 | Arquitectura | Express sirve el frontend como archivos estáticos, de modo que todo se despliega como un solo servicio. |
| RT-09 | Arquitectura | El backend se organiza en las capas: modelos, controladores, rutas, middlewares y servicios. |
| RT-10 | Documentación | Los diagramas de secuencia se escriben en PlantUML y se guardan en `docs/diagramas/`. |
| RT-11 | Documentación | Las decisiones de arquitectura se registran como ADRs en `docs/adr/`. |

## Librerías y servicios

| ID | Área | Requerimiento |
|----|------|---------------|
| RT-12 | Seguridad | `bcrypt` para cifrar contraseñas y `jsonwebtoken` para la autenticación con tokens. |
| RT-13 | Configuración | `dotenv` para cargar variables de entorno; el archivo `.env` queda excluido con `.gitignore`. |
| RT-14 | Archivos | `multer` para recibir las fotos de las incidencias en el servidor. |
| RT-15 | Archivos | Las fotos se almacenan en un servicio externo (por ejemplo, Cloudinary), porque el disco de Render no es persistente en el plan gratuito. |
| RT-16 | Notificaciones | `nodemailer` para enviar notificaciones por correo electrónico. |
| RT-17 | Comunicación | `cors` configurado en Express, solo si el frontend se sirve desde otro dominio. |

## Configuración y entorno

| ID | Área | Requerimiento |
|----|------|---------------|
| RT-18 | Entorno | Node.js en una versión LTS vigente. |
| RT-19 | Variables de entorno | Se definen `MONGODB_URI`, `JWT_SECRET`, `PORT` y las credenciales del servicio de correo y de imágenes. |
| RT-20 | Base de datos | En MongoDB Atlas se configura un usuario con contraseña segura y el acceso de red necesario para que Render pueda conectarse. |
| RT-21 | Despliegue | Render usa `npm install` como comando de construcción y `node backend/server.js` como comando de inicio. |

## Restricciones

| ID | Área | Requerimiento |
|----|------|---------------|
| RT-22 | Alcance | En esta fase no se incluye el módulo de mantenimiento programado (calendario de equipos críticos, hojas de vida de maquinaria y alertas de inspección). |
| RT-23 | Costos | Todos los servicios utilizados deben tener plan gratuito (Render, MongoDB Atlas, Cloudinary). |
