# Descripción del proyecto

## Nombre
**Gestión de Incidencias y Mantenimiento**

## Resumen
Aplicación web que permite gestionar de forma digital las incidencias y el mantenimiento de edificios, apartamentos y conjuntos residenciales. Centraliza en una sola plataforma los reportes de daños de los residentes, el trabajo de técnicos y proveedores, la comunicación con la comunidad y el control de gastos de la administración.

## Contexto y problema
En muchas copropiedades los daños se reportan de forma informal (mensajes de WhatsApp, llamadas, notas en portería, conversaciones con el administrador). Esto genera problemas frecuentes:

- Los reportes se pierden o se olvidan, y el residente no sabe si su solicitud fue atendida.
- No hay un registro claro de qué se dañó, cuándo se arregló, quién lo hizo ni cuánto costó.
- La administración no tiene información ordenada para tomar decisiones, como saber qué zonas o equipos fallan más.
- La contratación de proveedores se maneja sin documentos ni evaluaciones formales.
- La comunidad se entera tarde, o no se entera, de cortes de servicio y trabajos programados.

## Objetivo general
Desarrollar una aplicación web que permita reportar, atender, hacer seguimiento y documentar las incidencias de una copropiedad, mejorando la comunicación entre residentes, técnicos y administración, y aportando información para la toma de decisiones.

## Objetivos específicos
1. Permitir que los residentes reporten incidencias con descripción y fotos, y consulten su estado en cualquier momento.
2. Notificar a la administración y a los técnicos cuando se crea o se asigna una incidencia.
3. Mantener un historial de reparaciones con su responsable, fecha y costo.
4. Controlar a proveedores y contratistas mediante órdenes de servicio, documentos de seguridad social y calificaciones.
5. Informar a la comunidad mediante avisos y notificaciones.
6. Ofrecer a la administración un dashboard con estadísticas de daños y control de gastos frente al presupuesto anual.

## Alcance

### Incluye
- **Gestión de incidencias (correctivo):** reportes con fotos, asignación a técnicos, seguimiento de estado (Pendiente, En proceso, Solucionado) e historial de reparaciones.
- **Proveedores y contratistas:** registro de proveedores, órdenes de servicio digitales, almacenamiento de documentos de ARL/EPS y evaluación del trabajo.
- **Comunicación y transparencia:** avisos de cortes programados, notificaciones masivas y evidencia digital de antes y después para cerrar cada reporte.
- **Análisis de datos y presupuestos:** estadísticas de daños por tipo y por ubicación, y control de gastos frente al presupuesto.
- **Usuarios y acceso:** inicio de sesión y permisos según el rol.

### No incluye (por ahora)
- **Mantenimiento programado (preventivo y predictivo):** calendario de equipos críticos, hojas de vida de maquinaria y alertas de inspección. Este módulo queda previsto para una fase posterior.

## Usuarios del sistema

| Rol | Descripción | Qué puede hacer |
|-----|-------------|-----------------|
| **Residente** | Persona que vive en la copropiedad | Reportar incidencias, consultar su estado, ver avisos |
| **Técnico** | Personal o contratista que repara los daños | Ver las incidencias asignadas, actualizar su estado, subir evidencia |
| **Administrador** | Responsable de la gestión de la copropiedad | Asignar incidencias, gestionar proveedores, publicar avisos, registrar gastos, ver el dashboard |

## Módulos del sistema

1. **Gestión de incidencias:** núcleo del sistema. Es el canal para reportar y resolver los problemas del día a día.
2. **Proveedores y contratistas:** controla a las personas externas que realizan trabajos, con órdenes de servicio, documentos y calificaciones.
3. **Comunicación y transparencia:** mantiene informada a la comunidad con avisos y evidencia de los trabajos realizados.
4. **Análisis de datos y presupuestos:** dashboard con estadísticas y control de gastos para apoyar las decisiones del administrador y del consejo.

## Flujo básico de una incidencia
1. El residente reporta el problema con descripción y foto.
2. El sistema notifica al administrador.
3. El administrador asigna la incidencia a un técnico, quien también es notificado.
4. El técnico atiende el daño y cambia el estado a "En proceso".
5. Al terminar, el técnico sube la foto del "después" y marca la incidencia como "Solucionado".
6. Se registran el costo y los datos de la reparación en el historial.
7. El residente consulta el resultado desde la plataforma.

## Tecnologías

| Parte | Tecnología |
|-------|------------|
| Frontend | HTML, CSS y JavaScript |
| Backend | Node.js y Express |
| Base de datos | MongoDB (MongoDB Atlas) con Mongoose |
| Despliegue | Render |
| Control de versiones | Git y GitHub |
| Documentación | Markdown y PlantUML |

## Beneficios esperados
- **Para los residentes:** transparencia y seguimiento de sus solicitudes.
- **Para los técnicos:** órdenes claras y un registro de su trabajo.
- **Para la administración:** orden, trazabilidad e información para decidir.
- **Para la comunidad:** mejor comunicación y control de los recursos de la copropiedad.

## Organización del repositorio

```
├── README.md
├── docs/        Documentación: descripción, requerimientos, ADRs, diagramas, queries y actions
├── backend/     Servidor y API en Node.js
└── frontend/    Páginas, estilos y scripts del cliente
```

## Equipo
_(Nombres de los integrantes del grupo)_

## Contexto académico
Proyecto universitario desarrollado como parte de la asignatura _(nombre de la materia)_, bajo la guía del profesor _(nombre del docente)_.
