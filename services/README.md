# Servicios

Cada carpeta es una unidad que se desarrolla, prueba y despliega por separado.

| Carpeta | Bounded Context |
|---------|-----------------|
| [`api-bff/`](api-bff/) | Capa de API: entrada única, seguridad y orquestación |
| [`ms-usuarios/`](ms-usuarios/) | Identidad y Acceso |
| [`ms-incidencias/`](ms-incidencias/) | Gestión de Incidencias |
| [`ms-proveedores/`](ms-proveedores/) | Proveedores y Contratistas |
| [`ms-finanzas/`](ms-finanzas/) | Finanzas y Presupuesto |
| [`ms-comunicaciones/`](ms-comunicaciones/) | Comunicación y Avisos |

Reglas comunes:

- Cada microservicio es dueño de sus datos; ningún otro servicio accede a su base de datos.
- Los microservicios no se llaman entre sí; la coordinación está en `api-bff`.
- Dentro de cada servicio el código se organiza en capas: modelos, controladores, rutas, middlewares y servicios.
