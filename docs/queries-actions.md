# Queries y Actions

Contratos de las operaciones del sistema, derivados de los requerimientos funcionales (`docs/requerimientos/funcionales.md`). Siguen el principio **CQS (Command Query Separation)** y el formato estándar del proceso SEED(S): las lecturas se documentan como **Queries** y las operaciones que modifican el estado como **Actions**.

## 1. Formato estándar

**1.1. Query** (lectura, sin efectos secundarios):

```
Descripción expresiva de la query
Input: lista de variables de entrada
Response: lista de elementos de datos de salida
```

**1.2. Action** (modifica el estado del sistema):

```
Descripción expresiva de la action
Input: lista de variables de entrada
Expected outcome: descripción del side effect inducido
Response (opcional): lista de elementos de datos en la respuesta
```

## 2. Convenciones

- Los nombres de variables van en español y en `snake_case` (RNF-14).
- Toda operación, excepto `Iniciar sesión`, exige un token JWT válido (RNF-04). El usuario que ejecuta la operación se toma del token, por eso **no** aparece como input.
- Cada operación indica el **Rol** autorizado (RNF-05, RF-28). Si el rol no corresponde, la respuesta es un error de permisos.
- Valores permitidos:
  - `estado` de incidencia: `Pendiente`, `En proceso`, `Solucionado`.
  - `tipo` de incidencia: `eléctrica`, `plomería`, `ascensor`, `otra`.
  - `prioridad`: `Alta`, `Media`, `Baja`.
- Los listados aceptan `pagina` y `limite` como inputs opcionales.
- Los datos recibidos se validan en el servidor (RNF-08). Cuando una Action falla, su respuesta es un error detallado y no se produce ningún cambio de estado.
- Los registros históricos no se eliminan, solo se desactivan o archivan (RNF-17).
- Las Actions que notifican (RF-03, RF-05, RF-18) lo hacen por correo con `nodemailer` (RT-16).

---

## 3. Queries

### Q-01 · Consultar mis incidencias
Lista las incidencias reportadas por el residente autenticado, con su estado actual.

**Rol:** Residente · **Ref.:** RF-06

- **Input**: estado (opcional), pagina (opcional), limite (opcional)
- **Response**: lista de incidencias con incidencia_id, titulo, tipo, ubicacion, prioridad, estado, fecha_reporte, tecnico_asignado (nombre, vacío si aún no tiene)

### Q-02 · Consultar detalle de una incidencia
Muestra toda la información de una incidencia: reporte, evidencia fotográfica y datos de la reparación. El residente solo accede a las que reportó, el técnico solo a las que tiene asignadas y el administrador a todas.

**Rol:** Residente, Técnico, Administrador · **Ref.:** RF-06, RF-20

- **Input**: incidencia_id
- **Response**: incidencia_id, titulo, descripcion, tipo, ubicacion, prioridad, estado, fecha_reporte, reportado_por, tecnico_asignado, fotos_reporte[], foto_antes, foto_despues, fecha_solucion, resumen_reparacion, costo_total

### Q-03 · Listar incidencias con filtros
Devuelve el listado de todas las incidencias de la copropiedad, filtrable por estado, tipo, prioridad y ubicación.

**Rol:** Administrador · **Ref.:** RF-08

- **Input**: estado (opcional), tipo (opcional), prioridad (opcional), ubicacion (opcional), pagina (opcional), limite (opcional)
- **Response**: lista de incidencias con incidencia_id, titulo, tipo, ubicacion, prioridad, estado, fecha_reporte, reportado_por, tecnico_asignado; total_resultados

### Q-04 · Consultar incidencias asignadas a mí
Lista las incidencias que el técnico autenticado tiene asignadas para atender.

**Rol:** Técnico · **Ref.:** RF-07

- **Input**: estado (opcional), pagina (opcional), limite (opcional)
- **Response**: lista de incidencias con incidencia_id, titulo, descripcion, tipo, ubicacion, prioridad, estado, fecha_asignacion, fotos_reporte[]

### Q-05 · Consultar historial de reparaciones
Muestra qué se dañó, cuándo se arregló, quién lo reparó y cuánto costó, para las incidencias solucionadas.

**Rol:** Administrador · **Ref.:** RF-09

