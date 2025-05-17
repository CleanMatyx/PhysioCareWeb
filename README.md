<h1>PhysioCare API v2</h1>
<p>Esta colección de Postman documenta todos los endpoints disponibles para <strong>usuarios (pacientes, fisioterapeutas, admin)</strong>, gestión de <strong>pacientes</strong>, <strong>fisioterapeutas</strong>, <strong>expedientes médicos</strong> y <strong>citas</strong>.</p>

<!-- Navegación interna -->
<nav style="background:#f9f9f9;padding:10px;border-radius:5px;margin-bottom:20px;">
  <ul style="list-style:none;padding:0;margin:0;display:flex;gap:15px;">
    <li><a href="#autenticacion">Login</a></li>
    <li><a href="#pacientes">Pacientes</a></li>
    <li><a href="#fisioterapeutas">Fisioterapeutas</a></li>
    <li><a href="#expedientes-medicos">Expedientes Médicos</a></li>
    <li><a href="#citas">Citas</a></li>
    <li><a href="#endpoints-especiales">Endpoints Especiales</a></li>
  </ul>
</nav>

<hr>

<h2 id="autenticacion">Autenticación</h2>
<h3 id="login">POST <code>/auth/login</code></h3>
<p>Genera un <code>token</code> válido para el rol correspondiente.</p>
<pre><code>{
  "login": "usuario",
  "password": "contraseña"
}</code></pre>
<p><strong>Respuestas comunes:</strong></p>
<ul>
  <li><code>200 OK</code><br>
    <pre><code>{
  "ok": true,
  "token": "eyJ…",
  "userId": "12345",
  "login": "juanperez",
  "rol": "patient"
}</code></pre>
  </li>
  <li><code>400 Bad Request</code><br>
    <pre><code>{
  "ok": false,
  "error": "Faltan credenciales."
}</code></pre>
  </li>
  <li><code>401 Unauthorized</code><br>
    <pre><code>{
  "ok": false,
  "error": "Login o contraseña incorrectos."
}</code></pre>
  </li>
  <li><code>500 Internal Server Error</code><br>
    <pre><code>{
  "ok": false,
  "error": "Error interno del servidor."
}</code></pre>
  </li>
</ul>

<hr>

<h2 id="pacientes">Pacientes</h2>
<h3 id="list-patients">GET <code>/api/physio/patients</code></h3>
<p>Lista todos los pacientes (requiere <code>Bearer &lt;token&gt;</code> de fisio o admin).</p>
<ul>
  <li><code>200 OK</code><br>
    <pre><code>{
  "ok": true,
  "result": [
    { "_id":"p1", "name":"Ana", "surname":"García", … },
    { "_id":"p2", "name":"Luis", "surname":"Martínez", … }
  ]
}</code></pre>
  </li>
  <li><code>401 Unauthorized</code><br>
    <pre><code>{
  "ok": false,
  "error": "Token inválido o expirado."
}</code></pre>
  </li>
  <li><code>403 Forbidden</code><br>
    <pre><code>{
  "ok": false,
  "error": "No tienes permiso para ver estos datos."
}</code></pre>
  </li>
  <li><code>500 Internal Server Error</code><br>
    <pre><code>{
  "ok": false,
  "error": "Hubo un problema en el servidor."
}</code></pre>
  </li>
</ul>

<h3 id="get-patient">GET <code>/patients/{id}</code></h3>
<p>Obtiene un paciente y sus registros médicos.</p>
<ul>
  <li><code>200 OK</code><br>
    <pre><code>{
  "ok": true,
  "result": {
    "patient": { "_id":"p1", "name":"Ana", … },
    "records": [ { "_id":"r1", "appointments":[…], … } ]
  }
}</code></pre>
  </li>
  <li><code>401 Unauthorized</code><br>
    <pre><code>{
  "ok": false,
  "error": "Token inválido."
}</code></pre>
  </li>
  <li><code>403 Forbidden</code><br>
    <pre><code>{
  "ok": false,
  "error": "Acceso denegado."
}</code></pre>
  </li>
  <li><code>404 Not Found</code><br>
    <pre><code>{
  "ok": false,
  "error": "Paciente no encontrado."
}</code></pre>
  </li>
</ul>

