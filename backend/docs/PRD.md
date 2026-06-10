# Product Requirements Document (PRD): Backend de Programación de Citas

## 1. Visión y Objetivo
El objetivo de este proyecto es construir un backend robusto, seguro y escalable para el módulo de reserva de citas médicas de Linki Health. El sistema debe permitir a los pacientes encontrar especialistas, ver disponibilidades reales (evitando overbooking) y agendar citas de forma exitosa y libre de fricción. Además, demostrará un alto nivel técnico de ingeniería mediante implementaciones de concurrencia y buenas prácticas arquitectónicas.

---

## 2. Actores del Sistema (Personas)
1. **Paciente:** Usuario final que busca agendar, visualizar o cancelar citas.
2. **Médico (Profesional):** Actor pasivo en esta fase. Tienen disponibilidades horarias definidas en el sistema.
3. **Sistema (Link Health API):** Valida reglas de negocio, previene solapamientos de citas y gestiona la integridad transaccional de los datos.

---

## 3. Alcance del Proyecto (Scope)

### 3.1 Funcionalidades Core (Requeridas por el desafío)
* **Gestión de Especialidades:** Proveer un catálogo de especialidades médicas (ej. Cardiología, Pediatría).
* **Directorio de Profesionales:** Buscar médicos filtrados por especialidad.
* **Motor de Agenda:** Calcular y retornar únicamente los horarios (slots) disponibles de un médico para un día específico.
* **Reserva de Citas:** Recibir datos del paciente, validar la disponibilidad del slot y confirmar la reserva.

### 3.2 Funcionalidades Añadidas (Nivel Premium)
* **Autenticación Segura:** Sistema de usuarios con JWT (JSON Web Tokens) para que un paciente no tenga que rellenar sus datos en cada cita.
* **Dashboard de Paciente:** Capacidad de consultar citas futuras y pasadas.
* **Cancelación de Citas:** Endpoints para liberar el slot si el usuario cancela.
* **Motor Anti Double-Booking (Control de Concurrencia):** Uso de transacciones de base de datos (Locks) para asegurar que si dos peticiones intentan agendar la cita al mismo milisegundo, solo una proceda.
* **Poblado de Datos (Seeders):** Script que llena la base de datos automáticamente al inicializar para no probar "en vacío".

---

## 4. Especificación de Endpoints (API Design)

La API seguirá principios RESTful y devolverá respuestas en formato JSON estructurado. Todas las rutas estarán bajo el prefijo `/api/v1`.

### 4.1 Módulo de Autenticación (`/auth`)
* **`POST /api/v1/auth/register`**
  * **Descripción:** Crea un nuevo usuario paciente.
  * **Body:** `name`, `email`, `password`, `phone`.
  * **Respuesta (201):** `{ token: "jwt...", user: {...} }`
* **`POST /api/v1/auth/login`**
  * **Descripción:** Inicia sesión y devuelve el token de autorización.
  * **Body:** `email`, `password`.

### 4.2 Módulo Clínico (`/clinical`)
* **`GET /api/v1/clinical/specialties`**
  * **Descripción:** Lista todas las especialidades disponibles.
  * **Respuesta (200):** Array de objetos `{ id, name, iconUrl }`.
* **`GET /api/v1/clinical/doctors`**
  * **Descripción:** Lista médicos.
  * **Query Params:** `?specialty_id=X` (Opcional, filtra por especialidad).
  * **Respuesta (200):** Array de `{ id, user_name, bio, specialty_name, rating }`.

### 4.3 Módulo de Agenda y Disponibilidad (`/availability`)
* **`GET /api/v1/doctors/:doctorId/availability`**
  * **Descripción:** El corazón del sistema. Calcula los "slots" de tiempo libres.
  * **Query Params:** `?date=YYYY-MM-DD` (Obligatorio).
  * **Lógica Interna:** 
    1. Busca la jornada laboral del médico para el día de la semana pedido (ej. 09:00 a 14:00, slots de 30 min).
    2. Busca en DB todas las citas confirmadas de ese médico en esa fecha.
    3. Resta los slots ocupados de la jornada laboral.
  * **Respuesta (200):** Array de strings con horarios libres: `["09:00", "09:30", "11:00", ...]`.

### 4.4 Módulo de Citas (`/appointments`)
* **`POST /api/v1/appointments`**
  * **Descripción:** Registra una nueva reserva.
  * **Headers:** `Authorization: Bearer <token>`
  * **Body:** `{ doctor_id, date, start_time }` (No hace falta enviar el usuario, se toma del token JWT).
  * **Comportamiento Transaccional:** El endpoint inicia un *Transacction Block*. Verifica si existe una cita para el mismo `doctor_id`, `date` y `start_time` con status `CONFIRMED`. Si no, crea el registro. Todo esto ocurre atómicamente.
  * **Respuesta (201):** Objeto Appointment con status `CONFIRMED`.
  * **Respuesta (409 Conflict):** "Lo sentimos, el horario acaba de ser reservado por alguien más".
* **`GET /api/v1/appointments`**
  * **Descripción:** Dashboard del paciente. Lista todas las citas del usuario logueado.
  * **Respuesta (200):** Array de citas futuras y pasadas con relaciones (`doctor`, `specialty`).
* **`PATCH /api/v1/appointments/:id/cancel`**
  * **Descripción:** Cambia el status de una cita de `CONFIRMED` a `CANCELLED`, liberando el slot para otros pacientes.

---

## 5. Diseño de Base de Datos (Modelado ERD)

Usaremos PostgreSQL administrado por el ORM Prisma.

1. **User:** `id`, `email`, `password_hash`, `role` (PATIENT, DOCTOR, ADMIN). Perfiles unificados.
2. **PatientProfile:** Relacionado 1-1 con `User`. Almacena datos como edad, teléfono.
3. **DoctorProfile:** Relacionado 1-1 con `User`. Almacena `bio`, `specialty_id`.
4. **Specialty:** `id`, `name`, `description`. Relación 1-N con Doctors.
5. **ScheduleRule (Horario Laboral):** Reglas base para un médico. `id`, `doctor_id`, `day_of_week` (1-7), `start_time` (ej. "08:00"), `end_time`, `slot_duration_minutes` (ej. 30).
6. **Appointment (Cita):** `id`, `patient_id`, `doctor_id`, `date`, `start_time`, `end_time`, `status` (PENDING, CONFIRMED, CANCELLED). 
   * **Constraint Único (Anti Double-Booking):** La base de datos tendrá un constraint unique a nivel de tabla para `[doctor_id, date, start_time]` *solo* aplicable cuando el status sea distinto a `CANCELLED`. Esto es protección a nivel de motor de DB, imposible de vulnerar.

---

## 6. Requisitos No Funcionales & Buenas Prácticas
1. **Validación de Datos (Input Validation):** Uso de **Zod** en Middlewares. Toda petición POST/PUT debe tener un formato estrictamente verificado antes de tocar los Controladores (ej. formato de email, fechas válidas).
2. **Manejo Centralizado de Errores:** Un único Middleware de Express para capturar errores lanzados en la aplicación, de forma que siempre se envíe un payload consistente como `{ "error": true, "message": "..." }`.
3. **Escalabilidad:** Código estructurado en Capas (Rutas -> Controladores -> Servicios -> Repositorios/Prisma) para que la lógica de negocio viva separada del Framework HTTP.
4. **Seguridad Básica:** Hashing de contraseñas usando bcrypt, variables de entorno para los secretos de JWT, y políticas CORS restrictivas.