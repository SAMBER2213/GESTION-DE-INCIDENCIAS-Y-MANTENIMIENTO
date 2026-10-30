# ADR-0003: Desplegar la aplicación en Render

- **Estado:** Aceptado
- **Fecha:** 2026-10-30

## Contexto
La aplicación debe estar disponible en internet para que el equipo y el profesor puedan probarla. El presupuesto es nulo y el equipo no tiene experiencia administrando servidores.

## Decisión
Desplegar el backend (y los archivos del frontend) en Render, conectado al repositorio de GitHub.

## Alternativas consideradas
- **Heroku:** conocido, pero sin plan gratuito.
- **Vercel / Netlify:** muy buenos para frontend, menos adecuados para un backend Express persistente.
- **AWS / servidor propio:** más control, pero con mucha más configuración y costo.

## Consecuencias
- (+) Despliegue automático al hacer push a GitHub.
- (+) Plan gratuito suficiente para un proyecto académico.
- (+) Poca configuración de infraestructura.
- (-) En el plan gratuito el servicio se suspende por inactividad, y la primera petición puede tardar en responder.
- (-) Dependemos de un proveedor externo y de sus límites.