<h3 id="create-patient">POST <code>/patients</code></h3>
<p>Crea un nuevo paciente.</p>
<pre><code>{
  "name": "Matias",
  "surname": "Borra",
  "birthDate": "1994-06-09",
  "address": "Calle Falsa 123",
  "insuranceNumber": "AB123456",
  "email": "matias@example.com"
}</code></pre>
<ul>
  <li><code>201 Created</code><br>
    <pre><code>{
  "ok": true,
  "result": { "_id":"p3", "name":"Matias", … }
}</code></pre>
  </li>
  <li><code>400 Bad Request</code><br>
    <pre><code>{
  "ok": false,
  "message": "Datos inválidos o faltantes."
}</code></pre>
  </li>
  <li><code>403 Forbidden</code><br>
    <pre><code>{
  "ok": false,
  "error": "No tienes permiso para crear pacientes."
}</code></pre>
  </li>
  <li><code>500 Internal Server Error</code><br>
    <pre><code>{
  "ok": false,
  "error": "Error al insertar el paciente."
}</code></pre>
  </li>
</ul>

<h3 id="find-patients">GET <code>/patients/find?surname={apellido}</code></h3>
<p>Busca pacientes por apellido.</p>
<ul>
  <li><code>200 OK</code><br>
    <pre><code>{
  "ok": true,
  "result": [
    { "_id":"p1", "name":"Ana", "surname":"García", … }
  ]
}</code></pre>
  </li>
  <li><code>200 OK (sin resultados)</code><br>
    <pre><code>{
  "ok": true,
  "result": []
}</code></pre>
  </li>
  <li><code>404 Not Found</code><br>
    <pre><code>{
  "ok": false,
  "error": "No se encontraron pacientes con ese apellido."
}</code></pre>
  </li>
  <li><code>401/403</code><br>
    <pre><code>{
  "ok": false,
  "error": "Acceso no autorizado."
}</code></pre>
  </li>
</ul>

<h3 id="update-patient">PUT <code>/patients/{id}</code></h3>
<p>Actualiza datos de un paciente.</p>
<pre><code>{
  "address": "Nueva Dirección 456",
  "email": "nuevo@example.com"
}</code></pre>
<ul>
  <li><code>200 OK</code><br>
    <pre><code>{
  "ok": true,
  "result": { "_id":"p1", "address":"Nueva Dirección 456", … }
}</code></pre>
  </li>
  <li><code>400 Bad Request</code><br>
    <pre><code>{
  "ok": false,
  "error": "Formato de datos inválido."
}</code></pre>
  </li>
  <li><code>403 Forbidden</code><br>
    <pre><code>{
  "ok": false,
  "error": "No puedes actualizar este paciente."
}</code></pre>
  </li>
  <li><code>404 Not Found</code><br>
    <pre><code>{
  "ok": false,
  "error": "Paciente no existe."
}</code></pre>
  </li>
</ul>

<h3 id="delete-patient">DELETE <code>/patients/{id}</code></h3>
<p>Elimina un paciente.</p>
<ul>
  <li><code>200 OK</code><br>
    <pre><code>{
  "ok": true,
  "result": { "_id":"p1", "name":"Ana", … }
}</code></pre>
  </li>
  <li><code>401/403</code><br>
    <pre><code>{
  "ok": false,
  "error": "No tienes permiso para eliminar."
}</code></pre>
  </li>
  <li><code>404 Not Found</code><br>
    <pre><code>{
  "ok": false,
  "error": "Paciente no encontrado."
}</code></pre>
  </li>
</ul>

<hr>

<h2 id="fisioterapeutas">Fisioterapeutas</h2>
<h3 id="list-physios">GET <code>/physios</code></h3>
<p>Lista todos los fisioterapeutas.</p>
<ul>
  <li><code>200 OK</code><br>
    <pre><code>{
  "ok": true,
  "result": [
    { "_id":"f1", "name":"María", … },
    { "_id":"f2", "name":"Carlos", … }
  ]
}</code></pre>
  </li>
  <li><code>401/403</code><br>
    <pre><code>{
  "ok": false,
  "error": "Acceso denegado."
}</code></pre>
  </li>
</ul>

<h3 id="get-physio">GET <code>/physios/{id}</code></h3>
<ul>
  <li><code>200 OK</code><br>
    <pre><code>{
  "ok": true,
  "result": { "_id":"f1", "name":"María", … }
}</code></pre>
  </li>
  <li><code>404 Not Found</code><br>
    <pre><code>{
  "ok": false,
  "error": "Fisioterapeuta no existe."
}</code></pre>
  </li>
  <li><code>401/403</code><br>
    <pre><code>{
  "ok": false,
  "error": "No autorizado."
}</code></pre>
  </li>
</ul>

