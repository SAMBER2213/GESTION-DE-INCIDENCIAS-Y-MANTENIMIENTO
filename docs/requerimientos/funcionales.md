Requerimientos funcionales

Sistema web para la gestión de incidencias y mantenimiento de edificios, apartamentos y conjuntos residenciales.

Roles del sistema: Residente, Técnico, Administrador.

Prioridad: Alta / Media / Baja.

Épica 1: Gestión de incidencias (correctivo)

Canal digital para reportar y solucionar los problemas del día a día.

ID	Requerimiento	Rol	Prioridad
RF-01	El residente puede registrar una incidencia indicando título, descripción, tipo (eléctrica, plomería, ascensor, otra), ubicación y prioridad.	Residente	Alta
RF-02	El residente puede adjuntar una o varias fotos a la incidencia desde su celular o computador.	Residente	Alta
RF-03	El sistema notifica al administrador cuando se crea una nueva incidencia.	Sistema	Alta
RF-04	El administrador puede asignar una incidencia a un técnico encargado.	Administrador	Alta
RF-05	El sistema notifica al técnico cuando se le asigna una incidencia.	Sistema	Alta
RF-06	El residente puede consultar el estado de sus incidencias (Pendiente, En proceso, Solucionado).	Residente	Alta
RF-07	El técnico puede cambiar el estado de las incidencias que tiene asignadas.	Técnico	Alta
RF-08	El administrador puede ver el listado de todas las incidencias y filtrarlas por estado, tipo, prioridad y ubicación.	Administrador	Media
RF-09	El sistema guarda el historial de reparaciones: qué se dañó, cuándo se arregló, quién lo hizo y cuánto costó.	Sistema	Media
RF-10	El técnico debe subir una foto del "antes" y del "después" para cerrar una incidencia.	Técnico	Media
Épica 2: Gestión de proveedores y contratistas

Control de las personas externas que realizan trabajos en la copropiedad.

ID	Requerimiento	Rol	Prioridad
RF-11	El administrador puede registrar, editar y consultar proveedores y contratistas (nombre, especialidad, teléfono, correo).	Administrador	Alta
RF-12	El administrador puede generar órdenes de servicio con las tareas exactas que debe realizar el técnico contratado.	Administrador	Alta
RF-13	El administrador puede almacenar los documentos de seguridad social (ARL/EPS) de cada técnico antes de que ingrese a trabajar.	Administrador	Media
RF-14	El sistema impide generar una orden de servicio para un técnico sin documentos de seguridad social vigentes.	Sistema	Baja
RF-15	El administrador puede calificar a un proveedor según calidad del trabajo, cumplimiento de tiempos y respeto del presupuesto.	Administrador	Media
RF-16	El administrador puede consultar el historial de órdenes de servicio y calificaciones de cada proveedor.	Administrador	Baja
Épica 3: Comunicación y transparencia

Mantiene informada a la comunidad y a la administración.

ID	Requerimiento	Rol	Prioridad
RF-17	El administrador puede crear y publicar avisos para la comunidad (por ejemplo, cortes programados de agua o mantenimiento de tanques).	Administrador	Alta
RF-18	El sistema envía una notificación masiva por correo a todos los residentes cuando se publica un aviso.	Sistema	Media
RF-19	El residente puede consultar los avisos vigentes y anteriores desde la plataforma.	Residente	Media
RF-20	El sistema conserva la evidencia digital (fotos antes y después) asociada a cada incidencia cerrada, visible para el administrador y el residente que la reportó.	Sistema	Media
Épica 4: Análisis de datos y presupuestos (dashboard)

Apoyo a la toma de decisiones del administrador y del consejo de administración.

ID	Requerimiento	Rol	Prioridad
RF-21	El administrador puede registrar los gastos de cada reparación (repuestos y mano de obra).	Administrador	Alta
RF-22	El administrador puede definir un presupuesto anual de mantenimiento.	Administrador	Media
RF-23	El dashboard muestra estadísticas de incidencias: cantidad por tipo, por ubicación y por estado.	Administrador	Alta
RF-24	El dashboard permite comparar la frecuencia de daños entre zonas (por ejemplo, ascensor de la Torre A vs. Torre B).	Administrador	Media
RF-25	El dashboard compara los gastos acumulados con el presupuesto anual definido.	Administrador	Media
Épica transversal: Usuarios y acceso
ID	Requerimiento	Rol	Prioridad
RF-26	Los usuarios pueden iniciar y cerrar sesión con correo y contraseña.	Todos	Alta
RF-27	El administrador puede crear, editar y desactivar usuarios, y asignarles un rol.	Administrador	Alta
RF-28	El sistema restringe las funciones según el rol del usuario (un residente no puede ver el dashboard, por ejemplo).	Sistema	Alta