- **Input**: fecha_desde (opcional), fecha_hasta (opcional), tipo (opcional), ubicacion (opcional), responsable_id (opcional), pagina (opcional), limite (opcional)
- **Response**: lista de reparaciones con incidencia_id, titulo, tipo, ubicacion, fecha_reporte, fecha_solucion, responsable, resumen_reparacion, costo_total

### Q-06 · Listar proveedores
Lista los proveedores y contratistas registrados.

**Rol:** Administrador · **Ref.:** RF-11

- **Input**: especialidad (opcional), activo (opcional), pagina (opcional), limite (opcional)
- **Response**: lista de proveedores con proveedor_id, nombre, especialidad, telefono, correo, activo, calificacion_promedio

### Q-07 · Consultar ficha de un proveedor
Muestra los datos de un proveedor junto con su historial de órdenes de servicio y calificaciones.

**Rol:** Administrador · **Ref.:** RF-11, RF-16

- **Input**: proveedor_id
- **Response**: proveedor_id, nombre, especialidad, telefono, correo, activo, calificacion_promedio, ordenes_servicio[] (orden_servicio_id, incidencia_id, fecha_emision, tareas[]), calificaciones[] (calidad_trabajo, cumplimiento_tiempos, respeto_presupuesto, comentario, fecha)

### Q-08 · Consultar vigencia de documentos de seguridad social
Indica si un proveedor tiene sus documentos de ARL y EPS vigentes, es decir, si puede ingresar a trabajar.

**Rol:** Administrador · **Ref.:** RF-13

- **Input**: proveedor_id
- **Response**: documentos[] (documento_id, tipo_documento, fecha_vencimiento, vigente), apto_para_orden (verdadero si ARL y EPS están vigentes)

### Q-09 · Consultar órdenes de servicio
Lista las órdenes de servicio generadas, con las tareas que debe realizar cada proveedor.

**Rol:** Administrador · **Ref.:** RF-12, RF-16

- **Input**: proveedor_id (opcional), incidencia_id (opcional), fecha_desde (opcional), fecha_hasta (opcional), pagina (opcional), limite (opcional)
- **Response**: lista de órdenes con orden_servicio_id, proveedor, incidencia_id, tareas[], fecha_emision, fecha_programada

### Q-10 · Consultar avisos
Devuelve los avisos publicados para la comunidad, tanto los vigentes como los anteriores.

**Rol:** Residente, Técnico, Administrador · **Ref.:** RF-19

- **Input**: vigencia (`vigentes`, `anteriores` o `todos`; por defecto `vigentes`), pagina (opcional), limite (opcional)
- **Response**: lista de avisos con aviso_id, titulo, contenido, fecha_publicacion, fecha_inicio, fecha_fin, publicado_por

### Q-11 · Consultar estadísticas de incidencias
Cuenta las incidencias agrupadas por tipo, ubicación o estado para un periodo.

**Rol:** Administrador · **Ref.:** RF-23

- **Input**: agrupar_por (`tipo`, `ubicacion` o `estado`), fecha_desde (opcional), fecha_hasta (opcional)
- **Response**: lista de grupos con categoria, cantidad; total_incidencias

### Q-12 · Comparar frecuencia de daños entre zonas
Compara cuántas incidencias se han presentado en distintas zonas, por ejemplo el ascensor de la Torre A frente al de la Torre B.

**Rol:** Administrador · **Ref.:** RF-24

- **Input**: ubicaciones[] (dos o más), tipo (opcional), fecha_desde (opcional), fecha_hasta (opcional)
- **Response**: lista por zona con ubicacion, cantidad_incidencias, porcentaje_del_total

### Q-13 · Comparar gastos con el presupuesto anual
Compara el gasto acumulado de mantenimiento con el presupuesto anual definido.

**Rol:** Administrador · **Ref.:** RF-25

- **Input**: anio (opcional; por defecto el año actual)
- **Response**: anio, presupuesto_anual (vacío si no se ha definido), gasto_acumulado, saldo_disponible, porcentaje_ejecutado, gasto_mensual[] (mes, monto)

### Q-14 · Consultar gastos de mantenimiento
Lista los gastos registrados de las reparaciones, con su concepto y valor.

**Rol:** Administrador · **Ref.:** RF-21

