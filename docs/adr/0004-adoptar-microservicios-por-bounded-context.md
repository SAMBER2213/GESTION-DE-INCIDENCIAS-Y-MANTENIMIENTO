# ADR-0004: Adoptar microservicios alineados con los Bounded Contexts

- **Estado:** Aceptado
- **Fecha:** 2026-11-14

## Contexto
El sistema reúne capacidades de negocio distintas: identidad y acceso, gestión de incidencias, proveedores y contratistas, finanzas y presupuesto, y comunicación con la comunidad. El Event Storming (ver `docs/EventStorming/event-storming-completo.md`) identificó cinco Bounded Contexts con lenguaje propio y reglas que casi no se cruzan. El término «Técnico» tiene un significado distinto en tres de ellos (quien repara, contratista con documentos, usuario con rol), lo que confirma los límites. Hay que decidir cómo se dividen esas capacidades en unidades que se desarrollen, desplieguen y evolucionen por separado.

## Decisión
Dividir el sistema en **cinco microservicios**, uno por Bounded Context (`ms-usuarios`, `ms-incidencias`, `ms-proveedores`, `ms-finanzas`, `ms-comunicaciones`), más una capa API (`api-bff`) que sirve el frontend y orquesta a los microservicios (ver ADR-0005). Cada servicio es dueño de sus datos (ver ADR-0006).

Se sigue un criterio de dimensionamiento gradual: empezar con pocos servicios de grano grueso alineados con capacidades de negocio y dividir más adelante solo cuando haya una necesidad real de evitar coordinación.

## Alternativas consideradas
- **Una sola aplicación desplegable, organizada en módulos por contexto:** más simple de operar y suficiente para el tamaño del proyecto, pero no permite desplegar ni escalar los contextos por separado, y el objetivo del curso es aplicar y evaluar la arquitectura de microservicios.
- **Un microservicio por entidad (seis, uno por modelo):** demasiada granularidad desde el inicio. Separaría `Proveedor` y `OrdenServicio`, que comparten la regla RF-14 y necesitan consistencia inmediata.
- **Funciones *serverless* por operación:** complejidad excesiva y coordinación constante entre funciones; *serverless* no es sinónimo de microservicios.

## Consecuencias
- (+) Cada servicio tiene un alcance acotado y puede desarrollarse, probarse y desplegarse por separado; el equipo puede trabajar en paralelo.
- (+) Los límites siguen capacidades de negocio, no capas técnicas.
- (+) Dividir más adelante (por ejemplo, separar estadísticas) es más fácil que fusionar servicios.
- (-) Más piezas que operar: cinco servicios y una capa API.
- (-) En el plan gratuito de Render los servicios se suspenden por inactividad; una petición que toque varios servicios puede acumular los tiempos de arranque (RNF-13 ya tolera el arranque lento, pero se debe medir).
- (-) No hay transacciones entre servicios: las operaciones que tocan dos contextos validan antes de escribir y aceptan que algunas acciones secundarias (notificar) fallen sin revertir la principal.