<h3 id="create-physio">POST <code>/physios</code></h3>
<p>Crea un nuevo fisioterapeuta.</p>
<pre><code>{
  "name":"Matias",
  "surname":"Borra",
  "specialty":"Sports",
  "licenseNumber":"A1597534",
  "email":"matias@fisio.com"
}</code></pre>
<ul>
  <li><code>201 Created</code><br>
    <pre><code>{
  "ok": true,
  "result": { "_id":"f3", "name":"Matias", … }
}</code></pre>
  </li>
  <li><code>400 Bad Request</code><br>
    <pre><code>{
  "ok": false,
  "error": "Datos inválidos."
}</code></pre>
  </li>
  <li><code>403 Forbidden</code><br>
    <pre><code>{
  "ok": false,
  "error": "Sin permiso."
}</code></pre>
  </li>
</ul>

<h3 id="update-physio">PUT <code>/physios/{id}</code></h3>
<ul>
  <li><code>200 OK</code><br>
    <pre><code>{
  "ok": true,
  "result": { "_id":"f1", "specialty":"Rehab", … }
}</code></pre>
  </li>
  <li><code>400 Bad Request</code><br>
    <pre><code>{
  "ok": false,
  "error": "Formato incorrecto."
}</code></pre>
  </li>
  <li><code>403 Forbidden</code><br>
    <pre><code>{
  "ok": false,
  "error": "No puedes modificar."
}</code></pre>
  </li>
  <li><code>404 Not Found</code><br>
    <pre><code>{
  "ok": false,
  "error": "Fisioterapeuta no existe."
}</code></pre>
  </li>
</ul>

<h3 id="delete-physio">DELETE <code>/physios/{id}</code></h3>
<ul>
  <li><code>200 OK</code><br>
    <pre><code>{
  "ok": true,
  "result": { "_id":"f1", … }
}</code></pre>
  </li>
  <li><code>403 Forbidden</code><br>
    <pre><code>{
  "ok": false,
  "error": "No autorizado."
}</code></pre>
  </li>
  <li><code>404 Not Found</code><br>
    <pre><code>{
  "ok": false,
  "error": "Fisioterapeuta no encontrado."
}</code></pre>
  </li>
</ul>

<hr>

<h2 id="expedientes-medicos">Expedientes Médicos</h2>
<h3 id="list-records">GET <code>/records</code></h3>
<ul>
  <li><code>200 OK</code><br>
    <pre><code>{
  "ok": true,
  "result": [ { "_id":"r1", "patient":"p1", … }, … ]
}</code></pre>
  </li>
  <li><code>401/403</code><br>
    <pre><code>{
  "ok": false,
  "error": "Acceso denegado."
}</code></pre>
  </li>
</ul>

<h3 id="find-records">GET <code>/records/find?surname={apellido}</code></h3>
<ul>
  <li><code>200 OK</code><br>
    <pre><code>{
  "ok": true,
  "result": [
    { "_id":"r1", "patient":{ "_id":"p1", "surname":"García" }, … }
  ]
}</code></pre>
  </li>
  <li><code>404 Not Found</code><br>
    <pre><code>{
  "ok": false,
  "error": "No se encontraron expedientes."
}</code></pre>
  </li>
  <li><code>401/403</code><br>
    <pre><code>{
  "ok": false,
  "error": "No autorizado."
}</code></pre>
  </li>
</ul>

<h3 id="get-record">GET <code>/records/{patientId}</code></h3>
<ul>
  <li><code>200 OK</code><br>
    <pre><code>{
  "ok": true,
  "result": { "_id":"r1", "medicalRecord":"Detalles…", "appointments":[…] }
}</code></pre>
  </li>
  <li><code>404 Not Found</code><br>
    <pre><code>{
  "ok": false,
  "error": "Expediente no existe."
}</code></pre>
  </li>
  <li><code>401/403</code><br>
    <pre><code>{
  "ok": false,
  "error": "Acceso denegado."
}</code></pre>
  </li>
</ul>

<h3 id="create-record">POST <code>/records</code></h3>
<pre><code>{
  "patient":"p2",
  "medicalRecord":"Diagnóstico inicial",
  "appointments":[]
}</code></pre>
<ul>
  <li><code>201 Created</code><br>
    <pre><code>{
  "ok": true,
  "result": { "_id":"r2", … }
}</code></pre>
  </li>
  <li><code>400 Bad Request</code><br>
    <pre><code>{
  "ok": false,
  "error": "Datos incompletos."
}</code></pre>
  </li>
  <li><code>403 Forbidden</code><br>
    <pre><code>{
  "ok": false,
  "error": "Sin permiso."
}</code></pre>
  </li>
</ul>

