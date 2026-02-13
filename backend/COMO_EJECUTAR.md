# 🎯 Cómo Ejecutar FlashyBank - Paso 2 Completado

## ✅ Estado del Proyecto

```
✅ Paso 2: JWT Authentication - COMPLETADO
✅ Compilación: EXITOSA
✅ Código: Listo para ejecutar
⚠️  Solo falta configurar PostgreSQL
```

---

## 🚀 Opción Rápida (Recomendada)

### Paso 1: Iniciar PostgreSQL

```bash
# Si usas Homebrew
brew services start postgresql

# O si ya está corriendo, verifícalo
pg_isready
```

### Paso 2: Crear Base de Datos

```bash
# Crear la base de datos
createdb flashybank

# Verificar que se creó
psql -U postgres -l | grep flashybank
```

### Paso 3: Ejecutar la Aplicación

```bash
cd /Users/macbook/Documents/05_Proyectos/FlashyBank/flashyBank

# Usar el script automatizado
./setup-db.sh

# O ejecutar directamente
./gradlew bootRun
```

---

## 🛠️ Opción Manual

### 1. Configurar PostgreSQL

```bash
# Iniciar PostgreSQL
brew services start postgresql

# Entrar a PostgreSQL
psql -U postgres

# Crear base de datos
CREATE DATABASE flashybank;

# Salir
\q
```

### 2. Verificar Configuración

Editar `src/main/resources/application.yaml`:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/flashybank
    username: postgres
    password: root  # ← Cambiar si es necesario
```

### 3. Ejecutar

```bash
./gradlew clean bootRun
```

---

## 🧪 Probar la API

Una vez que la aplicación esté corriendo (verás "Started FlashyBankApplication"):

### 1. Endpoint Público (Sin Auth)

```bash
curl http://localhost:8080/api/hello
```

**Response:**
```json
{
  "message": "Hola desde FlashyBank - API funcionando!",
  "status": "online"
}
```

### 2. Registrar Usuario

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "juan",
    "password": "password123"
  }'
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJqdWFu...",
  "refreshToken": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJqdWFu...",
  "username": "juan",
  "role": "USER"
}
```

### 3. Login

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "juan",
    "password": "password123"
  }'
```

### 4. Endpoint Protegido (Requiere Token)

```bash
# Guardar el token
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "juan", "password": "password123"}' \
  | jq -r '.accessToken')

# Acceder a endpoint protegido
curl http://localhost:8080/api/protected \
  -H "Authorization: Bearer $TOKEN"
```

**Response:**
```json
{
  "message": "Este es un endpoint protegido",
  "username": "juan",
  "authorities": [
    {
      "authority": "ROLE_USER"
    }
  ]
}
```

---

## 🔍 Verificar que Todo Funciona

### Checklist

```bash
# 1. PostgreSQL corriendo
pg_isready
# Response: localhost:5432 - accepting connections

# 2. Base de datos existe
psql -U postgres -l | grep flashybank
# Response: flashybank

# 3. Aplicación corriendo
curl http://localhost:8080/api/hello
# Response: {"message":"Hola...","status":"online"}

# 4. Registro funciona
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test123"}'
# Response: {"accessToken":"...", ...}

# 5. Login funciona
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test123"}'
# Response: {"accessToken":"...", ...}
```

---

## ❌ Solución de Problemas

### Error: "FATAL: database flashybank does not exist"

**Solución:**
```bash
createdb flashybank
```

### Error: "Connection refused"

**Solución:**
```bash
# Iniciar PostgreSQL
brew services start postgresql

# O verificar puerto
lsof -i :5432
```

### Error: "password authentication failed"

**Solución:**
1. Verificar contraseña en `application.yaml`
2. O cambiar la contraseña en PostgreSQL:
```bash
psql -U postgres
ALTER USER postgres PASSWORD 'nuevo_password';
\q
```

### Puerto 8080 en uso

**Solución:**
```bash
# Encontrar proceso
lsof -i :8080

# Matar proceso
kill -9 <PID>

# O cambiar puerto en application.yaml
server:
  port: 8081
```

---

## 📊 Resumen de Componentes Implementados

### ✅ Paso 2 - JWT Authentication (COMPLETADO)

#### Archivos creados:
- **SecurityConfig.java** - Configuración Spring Security
- **JwtAuthenticationFilter.java** - Filtro JWT
- **JwtUtil.java** - Utilidades JWT
- **AuthController.java** - Endpoints de autenticación
- **AuthService.java** - Lógica de negocio
- **UserDetailsServiceImpl.java** - Carga de usuarios
- **User.java** - Entidad JPA
- **Transaction.java** - Entidad JPA
- **UserRepository.java** - Repository
- **TransactionRepository.java** - Repository
- **DTOs** - LoginRequest, LoginResponse, etc.

#### Endpoints disponibles:
| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | ❌ | Registrar usuario |
| POST | `/api/auth/login` | ❌ | Login |
| POST | `/api/auth/refresh` | ❌ | Refresh token |
| GET | `/api/hello` | ❌ | Test público |
| GET | `/api/protected` | ✅ | Test protegido |

---

## 🎓 Próximo Paso: Paso 3 - Transfer Service

Una vez que la aplicación esté corriendo, el siguiente paso será implementar:

1. **TransactionService** - Lógica de transferencias
2. **Endpoints de transacciones**:
   - `POST /api/transactions/initiate` - Iniciar transferencia
   - `POST /api/transactions/confirm/{id}` - Confirmar con biometría
   - `GET /api/transactions/history` - Historial
3. **Validaciones**:
   - Saldo suficiente
   - Usuario destinatario existe
   - Monto válido

---

## 📚 Documentación Adicional

- **[README.md](README.md)** - Vista general del proyecto
- **[JWT_SETUP.md](JWT_SETUP.md)** - Guía JWT completa
- **[API_ENDPOINTS.md](API_ENDPOINTS.md)** - Referencia de API
- **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - Resumen visual
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Diagramas de arquitectura
- **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - Comandos rápidos

---

## 🎉 ¡Listo!

El proyecto **Paso 2 está COMPLETADO** y listo para usar.

Ejecuta:
```bash
cd /Users/macbook/Documents/05_Proyectos/FlashyBank/flashyBank
./setup-db.sh
```

O manualmente:
```bash
brew services start postgresql
createdb flashybank
./gradlew bootRun
```

¡La aplicación estará disponible en http://localhost:8080! 🚀
