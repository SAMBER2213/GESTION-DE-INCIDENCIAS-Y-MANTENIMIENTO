# ADR-0010: Flujos distribuidos y compensación mediante patrón Saga orquestado

- **Estado:** Propuesto
- **Fecha:** 2026-11-20

## Contexto
Algunos procesos de negocio involucran varios microservicios con bases de datos independientes (ADR-0006):

- Asignar un proveedor o técnico a una incidencia (`DS-03` y `DS-07`): actualiza el estado en `ms-incidencias` y crea una orden en `ms-proveedores`.
- Cerrar una orden de servicio y registrar el gasto en el presupuesto (`DS-05` y `DS-11`): involucra `ms-proveedores`, `ms-incidencias` y `ms-finanzas`.

Como no hay transacciones entre bases de datos distintas, un fallo parcial puede dejar el sistema inconsistente. Esta decisión extiende el criterio del ADR-0004 (validar antes de escribir y tolerar fallos secundarios): se agregan compensaciones solo para los pasos críticos. El `api-bff` solo coordina; las reglas de negocio siguen en los microservicios (ADR-0005).

## Decisión
Implementar el **patrón Saga orquestado desde el `api-bff`**, con acciones de compensación explícitas:

1. **Ejecución secuencial:** el `api-bff` ejecuta los pasos en orden (por ejemplo: 1. crear la orden de servicio en `ms-proveedores` → 2. actualizar la incidencia a *Asignada* en `ms-incidencias` → 3. notificar por `ms-comunicaciones`).
2. **Compensación (rollback lógico):** si falla un paso crítico posterior (por ejemplo, el registro del gasto en `ms-finanzas` al cerrar una orden), el `api-bff` envía peticiones compensatorias a los servicios anteriores (revertir el estado de la orden o la incidencia) y devuelve un error controlado al cliente.
3. **Fallos no críticos:** las acciones secundarias, como las notificaciones, se tratan con consistencia eventual: si fallan, no bloquean ni revierten la operación principal.

## Alternativas consideradas
- **Transacciones distribuidas (2PC):** garantizan consistencia, pero exigen bloqueos y coordinación que MongoDB Atlas entre bases distintas y el plan gratuito no ofrecen de forma práctica.
- **Coreografía con eventos y *broker*:** desacopla más, pero añade infraestructura que el ADR-0005 dejó como evolución futura.
- **Solo validar antes de escribir, sin compensar (ADR-0004):** es lo más simple, pero deja inconsistencias si falla un paso crítico después de escribir.

## Consecuencias
- (+) Consistencia entre microservicios sin acoplar sus bases de datos ni usar bloqueos distribuidos.
- (-) El `api-bff` asume más responsabilidad de manejo de errores y de timeouts, más delicada con los arranques lentos del plan gratuito de Render.
- (-) Cada compensación debe ser idempotente para poder reintentarse sin efectos duplicados.