<h3 id="create-appointment-record">POST <code>/records/{id}/appointments</code></h3>
<pre><code>{
  "date":"2025-05-20T10:00:00Z",
  "physio":"f1",
  "notes":"Sesión inicial"
}</code></pre>
<ul>
  <li><code>201 Created</code><br>
    <pre><code>{
  "ok": true,
  "appointment": { "_id":"a1", … }
}</code></pre>
  </li>
  <li><code>400 Bad Request</code><br>
    <pre><code>{
  "ok": false,
  "error": "Formato de fecha inválido."
}</code></pre>
  </li>
  <li><code>404 Not Found</code><br>
    <pre><code>{
  "ok": false,
  "error": "Expediente no existe."
}</code></pre>
  </li>
  <li><code>403 Forbidden</code><br>
    <pre><code>{
  "ok": false,
  "error": "No autorizado."
}</code></pre>
  </li>
</ul>

<h3 id="delete-record">DELETE <code>/records/{id}</code></h3>
<ul>
  <li><code>200 OK</code><br>
    <pre><code>{
  "ok": true,
  "result": { "_id":"r1" }
}</code></pre>
  </li>
  <li><code>401/403</code><br>
    <pre><code>{
  "ok": false,
  "error": "No tienes permiso."
}</code></pre>
  </li>
  <li><code>404 Not Found</code><br>
    <pre><code>{
  "ok": false,
  "error": "Expediente no encontrado."
}</code></pre>
  </li>
</ul>

<hr>

<h2 id="citas">Citas</h2>
<h3 id="get-appointments-record">GET <code>/records/{id}/appointments</code></h3>
<ul>
  <li><code>200 OK</code><br>
    <pre><code>{
  "ok": true,
  "appointments": [ { "_id":"a1", "date":"…", … }, … ]
}</code></pre>
  </li>
  <li><code>404 Not Found</code><br>
    <pre><code>{
  "ok": false,
  "error": "Expediente no existe."
}</code></pre>
  </li>
  <li><code>401/403</code><br>
    <pre><code>{
  "ok": false,
  "error": "Acceso denegado."
}</code></pre>
  </li>
</ul>

<h3 id="count-appointments-patient">GET <code>/records/patient/{patientId}/appointments/count</code></h3>
<ul>
  <li><code>200 OK</code><br>
    <pre><code>{
  "ok": true,
  "count": 4
}</code></pre>
  </li>
  <li><code>404 Not Found</code><br>
    <pre><code>{
  "ok": false,
  "error": "Paciente o expediente no existe."
}</code></pre>
  </li>
  <li><code>401/403</code><br>
    <pre><code>{
  "ok": false,
  "error": "No autorizado."
}</code></pre>
  </li>
</ul>

<h3 id="delete-appointment">DELETE <code>/records/appointments/{appointmentId}</code></h3>
<ul>
  <li><code>200 OK</code><br>
    <pre><code>{
  "ok": true,
  "message": "Cita eliminada correctamente."
}</code></pre>
  </li>
  <li><code>404 Not Found</code><br>
    <pre><code>{
  "ok": false,
  "error": "Cita no encontrada."
}</code></pre>
  </li>
  <li><code>401/403</code><br>
    <pre><code>{
  "ok": false,
  "error": "Acceso denegado."
}</code></pre>
  </li>
</ul>

<h3 id="get-appointments-physio">GET <code>/records/physio/{physioId}/appointments</code></h3>
<ul>
  <li><code>200 OK</code><br>
    <pre><code>{
  "ok": true,
  "appointments": [
    { "_id":"a1", "patient":"p1", "date":"…", … }
  ]
}</code></pre>
  </li>
  <li><code>404 Not Found</code><br>
    <pre><code>{
  "ok": false,
  "error": "No hay citas para ese fisioterapeuta."
}</code></pre>
  </li>
  <li><code>401/403</code><br>
    <pre><code>{
  "ok": false,
  "error": "No autorizado."
}</code></pre>
  </li>
</ul>

<hr>

<h2 id="endpoints-especiales">Endpoints Especiales (Front-end PhysioCare)</h2>
<h3 id="frontend-post-appointment">POST <code>/api/physio/records/{id}/appointments</code></h3>
<p>Agregar cita desde el dashboard de fisioterapeuta (CORS habilitado).</p>
<ul>
  <li><code>201 Created</code><br>
    <pre><code>{
  "ok": true,
  "appointment": { "_id":"a2", … }
}</code></pre>
  </li>
  <li><code>403 Forbidden</code><br>
    <pre><code>{
  "ok": false,
  "error": "No autorizado."
}</code></pre>
  </li>
  <li><code>404 Not Found</code><br>
    <pre><code>{
  "ok": false,
  "error": "Expediente no encontrado."
}</code></pre>
  </li>
  <li><code>500 Internal Server Error</code><br>
    <pre><code>{
  "ok": false,
  "error": "Error al procesar la solicitud."
}</code></pre>
  </li>
</ul>

<hr>

