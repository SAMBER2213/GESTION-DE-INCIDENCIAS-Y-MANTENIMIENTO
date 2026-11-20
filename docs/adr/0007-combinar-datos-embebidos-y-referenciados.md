# ADR-0007: Modelado de datos embebidos vs. referenciados entre microservicios

- **Estado:** Propuesto
- **Fecha:** 2026-11-20

## Contexto
El sistema usa MongoDB Atlas con una base de datos lógica por microservicio (ADR-0002 y ADR-0006). Hay que definir qué información se guarda embebida dentro de un mismo documento y cuál se referencia por identificador, para no acoplar los datos entre Bounded Contexts ni duplicarlos de forma inconsistente.

## Decisión
Adoptar una estrategia híbrida según los límites de cada microservicio:

1. **Datos embebidos dentro del mismo agregado (intraservicio):**
   - En `ms-incidencias`, los comentarios de seguimiento, las URLs de las fotos de evidencia y los datos básicos de diagnóstico se guardan dentro del documento de la incidencia, porque comparten su ciclo de vida y siempre se consultan juntos.
   - En `ms-proveedores`, las calificaciones y reseñas de desempeño se guardan dentro del agregado del proveedor.
   - En `ms-finanzas`, los ítems o soportes de un gasto se guardan dentro del registro de la transacción.

2. **Referencias por identificador (interservicio):**
   - Entre microservicios no hay `joins` ni referencias directas a colecciones externas; solo se guardan identificadores lógicos (`usuarioId`, `incidenciaId`, `proveedorId`, `ordenServicioId`).
   - Cuando conviene, se guarda una copia de un dato descriptivo (por ejemplo, el nombre de quien reporta), aceptando que puede quedar desactualizada en registros históricos (ver ADR-0006).
   - La composición de datos para la interfaz se hace en el `api-bff` (ADR-0005).

## Alternativas consideradas
- **Referenciar todo y resolverlo con `populate` o `joins`:** es el enfoque relacional clásico, pero obliga a consultar colecciones de otros servicios y rompe el aislamiento del ADR-0006.
- **Duplicar entidades completas en cada servicio:** evita llamadas entre servicios, pero genera copias que se desincronizan y son difíciles de mantener.

## Consecuencias
- (+) Lecturas rápidas y atómicas de entidades completas (una incidencia con su historial y evidencias en una sola consulta).
- (+) Cada servicio controla su esquema sin depender de los demás.
- (-) El `api-bff` debe hacer llamadas compuestas o en paralelo para armar vistas que cruzan usuarios, proveedores e incidencias.
- (-) Los datos copiados pueden quedar desactualizados.