- **Input**: incidencia_id (opcional), proveedor_id (opcional), concepto (opcional), fecha_desde (opcional), fecha_hasta (opcional), pagina (opcional), limite (opcional)
- **Response**: lista de gastos con gasto_id, incidencia_id, concepto, descripcion, monto, fecha, proveedor, registrado_por; total_monto

### Q-15 · Listar usuarios
Lista los usuarios del sistema con su rol y su estado.

**Rol:** Administrador · **Ref.:** RF-27

- **Input**: rol (opcional), activo (opcional), pagina (opcional), limite (opcional)
- **Response**: lista de usuarios con usuario_id, nombre, correo, rol, activo

### 3.1. Resumen de Queries

| ID | Nombre | Rol | Ref. |
|----|--------|-----|------|
| Q-01 | Consultar mis incidencias | Residente | RF-06 |
| Q-02 | Consultar detalle de una incidencia | Residente, Técnico, Administrador | RF-06, RF-20 |
| Q-03 | Listar incidencias con filtros | Administrador | RF-08 |
| Q-04 | Consultar incidencias asignadas a mí | Técnico | RF-07 |
| Q-05 | Consultar historial de reparaciones | Administrador | RF-09 |
| Q-06 | Listar proveedores | Administrador | RF-11 |
| Q-07 | Consultar ficha de un proveedor | Administrador | RF-11, RF-16 |
| Q-08 | Consultar vigencia de documentos de seguridad social | Administrador | RF-13 |
| Q-09 | Consultar órdenes de servicio | Administrador | RF-12, RF-16 |
| Q-10 | Consultar avisos | Residente, Técnico, Administrador | RF-19 |
| Q-11 | Consultar estadísticas de incidencias | Administrador | RF-23 |
| Q-12 | Comparar frecuencia de daños entre zonas | Administrador | RF-24 |
| Q-13 | Comparar gastos con el presupuesto anual | Administrador | RF-25 |
| Q-14 | Consultar gastos de mantenimiento | Administrador | RF-21 |
| Q-15 | Listar usuarios | Administrador | RF-27 |

---

## 4. Actions

### A-01 · Iniciar sesión
Autentica a un usuario con su correo y contraseña.

**Rol:** Todos · **Ref.:** RF-26

- **Input**: correo, contrasena
- **Expected outcome**: se verifica la contraseña contra su hash (bcrypt) y se inicia la sesión con un token JWT. Falla si las credenciales son incorrectas o el usuario está desactivado.
- **Response**: token, usuario (usuario_id, nombre, rol) o error detallado

### A-02 · Cerrar sesión
Termina la sesión del usuario autenticado.

**Rol:** Todos · **Ref.:** RF-26

- **Input**: ninguno (el usuario se identifica con el token)
- **Expected outcome**: la sesión queda cerrada y el token deja de usarse.
- **Response**: código de éxito

### A-03 · Crear usuario
Registra un nuevo usuario y le asigna un rol.

**Rol:** Administrador · **Ref.:** RF-27

- **Input**: nombre, correo, contrasena_inicial, rol
- **Expected outcome**: se crea un usuario activo con su contraseña cifrada (bcrypt). Falla si el correo ya está registrado.
- **Response**: usuario_id o error detallado

### A-04 · Editar usuario y asignar rol
Modifica los datos de un usuario o cambia su rol.

**Rol:** Administrador · **Ref.:** RF-27

- **Input**: usuario_id, nombre (opcional), correo (opcional), rol (opcional)
- **Expected outcome**: los datos quedan actualizados. Si cambia el rol, los nuevos permisos aplican desde la siguiente petición del usuario.
- **Response**: código de éxito o error detallado

### A-05 · Desactivar usuario
Impide que un usuario vuelva a ingresar al sistema sin borrar su información.

**Rol:** Administrador · **Ref.:** RF-27

- **Input**: usuario_id
- **Expected outcome**: el usuario queda inactivo y no puede iniciar sesión. Sus incidencias, gastos y demás registros se conservan (RNF-17).
- **Response**: código de éxito o error detallado

### A-06 · Reportar incidencia
Registra un nuevo daño reportado por un residente, con fotos opcionales.

**Rol:** Residente · **Ref.:** RF-01, RF-02, RF-03

