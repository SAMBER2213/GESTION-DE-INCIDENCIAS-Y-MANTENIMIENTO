# ADR-0006: Una base de datos lógica por microservicio en el mismo clúster de MongoDB Atlas

- **Estado:** Propuesto
- **Fecha:** 2026-11-14

## Contexto
Cada microservicio debe ser dueño de sus datos; si comparten tablas o colecciones, un cambio en un modelo rompe a los demás y se pierde la independencia. A la vez, todos los servicios del proyecto deben tener plan gratuito (RT-23) y el ADR-0002 eligió MongoDB Atlas con Mongoose.

## Decisión
Usar **un único clúster de MongoDB Atlas** con **una base de datos lógica por servicio**: `usuarios_db`, `incidencias_db`, `proveedores_db`, `finanzas_db` y `comunicaciones_db`. Cada servicio tiene su propio usuario de base de datos con permisos solo sobre la suya (RT-20) y su propia variable `MONGODB_URI`.

Entre servicios no hay consultas cruzadas ni `populate`: las referencias son identificadores (`usuario_id`, `incidencia_id`, `proveedor_id`). Los datos que otro servicio necesita se piden por su API o se guardan como copia cuando conviene (por ejemplo, el nombre de quien reporta una incidencia).

## Alternativas consideradas
- **Una sola base de datos compartida por todos los servicios:** es lo más fácil, pero acopla los servicios por los datos y anula la ventaja de separarlos.
- **Un clúster de Atlas por servicio:** aísla por completo, pero el plan gratuito limita la cantidad de clústeres (verificar los límites vigentes), así que probablemente no sea viable sin costo.

## Consecuencias
- (+) Cada servicio controla su modelo y puede cambiarlo sin coordinar con los demás.
- (+) Se mantiene el costo en cero (RT-23) y se conserva Mongoose (ADR-0002).
- (+) El usuario de base de datos por servicio impide, por permisos, que un servicio lea los datos de otro.
- (-) Todos los servicios comparten los límites de almacenamiento y de conexiones del plan gratuito del clúster.
- (-) No hay *joins*: las lecturas que combinan datos (por ejemplo, el costo total de una incidencia) se componen en `api-bff`.
- (-) Los datos copiados (nombres) pueden quedar desactualizados; para un registro histórico eso es aceptable.
- (-) Cambia RT-04: aparecen dos modelos nuevos (`Presupuesto` y `Notificacion`) y `RT-19` debe listar una `MONGODB_URI` por servicio.

