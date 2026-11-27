# Event Storming — Gestión de Incidencias y Mantenimiento

Descubrimiento de los límites de servicio del sistema mediante Event Storming. El resultado define los microservicios del sistema (ver [ADR-0004](../adr/0004-adoptar-microservicios-por-bounded-context.md), [ADR-0005](../adr/0005-api-bff-orquesta-los-microservicios.md) y [ADR-0006](../adr/0006-una-base-de-datos-logica-por-microservicio.md)).

> **Cómo se construyó.** El tablero se elaboró a partir de lo que ya está documentado (requerimientos funcionales, historias de usuario, job stories, Queries y Actions). Los *hotspots* son preguntas abiertas que el equipo debe resolver; las propuestas que aparecen junto a cada uno son un punto de partida, no una decisión tomada.

## Contenido

1. [Notación](#notación)
2. [Resumen](#resumen)
3. [Fase 1: Descubrir eventos de dominio](#fase-1-descubrir-eventos-de-dominio)
4. [Fase 2: Línea de tiempo coherente](#fase-2-línea-de-tiempo-coherente)
5. [Fase 3: Narrativa inversa y comandos](#fase-3-narrativa-inversa-y-comandos)
6. [Fase 4: Agregados y Bounded Contexts](#fase-4-agregados-y-bounded-contexts)
7. [Fase 5: Análisis competitivo](#fase-5-análisis-competitivo)
8. [Microservicios candidatos](#microservicios-candidatos)
9. [Modelado de datos](#modelado-de-datos)
10. [Patrones de interacción](#patrones-de-interacción)
11. [Decisiones que necesita el equipo](#decisiones-que-necesita-el-equipo)

## Notación

| Color | Elemento | Formato |
|-------|----------|---------|
| 🟧 | Evento de dominio | Verbo en pasado: *Incidencia Reportada* |
| 🟪 | Hotspot (pregunta o confusión) | Pregunta; se captura, no se resuelve en la sesión |
| 🟦 | Comando (lo que causa un evento) | Verbo en presente: *Reportar Incidencia* |
| 🟨 | Agregado (recibe comandos y produce eventos) | Sustantivo: *Incidencia* |
| 🟩 | Política (reacción automática a un evento) | *Cuando [evento], entonces [comando]* |

## Resumen

El sistema se divide en cinco Bounded Contexts que se implementan como cinco microservicios, con una capa API que los orquesta:

| Microservicio | Bounded Context |
|---------------|-----------------|
| `ms-usuarios` | Identidad y Acceso |
| `ms-incidencias` | Gestión de Incidencias |
| `ms-proveedores` | Proveedores y Contratistas |
| `ms-finanzas` | Finanzas y Presupuesto |
| `ms-comunicaciones` | Comunicación y Avisos |
| `api-bff` | Capa de API (no es un Bounded Context) |

El término **Técnico** es el caso ambiguo del dominio: significa cosas distintas en Incidencias (quien repara), Proveedores (contratista con ARL y EPS) e Identidad (usuario con rol). Esa diferencia de significado es la señal que confirma los límites (ver Fase 4).

| Fase | Resultado |
|------|-----------|
| 1. Eventos de dominio | 30 eventos sin orden |
| 2. Línea de tiempo y hotspots | 24 eventos ordenados en una *storyline* y 11 hotspots |
| 3. Comandos | 17 comandos (uno por Action), 3 comandos internos y 3 políticas |
| 4. Agregados y Bounded Contexts | 8 agregados, 5 Bounded Contexts, lenguaje ubicuo y mapa de contextos |
| 5. Análisis competitivo | Priorización de contextos y orden de implementación |
| Microservicios, datos e interacción | 5 microservicios más `api-bff`, colecciones por servicio y 6 diagramas de secuencia |

---

## Fase 1: Descubrir eventos de dominio


**Fuentes usadas en este borrador:** requerimientos funcionales (RF-01 a RF-28), historias de usuario (HU-01 a HU-24), job stories (JS-01 a JS-17) y el flujo básico de una incidencia de `descripcion-proyecto.md`.

Las consultas (lecturas) no producen eventos de dominio: están documentadas como Queries en [queries-actions.md](../queries-actions.md). Por eso seis requerimientos no aparecen en la tabla de eventos y quedan cubiertos solo por Queries: RF-06 (Q-01, Q-02), RF-08 (Q-03), RF-16 (Q-07, Q-09), RF-23 (Q-11), RF-24 (Q-12) y RF-25 (Q-13).

### Eventos descubiertos

#### Usuarios y acceso

| ID | 🟧 Evento | Origen |
|----|-----------|--------|
| E-01 | Usuario Creado | RF-27, HU-23 |
| E-02 | Usuario Editado | RF-27, HU-23 |
| E-03 | Rol de Usuario Cambiado | RF-27, HU-23 |
| E-04 | Usuario Desactivado | RF-27, HU-23 |
| E-05 | Sesión Iniciada | RF-26, HU-22 |
| E-06 | Inicio de Sesión Rechazado | RF-26, HU-22 |
| E-07 | Sesión Cerrada | RF-26, HU-22 |
| E-08 | Acceso Denegado por Rol | RF-28, HU-24 |

#### Incidencias

| ID | 🟧 Evento | Origen |
|----|-----------|--------|
| E-09 | Incidencia Reportada | RF-01, HU-01 |
| E-10 | Fotos de Incidencia Adjuntadas | RF-02, HU-01 |
| E-11 | Incidencia Asignada a Técnico | RF-04, HU-03 |
| E-12 | Incidencia Puesta En Proceso | RF-07, HU-05 |
| E-13 | Evidencia Antes y Después Cargada | RF-10, HU-07 |
| E-14 | Incidencia Solucionada | RF-10, HU-07 |
| E-15 | Reparación Registrada en el Historial | RF-09, HU-08 |

#### Proveedores y contratistas

| ID | 🟧 Evento | Origen |
|----|-----------|--------|
| E-16 | Proveedor Registrado | RF-11, HU-09 |
| E-17 | Proveedor Editado | RF-11, HU-09 |
| E-18 | Proveedor Desactivado | RF-11, HU-09 |
| E-19 | Documento de Seguridad Social Cargado | RF-13, HU-10 |
| E-20 | Orden de Servicio Generada | RF-12, HU-11 |
| E-21 | Orden de Servicio Rechazada por Documentos No Vigentes | RF-14, HU-11 |
| E-22 | Proveedor Calificado | RF-15, HU-12 |

#### Comunicación y transparencia

| ID | 🟧 Evento | Origen |
|----|-----------|--------|
| E-23 | Administrador Notificado de Nueva Incidencia | RF-03, HU-02 |
| E-24 | Técnico Notificado de Asignación | RF-05, HU-03 |
| E-25 | Aviso Publicado | RF-17, HU-14 |
| E-26 | Residentes Notificados del Aviso | RF-18, HU-14 |
| E-27 | Aviso Vencido | RF-19, HU-15 |

#### Gastos y presupuesto

| ID | 🟧 Evento | Origen |
|----|-----------|--------|
| E-28 | Gasto Registrado | RF-21, HU-17 |
| E-29 | Presupuesto Anual Definido | RF-22, HU-18 |
| E-30 | Presupuesto Anual Modificado | RF-22, HU-18 |

**Resultado de la fase:** 30 eventos sin ordenar y con duplicados. La Fase 2 los depura y los ordena.

---

## Fase 2: Línea de tiempo coherente


### 1. Duplicados eliminados

De los 30 eventos de la Fase 1 se retiran 6, que quedan fusionados o descartados:

| Evento | Decisión | Razón |
|--------|----------|-------|
| E-10 Fotos de Incidencia Adjuntadas | Se fusiona en **E-09** | Las fotos viajan en el mismo reporte (A-06); no hay un paso separado. |
| E-13 Evidencia Antes y Después Cargada | Se fusiona en **E-14** | RF-10 exige ambas fotos para cerrar: la evidencia es parte del cierre (A-09). |
| E-15 Reparación Registrada en el Historial | Se descarta | El historial de reparaciones no es un agregado sino una **proyección** de las incidencias solucionadas y sus gastos (Q-05). |
| E-03 Rol de Usuario Cambiado | Se fusiona en **E-02** | A-04 edita datos y rol en una sola operación. |
| E-30 Presupuesto Anual Modificado | Se fusiona en **E-29** | A-17 define o reemplaza el presupuesto del año; el anterior queda como histórico (RNF-17). |
| E-27 Aviso Vencido | Se descarta | Lo produce el paso del tiempo, no un comando. Se calcula en la consulta comparando `fecha_fin` con la fecha actual (Q-10). |

**Quedan 24 eventos.**

### 2. Storyline (línea de tiempo)

Los eventos se organizan en cinco actos. Los eventos entre paréntesis son alternativas o ramas.

#### Acto 1: Acceso al sistema

1. 🟧 E-01 Usuario Creado
2. 🟧 E-05 Sesión Iniciada *(rama: 🟧 E-06 Inicio de Sesión Rechazado)*

#### Acto 2: Ciclo de vida de una incidencia

3. 🟧 E-09 Incidencia Reportada
4. 🟧 E-23 Administrador Notificado de Nueva Incidencia
5. *(rama con contratista externo)* 🟧 E-16 Proveedor Registrado → 🟧 E-19 Documento de Seguridad Social Cargado → 🟧 E-20 Orden de Servicio Generada *(rama: 🟧 E-21 Orden de Servicio Rechazada por Documentos No Vigentes)*
6. 🟧 E-11 Incidencia Asignada a Técnico
7. 🟧 E-24 Técnico Notificado de Asignación
8. 🟧 E-12 Incidencia Puesta En Proceso
9. 🟧 E-14 Incidencia Solucionada (con evidencia de antes y después)
10. 🟧 E-28 Gasto Registrado
11. 🟧 E-22 Proveedor Calificado

#### Acto 3: Comunicación a la comunidad

12. 🟧 E-25 Aviso Publicado
13. 🟧 E-26 Residentes Notificados del Aviso

#### Acto 4: Control de presupuesto

14. 🟧 E-29 Presupuesto Anual Definido
15. 🟧 E-28 Gasto Registrado *(se acumula contra el presupuesto; lo consulta el dashboard)*

#### Acto 5: Administración

16. 🟧 E-02 Usuario Editado
17. 🟧 E-04 Usuario Desactivado
18. 🟧 E-07 Sesión Cerrada
19. 🟧 E-17 Proveedor Editado · 🟧 E-18 Proveedor Desactivado
20. 🟧 E-08 Acceso Denegado por Rol *(puede ocurrir en cualquier acto)*

### 3. Hotspots

| ID | 🟪 Pregunta | Origen | Propuesta para discutir | Impacto en los límites |
|----|-------------|--------|-------------------------|------------------------|
| H-01 | ¿El **Técnico** es un usuario del sistema, un proveedor externo o ambos? | RF-04 asigna a "un técnico"; RF-12 y RF-13 hablan del "técnico contratado"; el rol Técnico es "personal o contratista" | El Técnico es un **Usuario** con rol Técnico (identidad en Identidad y Acceso). El **Proveedor** es la ficha del contratista y puede tener un `usuario_id` opcional. Incidencias solo guarda `tecnico_id` | Define la frontera entre Identidad, Incidencias y Proveedores |
| H-02 | ¿Asignar la incidencia a un contratista externo exige una orden de servicio? | RF-12 no la hace obligatoria | Es opcional. Si existe, la orden guarda `incidencia_id` y no bloquea la asignación | Evita que Incidencias dependa de Proveedores |
| H-03 | ¿Se puede reasignar una incidencia o devolverla a Pendiente? | No hay requerimiento | Reasignar solo mientras no esté Solucionada, y registrar el cambio en `historial_estados` | Regla interna de Incidencias |
| H-04 | ¿Quién registra el costo de una reparación: el técnico al cerrar o el administrador? | RF-09 pide "cuánto costó"; RF-21 dice que registra gastos el administrador | El `costo_total` es la **suma de los Gastos** (RF-21). El técnico no ingresa costos | Costo vive en Finanzas, no en Incidencias |
| H-05 | ¿Qué pasa si vencen los documentos ARL/EPS después de generar una orden? | RF-14 solo valida al generar la orden | No se cancelan órdenes existentes. Q-08 muestra la vigencia actual | Regla interna de Proveedores |
| H-06 | ¿Qué pasa si los gastos superan el presupuesto anual? | Sin requerimiento | Se permite y Q-13 muestra `porcentaje_ejecutado` mayor a 100 | Regla interna de Finanzas |
| H-07 | ¿El sistema atiende varias copropiedades? | RNF-18: agregar edificios o conjuntos sin cambiar código | Incluir `copropiedad_id` en el token y en todos los documentos desde el inicio. Si no se necesita, documentarlo y aplazarlo | Campo transversal en todos los servicios |
| H-08 | ¿Qué pasa si falla el envío de un correo? | RF-03, RF-05, RF-18 | No bloquea la acción principal. Se registra el intento y el error en `notificaciones` | Aísla Comunicaciones de los demás servicios |
| H-09 | ¿Se puede reabrir una incidencia Solucionada? | JS-08: "cuando un daño se repite" | No se reabre en esta fase; si el daño se repite, se reporta una incidencia nueva | Mantiene simple el ciclo de estados |
| H-10 | ¿El dashboard se compone en tiempo real o se prepara una réplica de lectura? | Q-11, Q-12 y Q-13 usan datos de dos contextos | Composición en tiempo real en la capa API; evaluar CQRS si el volumen crece (RNF-02) | Define dónde vive el dashboard |
| H-11 | ¿Cómo se cierra sesión si el token JWT no tiene estado? | RF-26; A-02 | El cliente descarta el token y este tiene expiración corta | Detalle de Identidad |

**Resultado de la fase:** línea de tiempo ordenada de 24 eventos con 11 hotspots marcados para seguimiento fuera de la sesión.

---

## Fase 3: Narrativa inversa y comandos


Cada comando corresponde exactamente a una **Action** de [queries-actions.md](../queries-actions.md). Las Queries no aparecen aquí porque no cambian el estado.

### 1. Comandos

| ID | 🟦 Comando | Quién lo ejecuta | 🟧 Evento(s) que produce | Action | RF |
|----|-----------|------------------|--------------------------|--------|----|
| C-01 | Iniciar Sesión | Todos | E-05 · E-06 | A-01 | RF-26 |
| C-02 | Cerrar Sesión | Todos | E-07 | A-02 | RF-26 |
| C-03 | Crear Usuario | Administrador | E-01 | A-03 | RF-27 |
| C-04 | Editar Usuario y Asignar Rol | Administrador | E-02 | A-04 | RF-27 |
| C-05 | Desactivar Usuario | Administrador | E-04 | A-05 | RF-27 |
| C-06 | Reportar Incidencia | Residente | E-09 | A-06 | RF-01, RF-02, RF-03 |
| C-07 | Asignar Incidencia a un Técnico | Administrador | E-11 | A-07 | RF-04, RF-05 |
| C-08 | Poner una Incidencia en Proceso | Técnico | E-12 | A-08 | RF-07 |
| C-09 | Cerrar Incidencia con Evidencia | Técnico | E-14 | A-09 | RF-09, RF-10, RF-20 |
| C-10 | Registrar Proveedor | Administrador | E-16 | A-10 | RF-11 |
| C-11 | Editar o Desactivar Proveedor | Administrador | E-17 · E-18 | A-11 | RF-11 |
| C-12 | Cargar Documento de Seguridad Social | Administrador | E-19 | A-12 | RF-13 |
| C-13 | Generar Orden de Servicio | Administrador | E-20 · E-21 | A-13 | RF-12, RF-14 |
| C-14 | Calificar Proveedor | Administrador | E-22 | A-14 | RF-15 |
| C-15 | Publicar Aviso | Administrador | E-25 | A-15 | RF-17, RF-18 |
| C-16 | Registrar Gasto de una Reparación | Administrador | E-28 | A-16 | RF-09, RF-21 |
| C-17 | Definir Presupuesto Anual | Administrador | E-29 | A-17 | RF-22 |

El evento **E-08 Acceso Denegado por Rol** no tiene comando propio: lo puede producir cualquiera de los comandos anteriores cuando el rol no corresponde (`middlewares/roles.js`).

### 2. Políticas (reacciones automáticas)

Tres eventos no los causa una persona sino una reacción a otro evento. Para ello aparecen tres comandos internos que ninguna persona ejecuta y que no tienen Action propia:

| ID | 🟩 Política | 🟦 Comando interno | 🟧 Evento | RF |
|----|-------------|--------------------|-----------|----|
| P-01 | Cuando **Incidencia Reportada** (E-09), entonces notificar al administrador | C-18 Notificar Administrador | E-23 | RF-03 |
| P-02 | Cuando **Incidencia Asignada a Técnico** (E-11), entonces notificar al técnico | C-19 Notificar Técnico | E-24 | RF-05 |
| P-03 | Cuando **Aviso Publicado** (E-25), entonces notificar a los residentes | C-20 Notificar Residentes | E-26 | RF-18 |

### 3. Hotspots nuevos

No se identificaron hotspots adicionales a los 11 de la Fase 2. La narrativa inversa confirmó dos de ellos:

- **H-01:** al recorrer hacia atrás *Incidencia Asignada a Técnico* aparece la pregunta de qué es un técnico y quién lo valida (C-07 necesita saber si el técnico existe y está activo).
- **H-04:** al recorrer hacia atrás *Gasto Registrado* se confirma que el costo lo produce el administrador, no el técnico (C-09 no recibe ningún monto).

**Resultado de la fase:** 17 comandos (uno por Action), 3 comandos internos y 3 políticas, ubicados sobre la línea de tiempo.

---

## Fase 4: Agregados y Bounded Contexts


### 1. Agregados

| 🟨 Agregado | Comandos que recibe | 🟧 Eventos que produce | Reglas que protege (invariantes) |
|-------------|---------------------|------------------------|----------------------------------|
| **Usuario** | C-01, C-02, C-03, C-04, C-05 | E-01, E-02, E-04, E-05, E-06, E-07 | El correo es único. La contraseña se guarda cifrada (RNF-03). El rol es Residente, Técnico o Administrador. Un usuario inactivo no inicia sesión. |
| **Incidencia** | C-06, C-07, C-08, C-09 | E-09, E-11, E-12, E-14 | El estado avanza Pendiente → En proceso → Solucionado. Solo el técnico asignado cambia el estado. No se pasa a Solucionado sin foto del antes y del después (RF-10). No se asigna una incidencia ya Solucionada. |
| **Proveedor** (incluye sus documentos y calificaciones) | C-10, C-11, C-12, C-14 | E-16, E-17, E-18, E-19, E-22 | Hay un documento vigente por tipo (ARL y EPS); el anterior queda como histórico. Cada puntaje de calificación va de 1 a 5 y el promedio se recalcula. |
| **OrdenServicio** | C-13 | E-20, E-21 | No se genera si el proveedor no tiene ARL y EPS vigentes (RF-14). Lleva al menos una tarea. |
| **Aviso** | C-15 | E-25 | `fecha_fin` no puede ser anterior a `fecha_inicio`. |
| **Notificación** | C-18, C-19, C-20 | E-23, E-24, E-26 | Queda registro de cada envío y de su error si falla (H-08). |
| **Gasto** | C-16 | E-28 | El monto es mayor que cero. El concepto es repuestos o mano de obra. Pertenece a una incidencia. |
| **Presupuesto** | C-17 | E-29 | Hay un solo presupuesto vigente por año; el anterior queda como histórico (RNF-17). |

Los 24 eventos de la línea de tiempo quedan cubiertos: 23 los produce un agregado y **E-08 Acceso Denegado por Rol** es transversal (lo produce la capa API al verificar el rol).

`OrdenServicio` es un agregado separado de `Proveedor` porque tiene su propio ciclo de vida, pero se mantiene en el mismo contexto: la regla RF-14 necesita leer el estado de los documentos del proveedor con consistencia inmediata, y eso solo es sencillo dentro de un mismo servicio.

### 2. Ubiquitous Language

Técnica: se extraen los sustantivos de las job stories y, si un término aparece con **significados o contextos diferentes**, se está cruzando un límite de Bounded Context.

#### 2.1 Términos que aparecen en varias job stories

| Término | Job stories | Contexto probable |
|---------|-------------|-------------------|
| Incidencia | JS-01, 02, 03, 04, 05, 06, 07, 08 | Gestión de Incidencias |
| Técnico | JS-03, 05, 06, 09 | **Ambiguo** (ver 2.3) |
| Estado | JS-04, 05, 07 | Gestión de Incidencias |
| Ubicación / zona | JS-07, 15 | Gestión de Incidencias |
| Foto / evidencia | JS-01, 06 | Gestión de Incidencias |
| Costo / gasto | JS-08, 14 | Finanzas y Presupuesto |
| Proveedor | JS-09, 10, 11 | Proveedores y Contratistas |
| Orden de servicio | JS-10 | Proveedores y Contratistas |
| Aviso | JS-12, 13 | Comunicación y Avisos |
| Usuario / rol | JS-16, 17 | Identidad y Acceso |

#### 2.2 Términos específicos por actor

| Actor | Términos exclusivos |
|-------|---------------------|
| Residente | Reporte, foto, estado de mi reporte, aviso, corte de agua |
| Técnico | Incidencias asignadas, estado, foto del antes y del después |
| Administrador | Asignación, proveedor, orden de servicio, ARL y EPS, calificación, presupuesto, gasto, dashboard |

#### 2.3 El caso ambiguo: «Técnico»

| Contexto | Significado | Bounded Context |
|----------|-------------|-----------------|
| Quien repara (JS-05, JS-06) | Persona a la que se asigna una incidencia (solo se necesita su identificador y nombre) | Gestión de Incidencias |
| Contratista con documentos (JS-09) | Proveedor que debe tener ARL y EPS vigentes antes de ingresar | Proveedores y Contratistas |
| Quien inicia sesión | Usuario con rol Técnico | Identidad y Acceso |

Un término con significados distintos en distintos contextos es una señal de que esos contextos son separados. Su resolución propuesta está en el hotspot **H-01**.

#### 2.4 Otras distinciones del lenguaje

| Par de términos | Diferencia |
|-----------------|------------|
| **Asignación** vs **Orden de servicio** | La *asignación* vincula una incidencia con un técnico. La *orden de servicio* contrata a un proveedor y detalla tareas. Una incidencia puede tener asignación sin orden (H-02). |
| **Aviso** vs **Notificación** | El *aviso* es un comunicado publicado para la comunidad, con vigencia. La *notificación* es un correo automático que dispara un evento. |
| **Costo total** vs **Gasto** | El *gasto* es un registro de repuestos o mano de obra. El *costo total* de una incidencia es la suma de sus gastos (H-04). |

#### 2.5 Ubiquitous Language por Bounded Context

**Identidad y Acceso**

| Término | Definición |
|---------|------------|
| Usuario | Persona con acceso al sistema |
| Rol | Residente, Técnico o Administrador |
| Sesión | Período de acceso iniciado con correo y contraseña |
| Usuario activo / inactivo | Solo los activos pueden iniciar sesión |

**Gestión de Incidencias**

| Término | Definición |
|---------|------------|
| Incidencia | Daño reportado en la copropiedad |
| Tipo | Eléctrica, plomería, ascensor u otra |
| Prioridad | Alta, Media o Baja |
| Estado | Pendiente, En proceso o Solucionado |
| Ubicación (zona) | Lugar donde ocurre el daño |
| Asignación | Vínculo entre una incidencia y el técnico que la atiende |
| Evidencia | Foto del antes y del después |
| Reparación | Trabajo con el que se soluciona la incidencia |

**Proveedores y Contratistas**

| Término | Definición |
|---------|------------|
| Proveedor | Persona o empresa externa contratada |
| Especialidad | Área de trabajo del proveedor |
| Documento de seguridad social | ARL o EPS, con fecha de vencimiento |
| Vigencia | Un documento está vigente si no ha vencido |
| Orden de servicio | Documento con las tareas que debe hacer el proveedor |
| Calificación | Puntaje de calidad, cumplimiento de tiempos y respeto del presupuesto |

**Finanzas y Presupuesto**

| Término | Definición |
|---------|------------|
| Gasto | Valor pagado en repuestos o mano de obra de una reparación |
| Concepto | Repuestos o mano de obra |
| Presupuesto anual | Monto de mantenimiento definido para un año |
| Gasto acumulado | Suma de los gastos del año |
| Saldo disponible | Presupuesto menos gasto acumulado |

**Comunicación y Avisos**

| Término | Definición |
|---------|------------|
| Aviso | Comunicado publicado para la comunidad |
| Vigencia del aviso | Período entre `fecha_inicio` y `fecha_fin` |
| Notificación | Correo automático generado por un evento |
| Destinatario | Persona que recibe una notificación |

### 3. Bounded Contexts

Los *clusters* de agregados, comandos y eventos dan cinco Bounded Contexts:

| Bounded Context | 🟨 Agregados | Comandos | Actores |
|-----------------|--------------|----------|---------|
| **Identidad y Acceso** | Usuario | C-01 a C-05 | Todos |
| **Gestión de Incidencias** | Incidencia | C-06 a C-09 | Residente, Técnico, Administrador |
| **Proveedores y Contratistas** | Proveedor, OrdenServicio | C-10 a C-14 | Administrador |
| **Finanzas y Presupuesto** | Gasto, Presupuesto | C-16, C-17 | Administrador |
| **Comunicación y Avisos** | Aviso, Notificación | C-15, C-18, C-19, C-20 | Administrador, Residente |

El **dashboard** (RF-23 a RF-25) no es un Bounded Context: no tiene agregados ni comandos propios, solo lee datos de Incidencias y Finanzas. Se resuelve en la capa API (hotspot H-10).

### 4. Context Map

Relaciones entre contextos, con los patrones habituales de relación entre contextos (Open Host Service, Anti-Corruption Layer, Customer-Supplier, Conformist):

| Contextos | Patrón | Descripción |
|-----------|--------|-------------|
| Identidad y Acceso → todos los demás | **Open Host Service** y *Published Language*; los demás son **Conformist** | Identidad publica un token JWT con `usuario_id`, `rol` y `copropiedad_id`. Los otros contextos aceptan ese formato tal como es. |
| Gestión de Incidencias → Finanzas y Presupuesto | **Customer-Supplier** | Finanzas (cliente) necesita que Incidencias (proveedor) confirme que `incidencia_id` existe antes de registrar un gasto. La confirmación la orquesta la capa API. |
| Gestión de Incidencias ↔ Proveedores y Contratistas | Sin dependencia de modelo | Se enlazan solo por identificadores (`incidencia_id` en la orden de servicio, H-02). Ninguno conoce el modelo del otro. |
| Todos → Comunicación y Avisos | **Anti-Corruption Layer** | Comunicación recibe un objeto *destinatario* propio (`correo`, `nombre`) y no conoce el modelo de Usuario ni de Incidencia. |
| Incidencias y Finanzas → Dashboard (capa API) | **Open Host Service** | Ambos publican endpoints de lectura que la capa API compone. |

![Mapa de contextos](../diagramas/img/mapa-de-contextos.png)

Código fuente del diagrama: [mapa-de-contextos.puml](../diagramas/mapa-de-contextos.puml).

**Resultado de la fase:** 8 agregados agrupados en 5 Bounded Contexts, con Ubiquitous Language y Context Map.

---

## Fase 5: Análisis competitivo


Guía de decisión:

| Combinación | Decisión |
|-------------|----------|
| Gran ventaja + gran esfuerzo | Diseñar e implementar *in-house* |
| Pequeña ventaja + gran esfuerzo | Comprar |
| Pequeña ventaja + pequeño esfuerzo | Asignar a *trainees* |
| Otras combinaciones | Juicio |

En este proyecto «ventaja competitiva» se interpreta como **valor para el objetivo del sistema** (reportar, atender y documentar incidencias, y dar información para decidir).

### Matriz

| Bounded Context | Ventaja | Dificultad | Razón | Decisión |
|-----------------|:-------:|:----------:|-------|----------|
| Gestión de Incidencias | **L** | M | Es el núcleo: el problema que describe el proyecto. Incluye fotos, estados, permisos por rol e historial. | Diseñar e implementar *in-house* |
| Proveedores y Contratistas | M | M | Diferencia al sistema de un simple registro de reportes (órdenes, ARL y EPS, calificaciones), con reglas propias (RF-14). | *In-house* |
| Finanzas y Presupuesto | M | S | Habilita las decisiones del administrador (RF-21 a RF-25) con un modelo sencillo. | *In-house* |
| Comunicación y Avisos | S | S | El envío de correos se realiza desde Python con `smtplib` o `aiosmtplib` (RT-16). | Asignar a *trainees*: es el servicio ideal para que un integrante nuevo pruebe la plantilla de microservicio |
| Identidad y Acceso | S | M | Es necesario pero no diferencia al sistema; la seguridad exige cuidado. | Juicio: construir una versión mínima con `bcrypt` y `jsonwebtoken` (RT-12). Reevaluar *comprar* (un servicio de identidad gestionado) si crece la complejidad |

Esta matriz es una propuesta; el equipo debe ajustarla según su experiencia y el tiempo disponible.

### Orden de implementación sugerido

1. **Base común:** plantilla de microservicio, `api-bff` y `ms-usuarios`. Sin autenticación no se puede probar nada más.
2. **`ms-incidencias`:** el núcleo (A-06 a A-09 y sus Queries). Con esto ya existe el flujo básico completo.
3. **`ms-comunicaciones`:** notificaciones de nueva incidencia y de asignación (P-01 y P-02), y luego avisos.
4. **`ms-proveedores`:** proveedores, documentos, órdenes de servicio y calificaciones.
5. **`ms-finanzas` y dashboard:** gastos, presupuesto y las vistas compuestas (Q-05, Q-11, Q-12 y Q-13).

**Resultado de la fase:** contextos priorizados y un orden de construcción que entrega valor desde el segundo paso.

---

## Microservicios candidatos

Los Bounded Contexts son el **punto de partida** para dimensionar, no un sinónimo de microservicio. Aquí se aplica un criterio de dimensionamiento con tres principios:

1. **Empezar con pocos microservicios**, de grano grueso y alineados con capacidades de negocio.
2. **Dividir a medida que crecen** la aplicación y los servicios, guiados por la necesidad de evitar coordinación (no por líneas de código).
3. **Estar en la trayectoria correcta**: lo que importa es la dirección (menos coordinación), no la perfección inicial.

Por eso cada Bounded Context da **un** microservicio, y no uno por entidad.

### 1. Microservicios

| Microservicio | Bounded Context | Agregados | Base de datos lógica |
|---------------|-----------------|-----------|----------------------|
| `ms-usuarios` | Identidad y Acceso | Usuario | `usuarios_db` |
| `ms-incidencias` | Gestión de Incidencias | Incidencia | `incidencias_db` |
| `ms-proveedores` | Proveedores y Contratistas | Proveedor, OrdenServicio | `proveedores_db` |
| `ms-finanzas` | Finanzas y Presupuesto | Gasto, Presupuesto | `finanzas_db` |
| `ms-comunicaciones` | Comunicación y Avisos | Aviso, Notificación | `comunicaciones_db` |

#### Capa API: `api-bff`

Las APIs son la **interfaz externa** y los microservicios la **implementación**; las APIs orquestan a los microservicios y estos **no se llaman entre sí**. El `api-bff` es esa capa y tiene estas responsabilidades:

- Servir el frontend estático (se conserva RT-08) y exponer la API REST que consume (`/api/...`).
- Verificar el token JWT y el rol antes de pasar la petición (RNF-04, RNF-05, RF-28).
- **Orquestar** los casos de uso que tocan varios servicios (por ejemplo, asignar una incidencia y notificar al técnico).
- **Componer** las lecturas que combinan datos de varios servicios (Q-02, Q-05 y el dashboard).
- No contiene lógica de negocio ni base de datos propia.

### 2. Comprobación de los tres principios de buenos límites

| Microservicio | Débilmente acoplado | Altamente cohesivo | Alineado con negocio |
|---------------|---------------------|--------------------|----------------------|
| `ms-usuarios` | No llama a nadie; los demás solo leen el JWT que emite | Todo lo de cuentas, roles y sesiones | Capacidad: controlar quién usa el sistema |
| `ms-incidencias` | Guarda solo `tecnico_id` y `reportado_por`; no conoce proveedores ni gastos | Reporte, ciclo de estados, evidencia y estadísticas de incidencias | Capacidad: atender daños |
| `ms-proveedores` | Se enlaza con incidencias solo por `incidencia_id` | Proveedor, documentos, órdenes y calificaciones cambian juntos | Capacidad: contratar y evaluar contratistas |
| `ms-finanzas` | Guarda `incidencia_id` como referencia | Gastos y presupuesto se consultan juntos (Q-13) | Capacidad: controlar el gasto |
| `ms-comunicaciones` | Recibe destinatarios ya resueltos; no conoce Usuario | Avisos y notificaciones comparten el canal de correo | Capacidad: informar a la comunidad |

### 3. Propiedad de las Queries y Actions

Cada operación de [queries-actions.md](../queries-actions.md) tiene un único servicio dueño. Las lecturas que combinan datos de dos servicios las compone `api-bff`. Los endpoints son internos (entre `api-bff` y los servicios) y se detallarán en la especificación OpenAPI de cada servicio.

#### `ms-usuarios`

| Operación | Endpoint interno sugerido |
|-----------|---------------------------|
| A-01 Iniciar sesión | `POST /usuarios/login` |
| A-03 Crear usuario | `POST /usuarios` |
| A-04 Editar usuario y asignar rol | `PUT /usuarios/{usuario_id}` |
| A-05 Desactivar usuario | `PATCH /usuarios/{usuario_id}/desactivar` |
| Q-15 Listar usuarios | `GET /usuarios` |

A-02 Cerrar sesión no tiene endpoint en el servicio: el token no tiene estado y el cliente lo descarta (H-11). `api-bff` responde el éxito.

#### `ms-incidencias`

| Operación | Endpoint interno sugerido |
|-----------|---------------------------|
| A-06 Reportar incidencia | `POST /incidencias` (multipart) |
| A-07 Asignar incidencia a un técnico | `PUT /incidencias/{incidencia_id}/asignacion` |
| A-08 Poner una incidencia en proceso | `PATCH /incidencias/{incidencia_id}/estado` |
| A-09 Cerrar incidencia con evidencia | `POST /incidencias/{incidencia_id}/cierre` (multipart) |
| Q-01 Consultar mis incidencias | `GET /incidencias?reportado_por={usuario_id}` |
| Q-02 Consultar detalle de una incidencia | `GET /incidencias/{incidencia_id}` + costo desde `ms-finanzas` *(compuesta)* |
| Q-03 Listar incidencias con filtros | `GET /incidencias` |
| Q-04 Consultar incidencias asignadas a mí | `GET /incidencias?tecnico_id={usuario_id}` |
| Q-05 Consultar historial de reparaciones | `GET /incidencias/historial` + costo desde `ms-finanzas` *(compuesta)* |
| Q-11 Consultar estadísticas de incidencias | `GET /estadisticas/incidencias` |
| Q-12 Comparar frecuencia de daños entre zonas | `GET /estadisticas/zonas` |

#### `ms-proveedores`

| Operación | Endpoint interno sugerido |
|-----------|---------------------------|
| A-10 Registrar proveedor | `POST /proveedores` |
| A-11 Editar o desactivar proveedor | `PUT /proveedores/{proveedor_id}` |
| A-12 Cargar documento de seguridad social | `POST /proveedores/{proveedor_id}/documentos` |
| A-13 Generar orden de servicio | `POST /ordenes-servicio` |
| A-14 Calificar proveedor | `POST /proveedores/{proveedor_id}/calificaciones` |
| Q-06 Listar proveedores | `GET /proveedores` |
| Q-07 Consultar ficha de un proveedor | `GET /proveedores/{proveedor_id}` |
| Q-08 Consultar vigencia de documentos | `GET /proveedores/{proveedor_id}/documentos/vigencia` |
| Q-09 Consultar órdenes de servicio | `GET /ordenes-servicio` |

#### `ms-finanzas`

| Operación | Endpoint interno sugerido |
|-----------|---------------------------|
| A-16 Registrar gasto de una reparación | `POST /gastos` |
| A-17 Definir presupuesto anual | `PUT /presupuestos/{anio}` |
| Q-13 Comparar gastos con el presupuesto anual | `GET /presupuestos/{anio}/ejecucion` |
| Q-14 Consultar gastos de mantenimiento | `GET /gastos` |

#### `ms-comunicaciones`

| Operación | Endpoint interno sugerido |
|-----------|---------------------------|
| A-15 Publicar aviso | `POST /avisos` (crea el aviso); el envío masivo lo pide `api-bff` con el endpoint de abajo |
| Q-10 Consultar avisos | `GET /avisos` |
| C-18, C-19, C-20 (comandos internos de las políticas) | `POST /notificaciones` |

#### Ajustes sugeridos a Queries y Actions

Al repartir las operaciones entre servicios aparecen cinco ajustes menores sobre `queries-actions.md`:

1. **Q-14** debe aceptar `incidencia_ids[]` (lote) y devolver el total por incidencia, para componer Q-05 sin llamar a Finanzas una vez por cada reparación.
2. **A-06, A-07 y A-15:** aclarar que la notificación la dispara `api-bff` después de confirmar la acción y que **no bloquea** la respuesta (H-08).
3. **Q-01, Q-02, Q-03 y Q-05:** los nombres (`reportado_por`, `tecnico_asignado`) se guardan como copia en Incidencias para no consultar Usuarios en cada lectura (ver «Modelado de datos»).
4. **A-17 y Q-13:** requieren un modelo `Presupuesto`, que no está en la lista de modelos de RT-04.
5. **A-02:** el éxito no depende de ningún servicio (H-11).

### 4. Integración entre servicios

| Tipo | Uso en este diseño |
|------|--------------------|
| **Síncrona** (REST) | Solo `api-bff` → microservicios. Ningún microservicio llama a otro. |
| **Asíncrona** (eventos) | No se usa en la primera fase. Las notificaciones se piden desde `api-bff` sin esperar el resultado. Si se necesita entrega garantizada, se agrega un *broker* (decisión futura, ver [ADR-0005](../adr/0005-api-bff-orquesta-los-microservicios.md)). |

### 5. Lo que no es un microservicio (todavía)

Se descartan por ser demasiado granulares para esta etapa: **Notificaciones** (parte de Comunicaciones), **Historial de reparaciones** (proyección de Incidencias), **Dashboard** (composición en `api-bff`), **Calificaciones** y **Documentos** (parte de Proveedores) y **Auth** como servicio aparte de Usuarios. Dividir más adelante es más fácil que fusionar o mover capacidades.

### 6. Posibles divisiones futuras

| Servicio | Disparador para dividir | Resultado |
|----------|-------------------------|-----------|
| `ms-incidencias` | Las estadísticas cambian a otro ritmo que el ciclo de vida de la incidencia, o necesitan una réplica de lectura (H-10) | `ms-analitica` |
| `ms-proveedores` | Las órdenes de servicio crecen o requieren su propio equipo | `ms-ordenes` |
| `ms-comunicaciones` | Se agregan canales (WhatsApp, notificaciones push) o entrega garantizada | `ms-notificaciones` con *broker* |
| `ms-usuarios` | Se adopta un proveedor de identidad externo | Se reemplaza por el servicio gestionado |

**Resultado:** 5 microservicios más `api-bff`, con propiedad clara de cada Query y Action y una dirección de crecimiento definida.

---

## Modelado de datos

Los agregados revelan los datos que cada microservicio debe poseer. Reglas de este diseño:

1. **Cada servicio es dueño de sus datos** y los demás solo acceden a ellos a través de su API.
2. **Sin relaciones entre bases de datos**: las referencias entre servicios son solo identificadores (`usuario_id`, `incidencia_id`, `proveedor_id`), sin `populate` ni claves foráneas.
3. **Lo que se consulta junto, vive junto**: los documentos y las calificaciones van como *subdocumentos anidados* dentro del proveedor (técnica de MongoDB; no es lo mismo que la propiedad de los datos por servicio, regla 1), y el historial de estados dentro de la incidencia.
4. **Los registros históricos no se borran** (RNF-17): se desactivan, se marcan como no vigentes o se versionan.
5. **Infraestructura:** un único clúster de MongoDB Atlas con **una base de datos lógica por servicio** y un usuario de base de datos por servicio con permisos solo sobre la suya (RT-20, RT-23). Ver [ADR-0006](../adr/0006-una-base-de-datos-logica-por-microservicio.md).

### Campos transversales (todas las colecciones)

| Campo | Descripción |
|-------|-------------|
| `_id` | Identificador de MongoDB (`ObjectId`) |
| `copropiedad_id` | Copropiedad a la que pertenece el dato. Aplica solo si se aprueba el hotspot **H-07** (RNF-18); se toma del token, no lo envía el cliente |
| `fecha_creacion`, `fecha_actualizacion` | Marcas de tiempo (`timestamps` de Mongoose) |

### `ms-usuarios` → `usuarios_db`

**`usuarios`**

| Campo | Tipo | Notas |
|-------|------|-------|
| `nombre` | String | |
| `correo` | String | Único |
| `contrasena_hash` | String | `bcrypt`; nunca se devuelve (RNF-03) |
| `rol` | String | `Residente`, `Técnico` o `Administrador` |
| `activo` | Boolean | Desactivar no borra el registro (RNF-17) |

Índices: único en `correo`; `{ rol, activo }`.

### `ms-incidencias` → `incidencias_db`

**`incidencias`**

| Campo | Tipo | Notas |
|-------|------|-------|
| `titulo`, `descripcion` | String | |
| `tipo` | String | `eléctrica`, `plomería`, `ascensor`, `otra` |
| `ubicacion` | String | Base de las estadísticas por zona (Q-11, Q-12) |
| `prioridad` | String | `Alta`, `Media`, `Baja` |
| `estado` | String | `Pendiente`, `En proceso`, `Solucionado` |
| `reportado_por` | String | `usuario_id` de quien reporta (referencia) |
| `reportado_por_nombre` | String | Copia del nombre al momento del reporte |
| `tecnico_id` | String | `usuario_id` del técnico asignado (referencia, opcional) |
| `tecnico_nombre` | String | Copia del nombre al momento de asignar |
| `fecha_reporte`, `fecha_asignacion`, `fecha_solucion` | Date | |
| `fotos_reporte` | Array de `{ url, public_id }` | Subidas al servicio externo de imágenes (RT-15) |
| `foto_antes`, `foto_despues` | `{ url, public_id }` | Obligatorias para pasar a Solucionado (RF-10) |
| `resumen_reparacion` | String | Lo escribe el técnico al cerrar |
| `historial_estados` | Array de `{ estado, fecha, usuario_id, comentario }` | Registro de cada cambio (HU-05) |

Índices (RNF-02, listados con hasta 1.000 registros en menos de 2 s): `{ reportado_por, estado }`, `{ tecnico_id, estado }`, `{ estado, tipo, prioridad, ubicacion }`, `{ fecha_reporte: -1 }`.

**Copia de nombres:** las respuestas de Q-01 a Q-05 incluyen nombres de personas. Guardarlos como copia evita consultar a `ms-usuarios` en cada lectura y conserva el nombre que tenía la persona cuando ocurrió el hecho, que es lo esperado en un registro histórico. El costo: si alguien cambia de nombre, las incidencias anteriores conservan el nombre antiguo.

**No se guarda `costo_total`:** es la suma de los gastos y vive en `ms-finanzas` (H-04). `api-bff` lo agrega al componer Q-02 y Q-05.

### `ms-proveedores` → `proveedores_db`

**`proveedores`**

| Campo | Tipo | Notas |
|-------|------|-------|
| `nombre`, `especialidad`, `telefono`, `correo` | String | |
| `activo` | Boolean | |
| `usuario_id` | String | Opcional: cuenta de Técnico asociada al contratista (H-01) |
| `documentos` | Array de `{ documento_id, tipo, archivo_url, fecha_vencimiento, vigente }` | `tipo` es `ARL` o `EPS`; solo uno `vigente: true` por tipo; los anteriores quedan como histórico |
| `calificaciones` | Array de `{ calificacion_id, orden_servicio_id, calidad_trabajo, cumplimiento_tiempos, respeto_presupuesto, comentario, fecha, calificado_por }` | Puntajes de 1 a 5 |
| `calificacion_promedio` | Number | Se recalcula al calificar |

**`ordenes_servicio`**

| Campo | Tipo | Notas |
|-------|------|-------|
| `proveedor_id` | ObjectId | Referencia dentro del mismo servicio |
| `incidencia_id` | String | Referencia a otro servicio; opcional (H-02) |
| `tareas` | Array de String | Al menos una |
| `fecha_emision`, `fecha_programada` | Date | |
| `emitida_por` | String | `usuario_id` del administrador |

Índices: `{ activo, especialidad }` en `proveedores`; `{ proveedor_id, fecha_emision: -1 }` e `{ incidencia_id }` en `ordenes_servicio`.

### `ms-finanzas` → `finanzas_db`

**`gastos`**

| Campo | Tipo | Notas |
|-------|------|-------|
| `incidencia_id` | String | Referencia a otro servicio |
| `concepto` | String | `repuestos` o `mano_de_obra` |
| `descripcion` | String | |
| `monto` | Number | Mayor que cero |
| `fecha` | Date | |
| `anio` | Number | Derivado de `fecha`; acelera Q-13 |
| `proveedor_id` | String | Referencia opcional |
| `registrado_por` | String | `usuario_id` |

**`presupuestos`**

| Campo | Tipo | Notas |
|-------|------|-------|
| `anio` | Number | |
| `monto_total` | Number | |
| `vigente` | Boolean | Un solo presupuesto vigente por año; al redefinirlo, el anterior pasa a `false` (RNF-17) |
| `definido_por` | String | `usuario_id` |

Índices: `{ incidencia_id }`, `{ anio, concepto }` en `gastos`; `{ anio, vigente }` en `presupuestos`.

### `ms-comunicaciones` → `comunicaciones_db`

**`avisos`**

| Campo | Tipo | Notas |
|-------|------|-------|
| `titulo`, `contenido` | String | |
| `fecha_publicacion`, `fecha_inicio`, `fecha_fin` | Date | Un aviso es vigente si la fecha actual está entre `fecha_inicio` y `fecha_fin` |
| `publicado_por`, `publicado_por_nombre` | String | `usuario_id` y copia del nombre |

**`notificaciones`** *(registro de envíos; responde al hotspot H-08)*

| Campo | Tipo | Notas |
|-------|------|-------|
| `tipo` | String | `nueva_incidencia`, `incidencia_asignada` o `aviso` |
| `referencia_id` | String | Incidencia o aviso que originó el correo |
| `total_destinatarios` | Number | |
| `estado` | String | `enviada` o `fallida` |
| `error` | String | Detalle si falló |
| `fecha_envio` | Date | |

No se guardan correos de usuarios: `api-bff` los obtiene de `ms-usuarios` y los entrega en cada envío (los destinatarios no se almacenan).

### Datos compuestos (no se almacenan)

| Dato | Se calcula en | Con datos de |
|------|---------------|--------------|
| `costo_total` de una incidencia (Q-02, Q-05) | `api-bff` | `ms-incidencias` + suma de gastos de `ms-finanzas` |
| Dashboard (Q-11, Q-12, Q-13) | `api-bff` | `ms-incidencias` + `ms-finanzas` |
| `tecnico_asignado` activo al asignar (A-07) | `api-bff` | Validación en `ms-usuarios` antes de escribir en `ms-incidencias` |

### Modelos por servicio

| Modelo (RT-04) | Microservicio |
|-----------------------|---------|
| `Usuario` | `ms-usuarios` |
| `Incidencia` | `ms-incidencias` |
| `Proveedor`, `OrdenServicio` | `ms-proveedores` |
| `Gasto` | `ms-finanzas` |
| `Aviso` | `ms-comunicaciones` |
| `Presupuesto` | `ms-finanzas` |
| `Notificacion` | `ms-comunicaciones` |

---

## Patrones de interacción

Patrones que aparecen en los flujos que cruzan servicios. Los diagramas de secuencia completos (PlantUML) están en `docs/diagramas/`; aquí el foco es **quién habla con quién**.

Participantes comunes: `api-bff` es la capa API que orquesta; `ms-*` son los microservicios. Se aplica la regla: **los microservicios no se llaman entre sí**.

### Patrones que se descubren

| Patrón | Dónde aparece | Descripción |
|--------|---------------|-------------|
| **Orquestación en la capa API** | Todos | `api-bff` coordina los pasos; ningún microservicio conoce a otro |
| **Validar y luego escribir** | DS-03, DS-11 | `api-bff` confirma que la referencia existe (técnico, incidencia) antes de escribir. No hay transacciones distribuidas |
| **Notificación sin bloqueo** | DS-02, DS-03, DS-09 | La acción principal responde primero; el correo se pide después y su fallo no la revierte (H-08) |
| **Composición paralela de lecturas** | DS-12 | `api-bff` consulta varios servicios a la vez y arma una sola respuesta |
| **Regla local de consistencia** | DS-07 | RF-14 se resuelve dentro de `ms-proveedores`, que es dueño de proveedores y órdenes |
| **Delegado de datos** (*Data Delegate*) | Todos | Cada dato tiene un solo servicio dueño y los demás lo piden por su API (ver «Patrones de datos») |
| **Datos embebidos** (cada servicio posee sus datos) | Modelo de datos | Cada microservicio es dueño exclusivo de sus datos; nadie más los lee ni los modifica (ver «Patrones de datos») |

**Limitación a tener en cuenta:** al no haber transacciones entre servicios, si un paso posterior falla no se deshacen los anteriores. En estos flujos el orden se eligió para que eso sea aceptable: se valida antes de escribir y lo único que se hace después de escribir es notificar.

### Patrones de datos

Para cada patrón se indica si el diseño ya lo aplica, si no hace falta o si queda como propuesta que el equipo debe decidir.

| Patrón | Qué es | Estado en nuestro diseño |
|--------|--------|--------------------------|
| **Datos embebidos** (cada microservicio posee sus datos) | Cada microservicio *posee* sus datos: nunca dos servicios leen y modifican el mismo espacio de datos. Pueden compartir la instalación física del clúster mientras no compartan tablas ni colecciones | **Aplicado.** Una base lógica por servicio dentro de un mismo clúster de MongoDB Atlas (ADR-0006) |
| **Delegado de datos** (*Data Delegate*) | Cuando varios servicios necesitan los mismos datos, un solo servicio es el dueño y los demás se los piden por su API en vez de leer su tabla | **Aplicado.** `ms-usuarios` es el delegado de los datos de usuario; `ms-incidencias`, `ms-proveedores` y `ms-finanzas` solo guardan `usuario_id` (y una copia del nombre) y piden el resto por API. Igual con `ms-proveedores` para los datos de proveedor |
| **Lago de datos** (*Data Lake*) | Copia de solo lectura de los datos de varios servicios en un espacio compartido, para análisis y auditoría. Se copia, no se mueve, y nunca es la base oficial | **No aplicado; propuesta.** Hoy el dashboard (DS-12) consulta Incidencias y Finanzas en vivo desde `api-bff`. Si las estadísticas crecen, podría alimentarse una copia de solo lectura (ver hotspot H-10). Con el volumen de un conjunto residencial no es necesario en la primera fase |
| **Saga** | Coordinar una operación que toca varios servicios con acciones de compensación si falla a medias | **No necesaria hoy.** Validamos antes de escribir y lo único posterior es notificar. Aparecería si se automatizaran pagos a proveedores que involucren varios servicios |
| **CQRS** | Separar lecturas (Queries) de escrituras (Actions) para tratarlas distinto | **Parcial.** Ya están separadas en `queries-actions.md`. Pendiente decidir si el dashboard es una lectura aparte (H-10) |
| **Historial de eventos** (*Event Sourcing* simplificado) | Guardar la historia de cambios en vez de solo el estado actual | **Parcial.** `historial_estados` dentro de cada incidencia, en una colección normal, sin llegar al Event Sourcing estricto |

---

### Flujos entre servicios

| Diagrama | Flujo | Servicios que intervienen |
|----------|-------|---------------------------|
| DS-02 | Registrar incidencia | `api-bff`, `ms-incidencias`, `ms-comunicaciones` |
| DS-03 | Asignar incidencia a un técnico | `api-bff`, `ms-usuarios`, `ms-incidencias`, `ms-comunicaciones` |
| DS-07 | Generar orden de servicio | `api-bff`, `ms-incidencias` (opcional), `ms-proveedores` |
| DS-09 | Publicar avisos | `api-bff`, `ms-comunicaciones`, `ms-usuarios` |
| DS-11 | Registrar gastos y presupuesto | `api-bff`, `ms-incidencias`, `ms-finanzas` |
| DS-12 | Consultar dashboard | `api-bff`, `ms-incidencias`, `ms-finanzas` |

**Resultado:** flujos que muestran los patrones de interacción y confirman que `api-bff` basta como único punto de coordinación en la primera fase.

---

## Decisiones que necesita el equipo

Las más importantes de los 11 hotspots (detalle en la Fase 2):

1. **H-01:** ¿el Técnico es un usuario del sistema, un proveedor externo o ambos?
2. **H-07:** ¿el sistema atiende varias copropiedades (RNF-18)? Si sí, `copropiedad_id` debe estar en todos los datos desde el inicio.
3. **H-04:** ¿quién registra el costo de una reparación: el técnico al cerrar o el administrador con los gastos?
4. **H-10:** ¿el dashboard se compone en tiempo real o se prepara una réplica de lectura?
5. **H-09:** ¿se puede reabrir una incidencia solucionada?
6. Confirmar en un ADR el stack de cada microservicio (lenguaje y base de datos).