- **Input**: titulo, descripcion, tipo, ubicacion, prioridad, fotos[] (opcional)
- **Expected outcome**: se crea la incidencia en estado `Pendiente`, asociada al residente. Las fotos se almacenan en el servicio externo de imágenes y quedan vinculadas a la incidencia. Se notifica al administrador.
- **Response**: incidencia_id, estado, fecha_reporte o error de validación

### A-07 · Asignar incidencia a un técnico
Asigna una incidencia a un técnico para que la atienda.

**Rol:** Administrador · **Ref.:** RF-04, RF-05

- **Input**: incidencia_id, tecnico_id
- **Expected outcome**: la incidencia queda asignada al técnico y este recibe una notificación. Falla si la incidencia ya está `Solucionado` o si el usuario indicado no es un técnico activo.
- **Response**: código de éxito o error detallado

### A-08 · Poner una incidencia en proceso
El técnico indica que empezó a atender una incidencia que tiene asignada.

**Rol:** Técnico · **Ref.:** RF-07

- **Input**: incidencia_id, comentario (opcional)
- **Expected outcome**: el estado de la incidencia cambia de `Pendiente` a `En proceso` y el residente puede verlo al consultar su reporte. Falla si la incidencia no está asignada al técnico o ya está `Solucionado`.
- **Response**: código de éxito o error detallado

### A-09 · Cerrar incidencia con evidencia
El técnico marca la incidencia como solucionada, subiendo la foto del antes y del después.

**Rol:** Técnico · **Ref.:** RF-09, RF-10, RF-20

- **Input**: incidencia_id, foto_antes, foto_despues, resumen_reparacion
- **Expected outcome**: la incidencia pasa a `Solucionado`, se registra fecha_solucion y las fotos quedan guardadas como evidencia visible para el administrador y el residente que reportó. La reparación se agrega al historial con su responsable. Falla si falta alguna de las dos fotos o la incidencia no está asignada al técnico.
- **Response**: código de éxito o error detallado

### A-10 · Registrar proveedor
Da de alta un proveedor o contratista.

**Rol:** Administrador · **Ref.:** RF-11

- **Input**: nombre, especialidad, telefono, correo
- **Expected outcome**: se crea un proveedor activo, sin documentos de seguridad social ni calificaciones.
- **Response**: proveedor_id o error de validación

### A-11 · Editar o desactivar proveedor
Actualiza los datos de un proveedor o lo deja inactivo.

**Rol:** Administrador · **Ref.:** RF-11

- **Input**: proveedor_id, nombre (opcional), especialidad (opcional), telefono (opcional), correo (opcional), activo (opcional)
- **Expected outcome**: los datos quedan actualizados. Si se desactiva, se conservan sus órdenes de servicio y calificaciones (RNF-17).
- **Response**: código de éxito o error detallado

### A-12 · Cargar documento de seguridad social
Almacena el documento de ARL o EPS de un proveedor antes de que ingrese a trabajar.

**Rol:** Administrador · **Ref.:** RF-13

- **Input**: proveedor_id, tipo_documento (`ARL` o `EPS`), archivo, fecha_vencimiento
- **Expected outcome**: el documento queda asociado al proveedor. Si ya existía uno del mismo tipo, el nuevo pasa a ser el vigente y el anterior se conserva como histórico.
- **Response**: documento_id o error detallado

### A-13 · Generar orden de servicio
Crea la orden con las tareas exactas que debe realizar el proveedor contratado.

**Rol:** Administrador · **Ref.:** RF-12, RF-14

- **Input**: proveedor_id, incidencia_id (opcional), tareas[], fecha_programada
- **Expected outcome**: se crea la orden de servicio asociada al proveedor y, si se indica, a la incidencia. Si el proveedor no tiene ARL y EPS vigentes, la orden se rechaza y no se crea.
- **Response**: orden_servicio_id o error detallado (indica qué documento falta o está vencido)

### A-14 · Calificar proveedor
Evalúa el trabajo de un proveedor según calidad, cumplimiento de tiempos y respeto del presupuesto.

**Rol:** Administrador · **Ref.:** RF-15

- **Input**: proveedor_id, orden_servicio_id (opcional), calidad_trabajo (1 a 5), cumplimiento_tiempos (1 a 5), respeto_presupuesto (1 a 5), comentario (opcional)
- **Expected outcome**: la calificación se agrega al historial del proveedor y su calificacion_promedio se recalcula.
- **Response**: calificacion_id, calificacion_promedio o error de validación

