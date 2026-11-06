@startuml
skinparam maxMessageSize 150

actor "Residente" as Residente
participant "Frontend\n(HTML/JS)" as FE
participant "API REST\n(Node.js/Express)" as API
participant "Cloudinary\n(Almacenamiento)" as Cloud
database "MongoDB Atlas\n(Mongoose)" as DB
participant "Nodemailer\n(Servicio Correo)" as Mail

== Autenticación y Envío ==

Residente -> FE: Llena formulario (título, desc, tipo, prioridad) y adjunta fotos (RF-01, RF-02)
activate FE

FE -> API: POST /api/incidencias\nHeaders: Bearer JWT\nBody: FormData
activate API

== Capa de Seguridad y Middleware ==

alt Validación de Acceso y Datos
    API -> API: Verifica firma del token JWT (RNF-04)
    API -> API: Verifica rol de usuario == 'Residente' (RNF-05)
    API -> API: Valida datos del formulario (RNF-08)
else Token Inválido o Faltan Datos
    API --> FE: 400 Bad Request / 401 Unauthorized
    FE --> Residente: Muestra mensaje de error
end

== Procesamiento de Archivos ==

API -> API: Procesa fotos en memoria con multer (RT-14)
API -> Cloud: Sube fotos de la incidencia (RT-15)
activate Cloud
Cloud --> API: Retorna URLs seguras de las imágenes
deactivate Cloud

== Persistencia de Datos ==

API -> DB: Guarda documento de Incidencia con las URLs (RT-04)
activate DB
DB --> API: Confirmación de registro exitoso
deactivate DB

== Eventos Asíncronos y Respuesta ==

API -> Mail: Dispara notificación de nueva incidencia al Administrador (RF-03, RT-16)
activate Mail
Mail --> API: (Proceso en segundo plano)
deactivate Mail

API --> FE: 201 Created (Registro exitoso)
deactivate API

FE --> Residente: Muestra mensaje de éxito y limpia formulario
deactivate FE

@enduml
