# 📡 Documentación de la API de FlashyBank

**Versión:** 1.0.0
**Base URL:** `http://localhost:8080`
**Autenticación:** JWT Bearer Token

---

## 📋 Tabla de Contenidos

- [Autenticación](#autenticación)
- [Transacciones](#transacciones)
- [Usuarios](#usuarios)
- [Test](#test)
- [Códigos de Error](#códigos-de-error)
- [Modelos de Datos](#modelos-de-datos)

---

## 🔐 Autenticación

### 1. Registrar Usuario

Crea un nuevo usuario en el sistema. El usuario recibe un saldo inicial de **$1000.00**.

**Endpoint:** `POST /api/auth/register`

**Headers:**
```http
Content-Type: application/json
```

**Body:**
```json
{
  "username": "juanperez",
  "password": "Password123!"
}
```

**Campos:**
- `username` (string, required): Nombre de usuario (3-50 caracteres, alfanumérico)
- `password` (string, required): Contraseña (mínimo 6 caracteres)

**Response 200 OK:**
```json
{
  "accessToken": "eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJqdWFucGVyZXoiLCJpYXQiOjE3Mzc3NjQ1MDAsImV4cCI6MTczODM2OTMwMH0.xyz...",
  "refreshToken": "eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJqdWFucGVyZXoiLCJpYXQiOjE3Mzc3NjQ1MDAsImV4cCI6MTczODk3NDEwMH0.abc...",
  "username": "juanperez",
  "role": "USER"
}
```

**Error 400 Bad Request - Username en uso:**
```json
{
  "timestamp": "2025-01-25T10:30:00",
  "status": 400,
  "error": "Bad Request",
  "message": "El username ya está en uso"
}
```

**Error 400 Bad Request - Validación:**
```json
{
  "timestamp": "2025-01-25T10:30:00",
  "status": 400,
  "error": "Validation Error",
  "message": "Error de validación en los campos enviados",
  "errors": {
    "username": "El nombre de usuario es obligatorio",
    "password": "La contraseña debe tener al menos 6 caracteres"
  }
}
```

---

### 2. Login

Inicia sesión y retorna tokens de acceso.

**Endpoint:** `POST /api/auth/login`

**Headers:**
```http
Content-Type: application/json
```

**Body:**
```json
{
  "username": "juanperez",
  "password": "Password123!"
}
```

**Response 200 OK:**
```json
{
  "accessToken": "eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJqdWFucGVyZXoiLCJpYXQiOjE3Mzc3NjQ1MDAsImV4cCI6MTczODM2OTMwMH0.xyz...",
  "refreshToken": "eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJqdWFucGVyZXoiLCJpYXQiOjE3Mzc3NjQ1MDAsImV4cCI6MTczODk3NDEwMH0.abc...",
  "username": "juanperez",
  "role": "USER"
}
```

**Error 401 Unauthorized - Credenciales inválidas:**
```json
{
  "timestamp": "2025-01-25T10:30:00",
  "status": 401,
  "error": "Unauthorized",
  "message": "Credenciales inválidas"
}
```

**Error 404 Not Found - Usuario no encontrado:**
```json
{
  "timestamp": "2025-01-25T10:30:00",
  "status": 404,
  "error": "Not Found",
  "message": "Usuario no encontrado"
}
```

---

### 3. Renovar Token

Renueva el access token usando el refresh token.

**Endpoint:** `POST /api/auth/refresh`

**Headers:**
```http
Content-Type: application/json
```

**Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJqdWFucGVyZXoiLCJpYXQiOjE3Mzc3NjQ1MDAsImV4cCI6MTczODk3NDEwMH0.abc..."
}
```

**Response 200 OK:**
```json
{
  "accessToken": "eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJqdWFucGVyZXoiLCJpYXQiOjE3Mzc3NjQ2MDAsImV4cCI6MTczODM2OTQwMH0.new...",
  "refreshToken": "eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJqdWFucGVyZXoiLCJpYXQiOjE3Mzc3NjQ2MDAsImV4cCI6MTczODk3NDIwMH0.refresh...",
  "username": "juanperez",
  "role": "USER"
}
```

**Error 401 Unauthorized - Refresh token inválido:**
```json
{
  "timestamp": "2025-01-25T10:30:00",
  "status": 401,
  "error": "Unauthorized",
  "message": "Refresh token inválido o expirado"
}
```

---

### 4. Logout

Cierra la sesión y agrega los tokens a la blacklist.

**Endpoint:** `POST /api/auth/logout`

**Headers:**
```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJqdWFucGVyZXoiLCJpYXQiOjE3Mzc3NjQ1MDAsImV4cCI6MTczODk3NDEwMH0.abc..."
}
```

**Response 200 OK:**
```json
{
  "message": "Logout exitoso. Tokens invalidados."
}
```

**Nota:** Después del logout, el access token y refresh token quedan invalidados. Cualquier request posterior con estos tokens será rechazado.

---

## 💰 Transacciones

### 1. Ver Saldo

Obtiene el saldo actual del usuario autenticado.

**Endpoint:** `GET /api/transactions/balance`

**Headers:**
```http
Authorization: Bearer <access_token>
```

**Response 200 OK:**
```json
{
  "username": "juanperez",
  "balance": 1500.50
}
```

**Error 401 Unauthorized - Token inválido:**
```json
{
  "timestamp": "2025-01-25T14:00:00",
  "status": 401,
  "error": "Unauthorized",
  "message": "Token inválido o expirado"
}
```

---

### 2. Iniciar Transferencia

Crea una nueva transferencia con estado **PENDING**. El usuario debe tener saldo suficiente.

**Endpoint:** `POST /api/transactions/initiate`

**Headers:**
```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Body:**
```json
{
  "receiverUsername": "mariagarcia",
  "amount": 150.50,
  "description": "Pago de préstamo"
}
```

**Campos:**
- `receiverUsername` (string, required): Nombre de usuario del destinatario
- `amount` (number, required): Monto a transferir (debe ser positivo)
- `description` (string, optional): Descripción de la transferencia

**Response 201 Created:**
```json
{
  "id": 123,
  "senderId": 5,
  "senderUsername": "juanperez",
  "receiverUsername": "mariagarcia",
  "amount": 150.50,
  "status": "PENDING",
  "description": "Pago de préstamo",
  "createdAt": "2025-01-25T14:30:00"
}
```

**Error 400 Bad Request - Usuario no encontrado:**
```json
{
  "timestamp": "2025-01-25T14:30:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Usuario destinatario no encontrado: mariagarcia"
}
```

**Error 400 Bad Request - Auto-transferencia:**
```json
{
  "timestamp": "2025-01-25T14:30:00",
  "status": 400,
  "error": "Bad Request",
  "message": "No puedes transferirte dinero a ti mismo"
}
```

**Error 400 Bad Request - Saldo insuficiente:**
```json
{
  "timestamp": "2025-01-25T14:30:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Saldo insuficiente. Tu saldo actual: 100.00, Monto a transferir: 150.50"
}
```

---

### 3. Confirmar Transferencia

Confirma una transferencia y actualiza los saldos de ambos usuarios. Solo el remitente puede confirmar.

**Endpoint:** `POST /api/transactions/confirm/{id}`

**Headers:**
```http
Authorization: Bearer <access_token>
```

**Path Parameters:**
- `id` (number, required): ID de la transacción

**Response 200 OK:**
```json
{
  "id": 123,
  "senderId": 5,
  "senderUsername": "juanperez",
  "receiverUsername": "mariagarcia",
  "amount": 150.50,
  "status": "COMPLETED",
  "description": "Pago de préstamo",
  "createdAt": "2025-01-25T14:30:00"
}
```

**Error 400 Bad Request - Estado inválido:**
```json
{
  "timestamp": "2025-01-25T14:35:00",
  "status": 400,
  "error": "Bad Request",
  "message": "La transacción no puede ser confirmada. Estado actual: COMPLETED"
}
```

**Error 403 Forbidden - No autorizado:**
```json
{
  "timestamp": "2025-01-25T14:35:00",
  "status": 403,
  "error": "Forbidden",
  "message": "No tienes permiso para confirmar esta transacción"
}
```

**Error 404 Not Found - Transacción no encontrada:**
```json
{
  "timestamp": "2025-01-25T14:35:00",
  "status": 404,
  "error": "Not Found",
  "message": "Transacción no encontrada"
}
```

---

### 4. Cancelar Transferencia

Cancela una transferencia en estado **PENDING**. Solo el remitente puede cancelar.

**Endpoint:** `POST /api/transactions/cancel/{id}`

**Headers:**
```http
Authorization: Bearer <access_token>
```

**Path Parameters:**
- `id` (number, required): ID de la transacción

**Response 200 OK:**
```json
{
  "id": 123,
  "senderId": 5,
  "senderUsername": "juanperez",
  "receiverUsername": "mariagarcia",
  "amount": 150.50,
  "status": "CANCELLED",
  "description": "Pago de préstamo",
  "createdAt": "2025-01-25T14:30:00"
}
```

---

### 5. Historial de Transacciones

Obtiene el historial completo de transacciones del usuario (enviadas y recibidas).

**Endpoint:** `GET /api/transactions/history`

**Headers:**
```http
Authorization: Bearer <access_token>
```

**Response 200 OK:**
```json
[
  {
    "id": 125,
    "otherUser": "mariagarcia",
    "amount": 150.50,
    "status": "COMPLETED",
    "type": "SENT",
    "description": "Pago de préstamo",
    "createdAt": "2025-01-25T14:30:00"
  },
  {
    "id": 120,
    "otherUser": "carloslopez",
    "amount": 500.00,
    "status": "COMPLETED",
    "type": "RECEIVED",
    "description": "Pago de servicios",
    "createdAt": "2025-01-24T10:15:00"
  },
  {
    "id": 118,
    "otherUser": "mariagarcia",
    "amount": 75.25,
    "status": "PENDING",
    "type": "SENT",
    "description": "Transferencia pendiente",
    "createdAt": "2025-01-23T16:45:00"
  }
]
```

**Nota:** El historial está ordenado por fecha descendente (más recientes primero). El campo `type` indica si la transacción fue **"SENT"** (enviada) o **"RECEIVED"** (recibida).

---

### 6. Ver Detalles de Transacción

Obtiene los detalles completos de una transacción específica. Solo el remitente puede ver los detalles.

**Endpoint:** `GET /api/transactions/{id}`

**Headers:**
```http
Authorization: Bearer <access_token>
```

**Path Parameters:**
- `id` (number, required): ID de la transacción

**Response 200 OK:**
```json
{
  "id": 123,
  "senderId": 5,
  "senderUsername": "juanperez",
  "receiverUsername": "mariagarcia",
  "amount": 150.50,
  "status": "COMPLETED",
  "description": "Pago de préstamo",
  "createdAt": "2025-01-25T14:30:00"
}
```

**Error 403 Forbidden - No autorizado:**
```json
{
  "timestamp": "2025-01-25T14:40:00",
  "status": 403,
  "error": "Forbidden",
  "message": "No tienes permiso para ver esta transacción"
}
```

---

## 👥 Usuarios

### 1. Ver Perfil

Obtiene el perfil completo del usuario autenticado.

**Endpoint:** `GET /api/users/profile`

**Headers:**
```http
Authorization: Bearer <access_token>
```

**Response 200 OK:**
```json
{
  "id": 5,
  "username": "juanperez",
  "balance": 849.50,
  "role": "USER",
  "enabled": true,
  "createdAt": "2025-01-20T10:00:00",
  "updatedAt": "2025-01-25T14:30:00"
}
```

---

### 2. Editar Perfil

Actualiza el username del usuario autenticado.

**Endpoint:** `PUT /api/users/profile`

**Headers:**
```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Body:**
```json
{
  "username": "juanperez2025"
}
```

**Campos:**
- `username` (string, required): Nuevo nombre de usuario (3-50 caracteres)

**Response 200 OK:**
```json
{
  "id": 5,
  "username": "juanperez2025",
  "balance": 849.50,
  "role": "USER",
  "enabled": true,
  "createdAt": "2025-01-20T10:00:00",
  "updatedAt": "2025-01-25T15:00:00"
}
```

**Error 409 Conflict - Username en uso:**
```json
{
  "timestamp": "2025-01-25T15:00:00",
  "status": 409,
  "error": "Conflict",
  "message": "El nombre de usuario ya está en uso"
}
```

---

### 3. Validar Usuario Destinatario

Valida si un usuario existe antes de hacer una transferencia. Útil para autocomplete.

**Endpoint:** `GET /api/users/validate/{username}`

**Headers:**
```http
Authorization: Bearer <access_token>
```

**Path Parameters:**
- `username` (string, required): Nombre de usuario a validar

**Response 200 OK - Usuario válido:**
```json
{
  "valid": true,
  "username": "mariagarcia",
  "message": "Usuario válido para transferir"
}
```

**Response 200 OK - Usuario no encontrado:**
```json
{
  "valid": false,
  "username": "pedrosanchez",
  "message": "Usuario no encontrado"
}
```

**Response 200 OK - Mismo usuario:**
```json
{
  "valid": false,
  "username": "juanperez",
  "message": "No puedes transferirte dinero a ti mismo"
}
```

---

### 4. Ver Usuario Público

Obtiene información pública de un usuario (sin datos sensibles).

**Endpoint:** `GET /api/users/{username}`

**Headers:**
```http
Authorization: Bearer <access_token>
```

**Path Parameters:**
- `username` (string, required): Nombre de usuario

**Response 200 OK:**
```json
{
  "username": "mariagarcia",
  "role": "USER",
  "createdAt": "2025-01-15T09:00:00"
}
```

**Error 404 Not Found - Usuario no encontrado:**
```json
{
  "timestamp": "2025-01-25T15:30:00",
  "status": 404,
  "error": "Not Found",
  "message": "Usuario no encontrado"
}
```

---

### 5. Listar Usuarios

Lista todos los usuarios con paginación. Solo retorna información pública.

**Endpoint:** `GET /api/users`

**Headers:**
```http
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `page` (number, optional): Número de página (default: 0)
- `size` (number, optional): Tamaño de página (default: 10)
- `search` (string, optional): Filtrar por username que contenga el texto

**Ejemplo:** `GET /api/users?page=0&size=5&search=juan`

**Response 200 OK:**
```json
{
  "content": [
    {
      "username": "juanperez",
      "role": "USER",
      "createdAt": "2025-01-20T10:00:00"
    },
    {
      "username": "juanramirez",
      "role": "USER",
      "createdAt": "2025-01-18T14:30:00"
    }
  ],
  "currentPage": 0,
  "totalElements": 2,
  "totalPages": 1,
  "size": 5
}
```

---

## 🧪 Test

### 1. Endpoint Público

Endpoint de prueba para verificar que la API está funcionando.

**Endpoint:** `GET /api/hello`

**Response 200 OK:**
```json
{
  "message": "Hola desde FlashyBank - API funcionando!",
  "status": "online"
}
```

---

### 2. Endpoint Protegido

Endpoint de prueba para verificar autenticación JWT.

**Endpoint:** `GET /api/protected`

**Headers:**
```http
Authorization: Bearer <access_token>
```

**Response 200 OK:**
```json
{
  "message": "Este es un endpoint protegido",
  "username": "juanperez",
  "authorities": [
    {
      "authority": "ROLE_USER"
    }
  ]
}
```

**Error 401 Unauthorized - Sin token:**
```json
{
  "timestamp": "2025-01-25T16:00:00",
  "status": 401,
  "error": "Unauthorized",
  "message": "Token no encontrado"
}
```

---

## ❌ Códigos de Error

### Códigos HTTP Comunes

| Código | Descripción |
|--------|-------------|
| 200 | OK - Request exitoso |
| 201 | Created - Recurso creado exitosamente |
| 400 | Bad Request - Error de validación o datos incorrectos |
| 401 | Unauthorized - No autenticado o token inválido |
| 403 | Forbidden - No tiene permisos |
| 404 | Not Found - Recurso no encontrado |
| 409 | Conflict - Conflicto (ej: username en uso) |
| 500 | Internal Server Error - Error del servidor |

### Formato de Error

Todos los errores siguen este formato:

```json
{
  "timestamp": "2025-01-25T10:30:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Descripción detallada del error"
}
```

Errores de validación incluyen el campo `errors`:

```json
{
  "timestamp": "2025-01-25T10:30:00",
  "status": 400,
  "error": "Validation Error",
  "message": "Error de validación en los campos enviados",
  "errors": {
    "campo1": "Mensaje de error del campo1",
    "campo2": "Mensaje de error del campo2"
  }
}
```

---

## 📊 Modelos de Datos

### User

```typescript
interface User {
  id: number;
  username: string;
  password: string;           // Solo en registro/login
  balance: number;
  role: string;               // "USER" | "ADMIN"
  enabled: boolean;
  createdAt: string;          // ISO 8601
  updatedAt: string;          // ISO 8601
}
```

### Transaction

```typescript
interface Transaction {
  id: number;
  senderId: number;
  senderUsername: string;
  receiverUsername: string;
  amount: number;
  status: string;             // "PENDING" | "COMPLETED" | "CANCELLED"
  description: string;
  createdAt: string;          // ISO 8601
}
```

### TransactionHistory

```typescript
interface TransactionHistory {
  id: number;
  otherUser: string;          // Username de la contraparte
  amount: number;
  status: string;
  type: string;               // "SENT" | "RECEIVED"
  description: string;
  createdAt: string;
}
```

### LoginResponse

```typescript
interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  username: string;
  role: string;
}
```

---

## 🔒 Seguridad

### Autenticación JWT

La API usa tokens JWT (JSON Web Tokens) para la autenticación:

**Access Token:**
- Duración: 7 días
- Uso: Acceder a endpoints protegidos
- Envío: Header `Authorization: Bearer <access_token>`

**Refresh Token:**
- Duración: 14 días
- Uso: Renovar access token sin login
- Envío: Body del endpoint `/api/auth/refresh`

### Token Blacklist

Cuando un usuario hace logout, sus tokens se agregan a una blacklist y quedan invalidados inmediatamente.

### Reglas de Seguridad

1. **Tokens expirados:** Cualquier request con un token expirado retorna 401
2. **Tokens revocados:** Tokens en blacklist también retornan 401
3. **Password:** Encriptados con BCrypt antes de guardar en BD
4. **TLS/SSL:** Recomendado para producción
5. **Rate Limiting:** Recomendado para producción

---

## 📝 Ejemplos de Uso

### Flujo Completo de Transferencia

```javascript
// 1. Login
const loginResponse = await fetch('http://localhost:8080/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'juanperez',
    password: 'Password123!'
  })
});
const { accessToken } = await loginResponse.json();

// 2. Validar destinatario
const validateResponse = await fetch('http://localhost:8080/api/users/validate/mariagarcia', {
  headers: { 'Authorization': `Bearer ${accessToken}` }
});
const { valid } = await validateResponse.json();

if (valid) {
  // 3. Iniciar transferencia
  const initiateResponse = await fetch('http://localhost:8080/api/transactions/initiate', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      receiverUsername: 'mariagarcia',
      amount: 150.50,
      description: 'Pago de préstamo'
    })
  });
  const { id } = await initiateResponse.json();

  // 4. Confirmar transferencia (con biometría en mobile)
  const confirmResponse = await fetch(`http://localhost:8080/api/transactions/confirm/${id}`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
  const result = await confirmResponse.json();
  console.log('Transferencia completada:', result.status);
}
```

---

## 🚀 Información Adicional

### Versionado

La API está en versión 1.0.0. Cambios futuros serán documentados aquí.

### Soporte

Para preguntas o issues:
- Revisar los códigos de error
- Verificar el formato de los requests
- Asegurarse de usar tokens válidos

### Cambios Futuros

- [ ] Rate limiting
- [ ] Webhooks para notificaciones
- [ ] API Key para integraciones de terceros
- [ ] Paginación con cursor para grandes volúmenes
- [ ] Endpoints para recuperación de contraseña

---

**Documentación generada:** 2025-02-12
**Última actualización:** 2025-02-12