### A-15 · Publicar aviso
Publica un aviso para la comunidad, como un corte programado de agua o el mantenimiento de un tanque.

**Rol:** Administrador · **Ref.:** RF-17, RF-18

- **Input**: titulo, contenido, fecha_inicio, fecha_fin
- **Expected outcome**: el aviso queda publicado y visible para los usuarios mientras esté vigente, y después pasa a los avisos anteriores. Se envía un correo masivo a todos los residentes activos.
- **Response**: aviso_id, cantidad_residentes_notificados o error de validación

### A-16 · Registrar gasto de una reparación
Registra un gasto de repuestos o mano de obra asociado a una incidencia.

**Rol:** Administrador · **Ref.:** RF-09, RF-21

- **Input**: incidencia_id, concepto (`repuestos` o `mano_de_obra`), descripcion, monto, fecha, proveedor_id (opcional)
- **Expected outcome**: el gasto queda asociado a la incidencia, se suma a su costo_total en el historial de reparaciones y entra al gasto acumulado del año que se compara con el presupuesto.
- **Response**: gasto_id o error de validación

### A-17 · Definir presupuesto anual
Establece el presupuesto de mantenimiento de un año.

**Rol:** Administrador · **Ref.:** RF-22

- **Input**: anio, monto_total
- **Expected outcome**: queda definido el presupuesto del año. Si ya existía uno, el nuevo pasa a ser el vigente y el anterior se conserva como histórico (RNF-17).
- **Response**: código de éxito o error de validación

### 4.1. Resumen de Actions

| ID | Nombre | Rol | Ref. |
|----|--------|-----|------|
| A-01 | Iniciar sesión | Todos | RF-26 |
| A-02 | Cerrar sesión | Todos | RF-26 |
| A-03 | Crear usuario | Administrador | RF-27 |
| A-04 | Editar usuario y asignar rol | Administrador | RF-27 |
| A-05 | Desactivar usuario | Administrador | RF-27 |
| A-06 | Reportar incidencia | Residente | RF-01, RF-02, RF-03 |
| A-07 | Asignar incidencia a un técnico | Administrador | RF-04, RF-05 |
| A-08 | Poner una incidencia en proceso | Técnico | RF-07 |
| A-09 | Cerrar incidencia con evidencia | Técnico | RF-09, RF-10, RF-20 |
| A-10 | Registrar proveedor | Administrador | RF-11 |
| A-11 | Editar o desactivar proveedor | Administrador | RF-11 |
| A-12 | Cargar documento de seguridad social | Administrador | RF-13 |
| A-13 | Generar orden de servicio | Administrador | RF-12, RF-14 |
| A-14 | Calificar proveedor | Administrador | RF-15 |
| A-15 | Publicar aviso | Administrador | RF-17, RF-18 |
| A-16 | Registrar gasto de una reparación | Administrador | RF-09, RF-21 |
| A-17 | Definir presupuesto anual | Administrador | RF-22 |

---

## 5. Trazabilidad con los requerimientos funcionales

| Requerimiento | Operaciones |
|---------------|-------------|
| RF-01 | A-06 |
| RF-02 | A-06 |
| RF-03 | A-06 |
| RF-04 | A-07 |
| RF-05 | A-07 |
| RF-06 | Q-01, Q-02 |
| RF-07 | Q-04, A-08 |
| RF-08 | Q-03 |
| RF-09 | Q-05, A-09, A-16 |
| RF-10 | A-09 |
| RF-11 | Q-06, Q-07, A-10, A-11 |
| RF-12 | Q-09, A-13 |
| RF-13 | Q-08, A-12 |
| RF-14 | A-13 |
| RF-15 | A-14 |
| RF-16 | Q-07, Q-09 |
| RF-17 | A-15 |
| RF-18 | A-15 |
| RF-19 | Q-10 |
| RF-20 | Q-02, A-09 |
| RF-21 | Q-14, A-16 |
| RF-22 | A-17 |
| RF-23 | Q-11 |
| RF-24 | Q-12 |
| RF-25 | Q-13 |
| RF-26 | A-01, A-02 |
| RF-27 | Q-15, A-03, A-04, A-05 |
| RF-28 | Transversal: cada operación valida el rol autorizado |
