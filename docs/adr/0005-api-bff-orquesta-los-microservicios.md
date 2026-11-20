# ADR-0005: La capa API orquesta a los microservicios y estos no se llaman entre sí

- **Estado:** Propuesto
- **Fecha:** 2026-11-14

## Contexto
Varios casos de uso cruzan contextos: asignar una incidencia exige validar al técnico (Identidad) y notificarlo (Comunicación); registrar un gasto exige confirmar que la incidencia existe; el dashboard combina Incidencias y Finanzas. Hay que decidir dónde vive esa coordinación. Como criterio de diseño, las APIs orquestan y los microservicios implementan, y los microservicios no deben conocerse entre sí mediante llamadas síncronas.

## Decisión
Crear `api-bff`, una capa API que:

- Es el único punto de entrada del frontend (que además sirve como archivos estáticos).
- Verifica el JWT y el rol (RNF-04, RNF-05) antes de reenviar cada petición.
- Orquesta los casos de uso que tocan varios servicios y compone las lecturas que combinan datos.
- No tiene base de datos ni lógica de negocio: las reglas viven en los microservicios.

**Ningún microservicio llama a otro.** Las referencias entre contextos se validan en `api-bff` antes de escribir, y las notificaciones se piden desde `api-bff` sin bloquear la respuesta de la acción principal.

## Alternativas consideradas
- **Llamadas directas entre microservicios (REST):** simples de escribir, pero crean dependencias síncronas y efecto dominó: si `ms-usuarios` está dormido, también fallan Incidencias y Proveedores.
- **Eventos con un *broker* desde el inicio:** desacopla mejor, pero añade infraestructura que mantener y que debe tener plan gratuito (RT-23). Se deja como evolución si hace falta entrega garantizada de notificaciones.
- **El frontend llama a cada microservicio:** expone la estructura interna, repite la verificación de JWT en cada servicio y mueve la orquestación al navegador.

## Consecuencias
- (+) Los microservicios quedan débilmente acoplados y pueden evolucionar por separado.
- (+) La autenticación y los roles se verifican en un solo lugar.
- (+) El frontend conoce una sola API.
- (-) `api-bff` puede convertirse en un cuello de botella o en un «servicio dios». Mitigación: un orquestador por caso de uso, sin reglas de negocio, y revisar este ADR si crece.
- (-) `api-bff` es un punto único de fallo.
- (-) Los servicios internos dependen de que solo `api-bff` los llame. Si el plan gratuito de Render no ofrece servicios privados (verificar), habrá que proteger los endpoints internos con una clave compartida entre `api-bff` y los servicios.
