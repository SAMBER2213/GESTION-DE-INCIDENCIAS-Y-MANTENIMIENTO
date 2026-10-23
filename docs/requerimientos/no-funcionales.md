# Requerimientos no funcionales

Describen **cómo** debe comportarse el sistema, no qué funciones ofrece.

| ID | Categoría | Requerimiento |
|----|-----------|---------------|
| RNF-01 | Rendimiento | Las páginas deben cargar en menos de 3 segundos en condiciones normales de conexión. |
| RNF-02 | Rendimiento | Las consultas al listado de incidencias deben responder en menos de 2 segundos con hasta 1.000 registros. |
| RNF-03 | Seguridad | Las contraseñas se almacenan cifradas (hash con bcrypt), nunca en texto plano. |
| RNF-04 | Seguridad | La autenticación se realiza con tokens (JWT) y las rutas protegidas exigen un token válido. |
| RNF-05 | Seguridad | El acceso a cada función se controla según el rol del usuario (Residente, Técnico, Administrador). |
| RNF-06 | Seguridad | Las credenciales y cadenas de conexión se guardan en variables de entorno y nunca se suben al repositorio. |
| RNF-07 | Seguridad | Toda la comunicación entre el usuario y el sistema se realiza por HTTPS. |
| RNF-08 | Seguridad | Los datos recibidos en formularios se validan en el servidor para evitar datos inválidos o maliciosos. |
| RNF-09 | Usabilidad | La interfaz debe ser clara y usable por personas sin conocimientos técnicos. |
| RNF-10 | Usabilidad | La página debe ser responsiva y verse correctamente en celulares, tabletas y computadores. |
| RNF-11 | Usabilidad | Reportar una incidencia no debe tomar más de 5 pasos. |
| RNF-12 | Disponibilidad | El sistema estará desplegado en Render y accesible desde internet. |
| RNF-13 | Disponibilidad | Se tolera el tiempo de arranque del plan gratuito de Render tras un periodo de inactividad. |
| RNF-14 | Mantenibilidad | El código se organiza por capas (modelos, controladores, rutas) y con nombres en español. |
| RNF-15 | Mantenibilidad | La documentación (requerimientos, ADRs, diagramas) se mantiene actualizada en la carpeta `docs/` del repositorio. |
| RNF-16 | Portabilidad | El sistema debe funcionar en los navegadores actuales (Chrome, Edge, Firefox). |
| RNF-17 | Integridad | Los registros históricos (incidencias cerradas, gastos, calificaciones) no se eliminan, solo se archivan o desactivan. |
| RNF-18 | Escalabilidad | El sistema debe permitir agregar nuevos edificios o conjuntos sin cambios en el código. |
