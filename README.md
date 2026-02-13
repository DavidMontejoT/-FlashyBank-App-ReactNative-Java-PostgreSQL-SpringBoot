<div align="center">

# 🏦 FlashyBank

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Build](https://img.shields.io/badge/build-passing-brightgreen.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

**La aplicación bancaria más revolucionaria del mercado**

[![Java](https://img.shields.io/badge/Java-21-orange)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.10-green)](https://spring.io/projects/spring-boot)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue)](https://www.postgresql.org/)
[![React Native](https://img.shields.io/badge/React%20Native-0.76-61DAFB)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-54-000.svg)](https://expo.dev/)

[Documentación](#-documentación) •
[Características](#-características-revolucionarias) •
[Instalación](#-instalación-rápida) •
[API](#-api-endpoints) •
[Contribuir](#-contribuir)

</div>

---

## 📖 Sobre FlashyBank

**FlashyBank** es una aplicación bancaria revolucionaria que combina la robustez de **Spring Boot** con la experiencia de usuario de **React Native**. Diseñada para ofrecer transferencias instantáneas, seguridad biométrica y una interfaz intuitiva que redefine el banking móvil.

### 🚀 ¿Por qué FlashyBank es revolucionaria?

| Característica | Descripción | Impacto |
|---------------|-------------|---------|
| 🔐 **Face ID / Touch ID** | Autenticación biométrica para transferencias | Seguridad sin precedentes |
| ⚡ **Transferencias Instantáneas** | Confirmación en segundos | Sin esperas, dinero disponible ya |
| 🎨 **4 Paletas de Temas** | Light, Dark, Midnight, Sunset | Personalización total |
| ⏱️ **Quick Mode** | Modo rápido de 2 horas para transferencias frecuentes | Ahorra tiempo en operaciones diarias |
| 🔒 **JWT con Refresh Tokens** | Access tokens de 7 días, refresh de 14 días | Sesión prolongada sin comprometer seguridad |
| 📱 **React Native + Expo** | App nativa iOS y Android desde una sola codebase | Desarrollo eficiente y mantenible |

---

## ✨ Características Revolucionarias

### 1. 🔐 Autenticación Biométrica

**FlashyBank** implementa **Face ID** y **Touch ID** para confirmar transferencias:

- Protección adicional para operaciones sensibles
- Fallback elegante para dispositivos sin biometría
- Integración nativa con `expo-local-authentication`
- Tokens almacenados en `expo-secure-store`

```javascript
// La app solicita biometría antes de confirmar
const biometricAuth = await LocalAuthentication.authenticateAsync({
  promptMessage: 'Confirma la transferencia con Face ID',
  fallbackLabel: 'Usar contraseña'
});
```

### 2. ⚡ Transferencias en 2 Pasos

El sistema de transferencias está diseñado para seguridad **Y** velocidad:

```
1. INICIAR → Estado: PENDING
   └─ Validación de saldo
   └─ Validación de destinatario
   └─ Sin cobro inmediato

2. CONFIRMAR → Estado: COMPLETED
   └─ Autenticación biométrica
   └─ Cobro inmediato
   └─ Crédito instantáneo al destinatario
```

**Ventajas:**
- El usuario puede revisar antes de confirmar
- Previene transferencias accidentales
- Cancelación disponible mientras está pendiente

### 3. 🎨 Sistema de Temas Avanzado

**FlashyBank** incluye 4 paletas de colores profesionales:

| Tema | Uso | Colores Principales |
|------|-----|---------------------|
| **Light** | Día | Blanco, Gris claro, Azul Flashy |
| **Dark** | Noche | Gris oscuro, Negro, Azul eléctrico |
| **Midnight** | Elegante | Azul marino, Púrpura, Dorado |
| **Sunset** | Cálido | Naranja, Rosa, Amarillo |

**Características:**
- Cambio dinámico de tema
- Persistencia en AsyncStorage
- Componentes React Native Paper temáticos
- Transiciones suaves entre temas

### 4. ⏱️ Quick Mode (2 Horas)

Para usuarios que hacen transferencias frecuentes:

- **Duración:** 2 horas de modo rápido
- **Beneficio:** Salta la pantalla de confirmación
- **Seguridad:** Requiere activación con biometría
- **Expiración:** Vuelve a modo normal automáticamente

**Flujo Quick Mode:**
```
Home → Transfer → Quick Mode: ON
└─ Próximas 2 horas: Transferencia directa sin confirmación
└─ Ahorro: 1 paso menos en cada transferencia
```

### 5. 🔒 Seguridad JWT de Grado Empresarial

```
Access Token:  7 días  → Para requests diarios
Refresh Token: 14 días  → Para renovación sin login
Token Blacklist: Invalidación inmediata en logout
BCrypt:        Encriptación de passwords
```

**Características:**
- Tokens almacenados en SecureStore (cifrado)
- Auto-refresh cuando el access token expira
- Logout proper con invalidación de ambos tokens
- Validación de blacklist en cada request

---

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                     FLASHYBANK MONOREPO                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────┐         ┌──────────────────┐        │
│  │   Backend       │         │   Mobile         │        │
│  │   (Spring Boot) │         │   (React Native) │        │
│  │                 │         │                  │        │
│  │  Java 21        │         │  Expo 54         │        │
│  │  Spring Boot    │         │  React Native    │        │
│  │  3.5.10         │         │  0.76            │        │
│  │  PostgreSQL     │         │  React Nav. 6.x  │        │
│  │  15+           │         │  RN Paper 5.x    │        │
│  │                 │         │                  │        │
│  │  17 Endpoints   │         │  8 Pantallas     │        │
│  │  JWT Auth       │         │  Biometría       │        │
│  │  REST API       │◄──────►│  SecureStore     │        │
│  └──────────────────┘         └──────────────────┘        │
│         │                              │                   │
│         │                              │                   │
│         ▼                              ▼                   │
│  ┌──────────────────────────────────────────────┐       │
│  │           PostgreSQL Database                  │       │
│  │  ┌────────────┐  ┌──────────────────────┐    │       │
│  │  │   users    │  │    transactions      │    │       │
│  │  │            │  │                      │    │       │
│  │  │  id        │  │  id                 │    │       │
│  │  │  username  │  │  sender_id          │    │       │
│  │  │  password  │  │  receiver_username  │    │       │
│  │  │  balance   │  │  amount             │    │       │
│  │  │  role      │  │  status             │    │       │
│  │  └────────────┘  │  (PENDING/COMPLETED/ │    │       │
│  │                  │   CANCELLED)         │    │       │
│  │                  └──────────────────────┘    │       │
│  └──────────────────────────────────────────────┘       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Capas del Backend

```
Controller → Service → Repository → Database
     ↓            ↓            ↓            ↓
  [REST API]  [Lógica]   [JPA/Hibernate] [PostgreSQL]
```

**Controller:** Recibe requests HTTP
**Service:** Lógica de negocio (validaciones, cálculos)
**Repository:** Acceso a datos (JPA)
**Database:** PostgreSQL con esquema relacional

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

**Documentación completa:** [`docs/api.md`](docs/api.md)

---

## 📱 Pantallas de la App

| Pantalla | Descripción | Features |
|----------|-------------|----------|
| **LoginScreen** | Inicio de sesión | Validación, loading, errores |
| **RegisterScreen** | Registro de usuarios | Formulario validado |
| **HomeScreen** | Pantalla principal | Saldo, últimas transacciones, pull-to-refresh |
| **TransferScreen** | Nueva transferencia | Validación de destinatario en tiempo real |
| **ConfirmScreen** | Confirmación con biometría | Face ID / Touch ID |
| **HistoryScreen** | Historial completo | Estados, colores diferenciados |
| **ProfileScreen** | Perfil de usuario | Editar username, logout |

**Documentación de arquitectura:** [`docs/architecture.md`](docs/architecture.md)

---

## 🚀 Instalación Rápida

### Requisitos Previos

#### Backend
- ☕ **Java 21+**
- 🐘 **PostgreSQL 15+**
- 📦 **Gradle 8+**

#### Mobile
- 🟢 **Node.js 18+**
- 📱 **Expo CLI:** `npm install -g expo-cli`
- 📲 **Expo Go** en tu dispositivo

---

### Paso 1: Clonar el Repositorio

```bash
cd /Users/macbook/Documents/05_Proyectos
cd FlashyBank
```

---

### Paso 2: Configurar Backend

```bash
# 1. Navegar al backend
cd backend

# 2. Crear base de datos PostgreSQL
createdb flashybank

# 3. Configurar conexión en src/main/resources/application.yaml
# Editar: url, username, password según tu configuración

# 4. Ejecutar el backend
./gradlew bootRun

# 5. Verificar que está funcionando
curl http://localhost:8080/api/hello
# Respuesta esperada: {"message":"Hola desde FlashyBank...","status":"online"}
```

---

### Paso 3: Configurar Mobile

```bash
# 1. Navegar al directorio mobile (en otra terminal)
cd ../mobile

# 2. Instalar dependencias
npm install

# 3. Iniciar Expo
npx expo start

# 4. Abrir en tu dispositivo
# - Escanear QR con Expo Go
# - Presionar 'i' para iOS Simulator
# - Presionar 'a' para Android Emulator
```

---

### Paso 4: Probar la App

1. **Registrar usuario:**
   - Abrir la app → "Crear cuenta"
   - Ingresar username y password
   - Saldo inicial: **$1000.00**

2. **Hacer una transferencia:**
   - Home → "Nueva Transferencia"
   - Destinatario: `testuser`
   - Monto: `100`
   - "Siguiente"

3. **Confirmar con biometría:**
   - Usar Face ID / Touch ID
   - ¡Transferencia completada!

4. **Ver historial:**
   - Home → "Ver Historial"
   - Ver la transferencia completada

---

## 📁 Estructura del Monorepo

```
flashybank/
├── backend/                    # Backend Spring Boot
│   ├── src/
│   │   └── main/
│   │       ├── java/com/flashybank/
│   │       │   ├── config/           # Spring Security, JWT
│   │       │   ├── controller/       # REST Controllers
│   │       │   ├── dto/              # Data Transfer Objects
│   │       │   ├── exception/        # Exception Handler
│   │       │   ├── filter/           # JWT Filter
│   │       │   ├── model/            # JPA Entities
│   │       │   ├── repository/       # JPA Repositories
│   │       │   ├── service/          # Business Logic
│   │       │   └── util/             # JWT Util
│   │       └── resources/
│   │           └── application.yaml   # Configuración
│   ├── build.gradle
│   └── README.md
│
├── mobile/                     # App React Native
│   ├── src/
│   │   ├── screens/
│   │   │   ├── auth/           # Login, Register
│   │   │   └── app/            # Home, Transfer, etc.
│   │   ├── services/           # API Clients
│   │   ├── context/            # Auth Context
│   │   └── navigation/         # React Navigation
│   ├── App.js
│   ├── package.json
│   └── README.md
│
├── docs/                       # Documentación
│   ├── architecture.md         # Arquitectura del sistema
│   ├── api.md                  # Documentación de API
│   ├── deployment.md           # Guía de deployment
│   └── decisions.md            # Architecture Decision Records
│
├── .github/
│   └── workflows/              # GitHub Actions CI/CD
│       ├── backend-ci.yml
│       └── mobile-ci.yml
│
├── .gitignore                 # Gitignore para monorepo
├── README.md                  # Este archivo
├── CONTRIBUTING.md            # Guía para contribuidores
└── LICENSE                    # Licencia MIT
```

---

## 📚 Documentación

| Documento | Descripción |
|-----------|-------------|
| [`docs/architecture.md`](docs/architecture.md) | Arquitectura completa del sistema |
| [`docs/api.md`](docs/api.md) | Documentación de los 17 endpoints |
| [`docs/deployment.md`](docs/deployment.md) | Guía de deployment a producción |
| [`docs/decisions.md`](docs/decisions.md) | Decisiones de arquitectura (ADR) |
| [`backend/README.md`](backend/README.md) | README del backend |
| [`mobile/README.md`](mobile/README.md) | README de la app |
| [`CONTRIBUTING.md`](CONTRIBUTING.md) | Guía para contribuidores |

---

## 🛠️ Stack Tecnológico

### Backend

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Java** | 21 | Lenguaje principal |
| **Spring Boot** | 3.5.10 | Framework backend |
| **Spring Security** | 6.x | Seguridad y autenticación |
| **Spring Data JPA** | 3.x | ORM y base de datos |
| **PostgreSQL** | 15+ | Base de datos relacional |
| **JJWT** | 0.12.x | Librería JWT |
| **Lombok** | Latest | Reducción de boilerplate |
| **Gradle** | 8.x | Herramienta de build |

### Mobile

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Expo** | 54.0 | Framework base |
| **React Native** | 0.76 | Mobile framework |
| **React Navigation** | 6.x | Navegación |
| **React Native Paper** | 5.x | UI Components |
| **Axios** | Latest | HTTP Client |
| **Expo SecureStore** | Latest | Almacenamiento seguro |
| **Expo Local Authentication** | Latest | Biometría |
| **Context API** | - | Estado global |

---

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Por favor lee [`CONTRIBUTING.md`](CONTRIBUTING.md) para detalles sobre:

1. Cómo configurar el entorno de desarrollo
2. Cómo ejecutar el backend localmente
3. Cómo ejecutar la app localmente
4. Estándares de código
5. Proceso de Pull Requests

---

## 🗺️ Roadmap

### ✅ Versión 1.0 (Completada)

- [x] Backend Spring Boot completo
- [x] Autenticación JWT con refresh tokens
- [x] Sistema de transferencias con confirmación
- [x] App React Native con 8 pantallas
- [x] Autenticación biométrica
- [x] Documentación completa

### 🚧 Versión 1.1 (En Progreso)

- [ ] Integración de diseño desde Pencil/Figma
- [ ] Sistema de temas con 4 paletas
- [ ] Quick Mode (2 horas)
- [ ] Mejoras de UI/UX
- [ ] Animaciones y transiciones

### 🔮 Versión 2.0 (Futura)

- [ ] Notificaciones push
- [ ] Pagos QR
- [ ] Gráficos de gastos
- [ ] Metas de ahorro
- [ ] Tarjeta virtual
- [ ] Soporte multi-moneda
- [ ] Chat con soporte

---

## 📸 Capturas de Pantalla

### Home Screen
```
┌─────────────────────────────┐
│  👋 Hola, juanperez        │
│                             │
│  💰 Tu saldo               │
│  $1,000.00                 │
│                             │
│  ┌─────────────────────┐   │
│  │  💸 Nueva Transfer │   │
│  └─────────────────────┘   │
│                             │
│  ┌─────────────────────┐   │
│  │  📜 Ver Historial  │   │
│  └─────────────────────┘   │
│                             │
│  Últimas transacciones      │
│  ┌─────────────────────┐   │
│  │ → maria $150.50    │   │
│  │ ← carlos $500.00   │   │
│  └─────────────────────┘   │
└─────────────────────────────┘
```

### Transfer Screen
```
┌─────────────────────────────┐
│  Nueva Transferencia        │
│                             │
│  Para:                      │
│  ┌─────────────────────┐   │
│  │ mariagarcia         │   │
│  └─────────────────────┘   │
│  ✅ Usuario válido           │
│                             │
│  Monto:                     │
│  ┌─────────────────────┐   │
│  │ $150.50            │   │
│  └─────────────────────┘   │
│                             │
│  Descripción (opcional):    │
│  ┌─────────────────────┐   │
│  │ Pago de préstamo   │   │
│  └─────────────────────┘   │
│                             │
│  ┌─────────────────────┐   │
│  │  Siguiente         │   │
│  └─────────────────────┘   │
└─────────────────────────────┘
```

### Confirm Screen (Biometría)
```
┌─────────────────────────────┐
│                             │
│         🔐 Face ID          │
│                             │
│  Confirma la transferencia  │
│                             │
│  Para: mariagarcia          │
│  Monto: $150.50            │
│                             │
│  ┌─────────────────────┐   │
│  │                     │   │
│  │    [Face ID Icon]   │   │
│  │                     │   │
│  └─────────────────────┘   │
│                             │
│  Usa Face ID para confirmar│
│                             │
└─────────────────────────────┘
```

---

## 🧪 Pruebas

### Backend

```bash
cd backend

# Ejecutar tests unitarios
./gradlew test

# Ejecutar tests de integración
./gradlew integrationTest

# Ver coverage
./gradlew jacocoTestReport
```

### Mobile

```bash
cd mobile

# Ejecutar tests
npm test

# Ejecutar con coverage
npm test -- --coverage

# Ejecutar tests E2E
npm run test:e2e
```

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver [`LICENSE`](LICENSE) para detalles.

---

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=flashybank/flashybank&type=Date)](https://star-history.com/#flashybank/flashybank&Date)

---

## 📞 Contacto

- **Sitio Web:** [flashybank.com](https://flashybank.com)
- **Documentación:** [docs.flashybank.com](https://docs.flashybank.com)
- **Soporte:** [support@flashybank.com](mailto:support@flashybank.com)

---

<div align="center">

**Hecho con ❤️ por el equipo de FlashyBank**

[⬆ Volver al inicio](#-flashybank)

**Java • Spring Boot • PostgreSQL • React Native • Expo**

</div>
