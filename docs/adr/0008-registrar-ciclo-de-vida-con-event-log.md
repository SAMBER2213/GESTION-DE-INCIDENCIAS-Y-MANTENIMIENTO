# ADR-0008: Trazabilidad del ciclo de vida mediante un registro cronológico de eventos (Event Log)

- **Estado:** Propuesto
- **Fecha:** 2026-11-20

## Contexto
Las incidencias (`ms-incidencias`) y las órdenes de servicio (`ms-proveedores`) pasan por varios estados a lo largo de su vida (por ejemplo: *Abierta → Asignada → En Proceso → Resuelta → Cerrada*). Para auditar la operación, permitir el seguimiento por parte de residentes y administradores, y calcular tiempos de atención, no basta con guardar solo el estado actual.

## Decisión
Implementar un **Event Log cronológico embebido** dentro de los agregados `Incidencia` y `OrdenServicio`:

- Cada entidad tiene un arreglo de solo agregado (`historialEventos` / `bitacoraEstados`). Cada transición de estado o acción relevante añade un registro con: `evento`, `estadoAnterior`, `estadoNuevo`, `actorId`, `rolActor`, `observacion` y `timestamp`.
- Los registros ya escritos no se modifican ni se eliminan.
- El estado actual de la entidad corresponde siempre al último evento registrado.
- No se agrega un almacén de eventos externo (EventStoreDB, Kafka); la trazabilidad vive en la base de datos de cada microservicio, para mantener simple la operación.

## Alternativas consideradas
- **Guardar solo el estado actual:** es lo más simple, pero no permite auditar quién cambió qué ni calcular tiempos de resolución.
- **Colección de eventos separada por servicio:** evita que el documento crezca, pero obliga a hacer consultas adicionales para reconstruir la historia de una entidad.
- **Almacén de eventos externo (EventStoreDB o Kafka):** es la solución completa de *event sourcing*, pero añade infraestructura que el plan gratuito y el equipo no pueden sostener (RT-23).

## Consecuencias
- (+) Auditoría completa de quién hizo cada cambio y cuándo.
- (+) Cálculo preciso de SLA y tiempos promedio de resolución sin infraestructura adicional.
- (-) Los documentos que acumulan muchas actualizaciones crecen con el tiempo.
