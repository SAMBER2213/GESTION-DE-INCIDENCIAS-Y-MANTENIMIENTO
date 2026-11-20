# ADR-0004: Adoptar microservicios alineados con los Bounded Contexts

- **Estado:** Propuesto
- **Fecha:** 2026-11-14
- **Reemplaza parcialmente:** RT-08 (un solo servicio que sirve también el frontend) y el alcance del ADR-0003 (despliegue de un único servicio). Los ADR-0001 y ADR-0002 siguen vigentes: cada servicio usa Node.js, Express, MongoDB y Mongoose.

## Contexto
El sistema se diseñó como un monolito: un solo servidor Express, una sola base de datos y capas internas (modelos, controladores, rutas). La asignatura pide diseñar y construir el sistema con microservicios. El Event Storming (ver `docs/EventStorming/`) identificó cinco Bounded Contexts con lenguaje propio y reglas que casi no se cruzan: Identidad y Acceso, Gestión de Incidencias, Proveedores y Contratistas, Finanzas y Presupuesto, y Comunicación y Avisos. El término «Técnico» tiene un significado distinto en tres de ellos, lo que confirma los límites.

## Decisión
Dividir el sistema en **cinco microservicios**, uno por Bounded Context (`ms-usuarios`, `ms-incidencias`, `ms-proveedores`, `ms-finanzas`, `ms-comunicaciones`), más una capa API (`api-bff`) que sirve el frontend y orquesta a los demás (ver ADR-0005).

Se sigue la Fórmula Universal de Dimensionamiento: empezar con pocos servicios de grano grueso alineados con capacidades de negocio y dividir más adelante solo cuando haya una necesidad real de evitar coordinación.

## Alternativas consideradas
- **Mantener el monolito, organizado en módulos por contexto:** más simple de operar y suficiente para el tamaño del proyecto. Es una alternativa válida; se descarta porque el objetivo del curso es aplicar y evaluar la arquitectura de microservicios. Si el equipo prefiere esta opción, este ADR debe quedar *Rechazado* y los límites del Event Storming se usan igualmente como módulos.
- **Un microservicio por entidad (seis, uno por modelo):** demasiada granularidad desde el inicio. Separaría `Proveedor` y `OrdenServicio`, que comparten la regla RF-14 y necesitan consistencia inmediata.
- **Funciones *serverless* por operación:** complejidad excesiva y coordinación constante entre funciones; *serverless* no es sinónimo de microservicios.

## Consecuencias
- (+) Cada servicio tiene un alcance acotado y puede desarrollarse, probarse y desplegarse por separado; el equipo puede trabajar en paralelo.
- (+) Los límites siguen capacidades de negocio, no capas técnicas.
- (+) Dividir más adelante (por ejemplo, separar estadísticas) es más fácil que fusionar servicios.
- (-) Más piezas que operar: cinco servicios y una capa API en lugar de uno.
- (-) En el plan gratuito de Render los servicios se suspenden por inactividad; una petición que toque varios servicios puede acumular los tiempos de arranque (RNF-13 ya tolera el arranque lento, pero se debe medir).
- (-) No hay transacciones entre servicios: las operaciones que tocan dos contextos validan antes de escribir y aceptan que algunas acciones secundarias (notificar) fallen sin revertir la principal.
- (-) Hay que actualizar la documentación: RT-08, RT-21 (comando de inicio), ADR-0003 y los diagramas DS-01 a DS-12, que muestran un solo servidor.

