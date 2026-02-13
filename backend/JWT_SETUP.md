# FlashyBank - Paso 2: JWT Authentication Implementado

## ✅ Componentes Implementados

### 1. **Entidades**
- `User.java` - Entidad de usuario con campos: id, username, password, balance, role, enabled
- `Transaction.java` - Entidad de transacción con campos: id, senderId, receiverUsername, amount, status, description

### 2. **Repositorios**
- `UserRepository.java` - Repositorio JPA con métodos findByUsername y existsByUsername
- `TransactionRepository.java` - Repositorio JPA para transacciones

### 3. **DTOs (Data Transfer Objects)**
- `LoginRequest.java` - Request para login (username, password)
- `LoginResponse.java` - Response con accessToken, refreshToken, username, role
- `RefreshTokenRequest.java` - Request para refresh token
- `RegisterRequest.java` - Request para registro (username, password)

### 4. **Utilidades JWT**
- `JwtUtil.java` - Clase completa para:
  - Generar tokens (access y refresh)
  - Extraer claims (username, expiration)
  - Validar tokens
  - Verificar expiración

### 5. **Filtros de Seguridad**
- `JwtAuthenticationFilter.java` - Filtro que:
  - Intercepta cada request
  - Extrae el token del header "Authorization: Bearer <token>"
  - Valida el token
  - Establece la autenticación en el SecurityContext

### 6. **Configuración de Seguridad**
- `SecurityConfig.java` - Configuración completa con:
  - CSRF deshabilitado (para API REST)
  - Endpoints públicos: `/api/auth/**`, `/api/public/**`
  - Resto de endpoints protegidos
  - Política de sesión STATELESS (sin sesiones HTTP)
  - BCryptPasswordEncoder para encriptar passwords
  - AuthenticationManager configurado

### 7. **Servicios**
- `UserDetailsServiceImpl.java` - Implementación de UserDetailsService que carga usuarios desde la BD
- `AuthService.java` - Lógica de autenticación:
  - `login()` - Autentica y genera tokens
  - `register()` - Registra nuevo usuario y genera tokens
  - `refreshToken()` - Renueva tokens usando refresh token

### 8. **Controladores**
- `AuthController.java` - Endpoints de autenticación:
  - `POST /api/auth/login` - Login
  - `POST /api/auth/register` - Registro
  - `POST /api/auth/refresh` - Refresh token
- `TestController.java` - Endpoints de prueba:
  - `GET /api/hello` - Público
  - `GET /api/protected` - Protegido (requiere token)

### 9. **Configuración**
- `application.yaml` - Configuración actualizada con:
  - Conexión a PostgreSQL
  - Configuración JWT (secret, expiration, refresh-expiration)
  - Hibernate ddl-auto: update (crea tablas automáticamente)

### 10. **Dependencias**
- Agregada dependencia JWT: `io.jsonwebtoken:jjwt-api:0.12.6`

## 📋 Estructura de Paquetes

```
com.flashybank/
├── config/
│   └── SecurityConfig.java
├── controller/
│   ├── AuthController.java
│   └── TestController.java
├── dto/
│   ├── LoginRequest.java
│   ├── LoginResponse.java
│   ├── RefreshTokenRequest.java
│   └── RegisterRequest.java
├── filter/
│   └── JwtAuthenticationFilter.java
├── model/
│   ├── User.java
│   └── Transaction.java
├── repository/
│   ├── TransactionRepository.java
│   └── UserRepository.java
├── service/
│   ├── AuthService.java
│   └── UserDetailsServiceImpl.java
├── util/
│   └── JwtUtil.java
└── FlashyBankApplication.java
```

## 🧪 Cómo Probar

### 1. Iniciar PostgreSQL
```bash
# Asegúrate de que PostgreSQL esté corriendo y que la base de datos exista
createdb flashybank
```

### 2. Ejecutar la aplicación
```bash
./gradlew bootRun
```

### 3. Probar Registro de Usuario
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "juan",
    "password": "password123"
  }'
```

**Respuesta esperada:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiJ9...",
  "username": "juan",
  "role": "USER"
}
```

### 4. Probar Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "juan",
    "password": "password123"
  }'
```

### 5. Probar Endpoint Protegido
```bash
# Usar el accessToken recibido en el login
curl -X GET http://localhost:8080/api/protected \
  -H "Authorization: Bearer <tu_access_token>"
```

### 6. Probar Refresh Token
```bash
curl -X POST http://localhost:8080/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "<tu_refresh_token>"
  }'
```

## 📊 Roadmap del Proyecto

### ✅ Paso 1: Configuración Base (Completado)
- [x] Proyecto Spring Boot creado
- [x] Dependencias configuradas
- [x] Conexión a PostgreSQL
- [x] Entidades básicas

### ✅ Paso 2: JWT Authentication (Completado - ESTE PASO)
- [x] JwtUtil para generar/validar tokens
- [x] JwtAuthenticationFilter
- [x] SecurityConfig con JWT
- [x] AuthController (login, refresh, register)
- [x] DTOs necesarios

### ⏭️ Paso 3: Transfer Service (Siguiente)
- [ ] Crear TransactionService
- [ ] Endpoint para iniciar transferencia
- [ ] Endpoint para confirmar transferencia con biometría
- [ ] Validación de saldo suficiente
- [ ] Actualización de saldos
- [ ] Historial de transacciones

### 🔮 Paso 4: React Native App
- [ ] Configuración proyecto React Native
- [ ] Pantalla de login
- [ ] Pantalla de registro
- [ ] Pantalla de transferencia
- [ ] Integración biometría (TouchID/FaceID en iOS, Fingerprint en Android)
- [ ] Almacenamiento seguro de JWT

### 🔮 Paso 5: Testing y Deploy
- [ ] Tests unitarios
- [ ] Tests de integración
- [ ] Dockerización
- [ ] Deploy en nube (AWS/GCP)

## 🎯 Próximos Pasos (Paso 3)

El siguiente paso sería implementar el **TransactionService** con:

1. **Servicio de Transferencias**
   - Validar saldo disponible
   - Verificar que el destinatario existe
   - Crear transacción con estado "PENDING"
   - Confirmar transacción (cambio de estado y actualización de saldos)
   - Obtener historial de transacciones

2. **Controlador de Transferencias**
   - `POST /api/transactions/initiate` - Iniciar transferencia
   - `POST /api/transactions/confirm/{id}` - Confirmar con biometría
   - `GET /api/transactions/history` - Historial del usuario

3. **Seguridad Adicional**
   - Validar que el token JWT sea válido y pertenezca al usuario
   - Verificar permisos (solo el dueño de la cuenta puede transferir)

## 📝 Notas Importantes

- El secret JWT debe ser más largo en producción (mínimo 256 bits para HS256)
- Los tokens expiran en 7 días (access token) y 14 días (refresh token)
- Los passwords se encriptan con BCrypt
- La aplicación crea las tablas automáticamente con Hibernate ddl-auto: update
- El usuario de prueba en `data.sql` tiene password: `123456`
