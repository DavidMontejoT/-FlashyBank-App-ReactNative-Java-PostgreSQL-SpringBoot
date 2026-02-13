# 🏦 FlashyBank - MVP Backend con Spring Boot

<div align="center">

![Java](https://img.shields.io/badge/Java-21-orange)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.10-green)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue)
![JWT](https://img.shields.io/badge/JWT-Implemented-success)

**Backend bancario completo con autenticación JWT, transferencias y gestión de usuarios**

[Documentación API](📡-API-Documentation) •
[Postman Collection](📮-Postman-Collection) •
[Estado del Proyecto](#-estado-del-proyecto) •
[Roadmap](#-roadmap)

</div>

---

## 📊 Estado del Proyecto

```
✅ Paso 1: Configuración Base - COMPLETADO
✅ Paso 2: JWT Authentication - COMPLETADO
✅ Paso 3: Transfer Service - COMPLETADO Y PROBADO
✅ Paso 3.5: Backend Completo - COMPLETADO Y PROBADO
⏭️  Paso 4: React Native App - SIGUIENTE
🔮 Paso 5: Testing & Deploy
```

### ✅ Backend 100% Completo

- 🔐 **Autenticación JWT completa** - Login, registro, refresh, logout con blacklist
- 💰 **Sistema de transferencias** - Iniciar, confirmar, cancelar, historial
- 👥 **Gestión de usuarios** - Ver perfil, editar, validar, buscar
- 🛡️ **Seguridad robusta** - BCrypt, JWT filter, token blacklist
- 📊 **17 endpoints funcionando** - Todos probados y documentados

---

## 🚀 Guía Rápida

### Requisitos Previos

- ☕ Java 21+
- 🐘 PostgreSQL 15+
- 📦 Gradle 8+

### Instalación y Ejecución

```bash
# 1. Navegar al directorio
cd /Users/macbook/Documents/05_Proyectos/FlashyBank/flashyBank

# 2. Crear base de datos PostgreSQL
createdb flashybank

# 3. Ejecutar la aplicación
./gradlew bootRun

# 4. La API estará disponible en http://localhost:8080
```

### Prueba Rápida

```bash
# Registrar usuario
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "juan", "password": "password123"}'

# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "juan", "password": "password123"}'

# Ver saldo (con token)
curl http://localhost:8080/api/transactions/balance \
  -H "Authorization: Bearer <tu_token>"
```

---

## 📡 API Endpoints (17 Totales)

### 🔐 Autenticación (5 endpoints)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Registrar usuario | ❌ |
| POST | `/api/auth/login` | Iniciar sesión | ❌ |
| POST | `/api/auth/refresh` | Renovar token | ❌ |
| POST | `/api/auth/logout` | Cerrar sesión | ❌ |
| GET | `/api/hello` | Test público | ❌ |

### 💰 Transacciones (6 endpoints)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/transactions/balance` | Ver saldo | ✅ |
| POST | `/api/transactions/initiate` | Iniciar transferencia | ✅ |
| POST | `/api/transactions/confirm/{id}` | Confirmar transferencia | ✅ |
| POST | `/api/transactions/cancel/{id}` | Cancelar transferencia | ✅ |
| GET | `/api/transactions/history` | Historial completo | ✅ |
| GET | `/api/transactions/{id}` | Ver transacción | ✅ |

### 👥 Usuarios (5 endpoints)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/users/profile` | Ver mi perfil | ✅ |
| PUT | `/api/users/profile` | Editar perfil | ✅ |
| GET | `/api/users/validate/{username}` | Validar destinatario | ✅ |
| GET | `/api/users/{username}` | Ver usuario público | ✅ |
| GET | `/api/users` | Listar usuarios | ✅ |

### 🧪 Test (1 endpoint)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/protected` | Test protegido | ✅ |

---

## 📮 Postman Collection

**Importa la colección completa de Postman:**

1. Abrir Postman
2. Click en "Import"
3. Seleccionar el archivo: `FlashyBank-API-Postman-Collection.json`
4. Todos los endpoints estarán disponibles con:
   - ✅ Variables configuradas (baseUrl, tokens)
   - ✅ Tests automáticos para guardar tokens
   - ✅ Ejemplos de request/response
   - ✅ Scripts para automatización

---

## 📡 API Documentation

**Documentación completa de la API:** [`API_DOCUMENTATION.md`](API_DOCUMENTATION.md)

Incluye:
- 📖 Descripción detallada de cada endpoint
- 🔑 Ejemplos de requests y responses
- ❌ Códigos de error y manejo
- 📊 Modelos de datos (TypeScript)
- 🔒 Reglas de seguridad
- 💡 Ejemplos de uso en JavaScript

---

## 📁 Estructura del Proyecto

```
flashyBank/
├── src/main/java/com/flashybank/
│   ├── config/                    # Configuración Spring Security
│   │   └── SecurityConfig.java
│   ├── controller/                # REST Controllers
│   │   ├── AuthController.java    # Login, register, logout
│   │   ├── TransactionController.java # Transferencias
│   │   ├── UserController.java    # Gestión de usuarios
│   │   └── TestController.java    # Tests
│   ├── dto/                       # Data Transfer Objects
│   │   ├── Auth DTOs              # Login, register, refresh
│   │   ├── Transaction DTOs       # Initiate, confirm, history
│   │   └── User DTOs              # Profile, update, validate
│   ├── exception/                 # Excepciones personalizadas
│   │   └── GlobalExceptionHandler # Manejo centralizado
│   ├── filter/                    # JWT Filter
│   │   └── JwtAuthenticationFilter.java # Verifica JWT + blacklist
│   ├── model/                     # JPA Entities
│   │   ├── User.java              # Usuario
│   │   ├── Transaction.java       # Transferencia
│   │   └── TokenBlacklist.java    # Tokens revocados
│   ├── repository/                # JPA Repositories
│   │   ├── UserRepository.java
│   │   ├── TransactionRepository.java
│   │   └── TokenBlacklistRepository.java
│   ├── service/                   # Business Logic
│   │   ├── AuthService.java       # Login, register, logout
│   │   ├── TransactionService.java # Lógica de transferencias
│   │   └── UserDetailsServiceImpl.java
│   ├── util/
│   │   └── JwtUtil.java           # Generación/validación JWT
│   └── FlashyBankApplication.java
├── src/main/resources/
│   └── application.yaml           # Configuración
├── API_DOCUMENTATION.md           # 📖 Documentación completa de API
├── FlashyBank-API-Postman-Collection.json # 📮 Colección Postman
├── README.md                      # Este archivo
└── build.gradle                   # Dependencias
```

---

## 🔐 Características de Seguridad

- ✅ **JWT Tokens** - Access (7 días) + Refresh (14 días)
- ✅ **Token Blacklist** - Logout proper con invalidación
- ✅ **BCrypt** - Encriptación de passwords
- ✅ **JWT Filter** - Validación en cada request + blacklist check
- ✅ **Stateless** - Sin sesiones HTTP
- ✅ **CORS** - Configurado para desarrollo
- ✅ **Validación** - Jakarta Validation en DTOs
- ✅ **Global Exception Handler** - Manejo centralizado de errores

---

## 🎯 Roadmap

### ✅ Paso 1: Configuración Base (Completado)
- [x] Spring Boot 3.5.10
- [x] Java 21
- [x] PostgreSQL
- [x] Entidades User y Transaction

### ✅ Paso 2: JWT Authentication (Completado)
- [x] JwtUtil para generar/validar tokens
- [x] JwtAuthenticationFilter con blacklist
- [x] SecurityConfig
- [x] AuthController (login, register, refresh, logout)

### ✅ Paso 3: Transfer Service (Completado)
- [x] TransactionService
- [x] Iniciar transferencia (PENDING)
- [x] Confirmar transferencia (COMPLETED)
- [x] Cancelar transferencia (CANCELLED)
- [x] Validación de saldo
- [x] Actualización de balances

### ✅ Paso 3.5: Backend Completo (Completado)
- [x] UserController (5 endpoints)
- [x] Token blacklist system
- [x] Validación de usuarios
- [x] Búsqueda y paginación
- [x] Global exception handler
- [x] Documentación completa de API
- [x] Postman collection

### ⏭️ Paso 4: React Native App (Siguiente)
- [ ] Configuración proyecto React Native (Expo o CLI)
- [ ] Pantalla Splash/Logo
- [ ] Pantalla Login
- [ ] Pantalla Register
- [ ] Pantalla Home (saldo principal)
- [ ] Pantalla Transfer (iniciar transferencia)
- [ ] Pantalla Confirm (biometría TouchID/FaceID)
- [ ] Pantalla History (historial)
- [ ] Pantalla Profile (editar perfil)
- [ ] Navegación (React Navigation)
- [ ] Almacenamiento seguro de JWT (AsyncStorage + SecureStore)
- [ ] Integración biometría (expo-local-authentication)
- [ ] Estado global (Context API o Redux)
- [ ] UI basada en Figma
- [ ] Conexión con backend API

### 🔮 Paso 5: Testing & Deploy
- [ ] Tests unitarios
- [ ] Tests de integración
- [ ] Tests E2E en React Native
- [ ] Dockerización backend
- [ ] Deploy backend en nube
- [ ] Deploy app en stores (iOS/Android)

---

## 📚 Documentación Completa

- **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)** 📖 - Documentación completa de API (17 endpoints)
- **[FlashyBank-API-Postman-Collection.json](FlashyBank-API-Postman-Collection.json)** 📮 - Colección importable para Postman
- **[JWT_SETUP.md](JWT_SETUP.md)** - Guía completa de implementación JWT
- **[API_ENDPOINTS.md](API_ENDPOINTS.md)** - Referencia detallada de endpoints
- **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - Resumen visual del proyecto
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Diagramas de arquitectura
- **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - Comandos y troubleshooting
- **[INTELLIJ_GUIDE.md](INTELLIJ_GUIDE.md)** - Guía para IntelliJ IDEA
- **[COMO_EJECUTAR.md](COMO_EJECUTAR.md)** - Pasos para ejecutar

---

## 🛠️ Tecnologías

- **Java 21** - Lenguaje principal
- **Spring Boot 3.5.10** - Framework
- **Spring Security** - Seguridad y autenticación
- **Spring Data JPA** - ORM y base de datos
- **PostgreSQL** - Base de datos relacional
- **JJWT** - Librería JWT
- **Lombok** - Reducción de código boilerplate
- **Gradle** - Herramienta de build
- **Expo / React Native** - (Próximo) Framework móvil

---

## 🎨 Para React Native

El backend está **100% completo y listo para integrarse** con React Native.

### Credenciales de Prueba
```
Usuario: testuser
Password: password123
Saldo inicial: $1000.00
```

### Base URL
```
Desarrollo: http://localhost:8080
Producción: https://api.flashybank.com (pendiente)
```

### Token JWT
```
Access Token: 7 días de validez
Refresh Token: 14 días de validez
```

### Archivos para el Frontend
1. **API_DOCUMENTATION.md** - Documentación completa para el equipo frontend
2. **FlashyBank-API-Postman-Collection.json** - Importar en Postman para testing

---

## 📝 Notas de Desarrollo

### Configuración JWT

```yaml
jwt:
  secret: claveSuperSecretaParaFirmarTokensConAlMenos256BitsParaHSASeguro
  expiration: 604800000 # 7 días en milisegundos
  refresh-expiration: 1209600000 # 14 días en milisegundos
```

### Configuración Base de Datos

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/flashybank
    username: postgres
    password: root
```

---

## 🔗 Recursos

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Spring Security Reference](https://docs.spring.io/spring-security/reference/)
- [JJWT Library](https://github.com/jwtk/jjwt)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [React Native Documentation](https://reactnative.dev/)
- [Expo Documentation](https://docs.expo.dev/)

---

## 📄 Licencia

Este proyecto es un MVP educativo para FlashyBank.

---

<div align="center">

**Backend 100% Completado ✅ | Listo para React Native 📱**

[⬆ Volver al inicio](#-flashybank--mvp-backend-con-spring-boot)

**Hecho con ❤️ para FlashyBank**

</div>
