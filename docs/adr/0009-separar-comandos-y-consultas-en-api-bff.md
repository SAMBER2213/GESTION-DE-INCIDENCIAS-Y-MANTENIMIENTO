# ADR-0009: Separación lógica de comandos y consultas (CQRS ligero en el api-bff)

- **Estado:** Propuesto
- **Fecha:** 2026-11-20

## Contexto
El sistema tiene dos patrones de acceso muy distintos:

1. **Escrituras transaccionales (comandos):** registrar incidencias, asignar técnicos, crear órdenes de servicio, publicar avisos y registrar gastos. Aquí importan las reglas de negocio y la integridad dentro de cada dominio.
2. **Consultas agregadas (tableros):** el dashboard administrativo (`DS-12`) y los filtros combinados (`DS-04`) cruzan métricas de incidencias abiertas y cerradas, ejecución presupuestal y desempeño de proveedores.

## Decisión
Aplicar una **separación lógica entre lectura y escritura (CQRS ligero)**, coordinada desde el `api-bff` y apoyada en endpoints especializados de cada microservicio:

- **Ruta de comandos (escritura):** las peticiones que modifican estado (`POST`, `PUT`, `PATCH`, `DELETE`) entran por el `api-bff` (ADR-0005), que verifica JWT y rol y las reenvía al microservicio dueño del dominio. Si la operación toca más de un servicio, se coordina según el ADR-0010.
- **Ruta de consultas (lectura):** las consultas complejas (como el tablero del `DS-12`) usan endpoints de lectura dedicados (`/resumen`, `/metricas`, `/dashboard`) que hacen agregaciones optimizadas en cada microservicio. El `api-bff` los consulta en paralelo con `Promise.all` y arma un DTO específico de lectura.

## Alternativas consideradas
- **Un único modelo para leer y escribir, armando el dashboard con endpoints CRUD normales:** más simple, pero obliga a traer muchos datos y agregarlos en el `api-bff`, lo que contradice su rol de capa sin lógica de negocio (ADR-0005).
- **Base de datos de lectura separada (réplica o vista materializada):** da mejores tiempos, pero exige sincronizar datos y más infraestructura de la que el proyecto necesita.

## Consecuencias
- (+) Los modelos de dominio no se cargan con lógica de presentación.
- (+) El dashboard responde más rápido al consolidar agregaciones en paralelo, sin replicar bases de datos.
- (-) Hay que mantener contratos DTO específicos para las vistas de consulta en el `api-bff`.
- (-) Si un servicio está dormido (plan gratuito de Render), el dashboard tarda lo que tarde el más lento de los servicios consultados.
