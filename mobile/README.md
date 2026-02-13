# 📱 FlashyBank Mobile App

<div align="center">

![Expo](https://img.shields.io/badge/Expo-54-000000.svg?style=flat&logo=expo)
![React Native](https://img.shields.io/badge/React_Native-0.76-61DAFB.svg?style=flat&logo=react-native)
![React Navigation](https://img.shields.io/badge/React_Navigation-6.x-CC6699.svg?style=flat)
![React Native Paper](https://img.shields.io/badge/RN_Paper-5.x-4CAF50.svg?style=flat)

**App móvil bancaria con React Native y Expo**

[Estado del Proyecto](#-estado-del-proyecto) •
[Instalación](#-instalación) •
[Pantallas](#-pantallas) •
[Backend](#-backend)

</div>

---

## 📊 Estado del Proyecto

```
✅ Proyecto Expo creado
✅ Dependencias instaladas
✅ Servicios de backend configurados
✅ AuthContext con SecureStore
✅ Navegación completa
✅ Pantallas Login/Register
✅ Pantalla Home con saldo
✅ Pantalla de Transferencia
✅ Pantalla de Confirmación con Biometría
✅ Pantalla Historial
✅ Pantalla Perfil
⏭️ Integración con diseño Pencil/Figma (SIGUIENTE)
```

---

## 🚀 Instalación y Ejecución

### Requisitos Previos

- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- Expo Go App en tu dispositivo (descargar de App Store/Play Store)
- Backend de FlashyBank corriendo en `http://localhost:8080`

### Pasos para Ejecutar

```bash
# 1. Navegar al directorio
cd /Users/macbook/Documents/05_Proyectos/FlashyBank/FlashyBankMobile

# 2. Instalar dependencias (ya instaladas)
npm install

# 3. Iniciar el servidor de desarrollo
npx expo start

# 4. Escanear el código QR con Expo Go
# O presiona 'i' para abrir en iOS Simulator
# O presiona 'a' para abrir en Android Emulator
```

---

## 📱 Pantallas Implementadas

### 🔐 Pantallas de Autenticación

| Pantalla | Descripción |
|----------|-------------|
| **LoginScreen** | Login con username/password |
| **RegisterScreen** | Registro de nuevos usuarios |

**Características**:
- ✅ Validación de campos
- ✅ Mensajes de error
- ✅ Loading states
- ✅ Navegación entre login y registro

---

### 🏠 Pantallas Principales

| Pantalla | Descripción |
|----------|-------------|
| **HomeScreen** | Pantalla principal con saldo |
| **TransferScreen** | Iniciar nueva transferencia |
| **ConfirmScreen** | Confirmar con biometría |
| **HistoryScreen** | Historial de transacciones |
| **ProfileScreen** | Ver y editar perfil |

---

### 📊 Features por Pantalla

#### **HomeScreen**
- ✅ Mostrar saldo actual
- ✅ Botón "Nueva Transferencia"
- ✅ Botón "Ver Historial"
- ✅ Últimas 5 transacciones
- ✅ Pull-to-refresh
- ✅ Botón de logout
- ✅ Hola con nombre de usuario

#### **TransferScreen**
- ✅ Buscar usuario destinatario
- ✅ Validación en tiempo real
- ✅ Campo de monto
- ✅ Campo de descripción (opcional)
- ✅ Indicador de usuario válido

#### **ConfirmScreen**
- ✅ Resumen de transferencia
- ✅ Autenticación biométrica (TouchID/FaceID)
- ✅ Fallback si no hay biometría
- ✅ Loading durante confirmación

#### **HistoryScreen**
- ✅ Lista completa de transacciones
- ✅ Colores diferenciados (enviadas/recibidas)
- ✅ Estados (Completado/Pendiente/Cancelado)
- ✅ Pull-to-refresh
- ✅ Formato de fecha y hora

#### **ProfileScreen**
- ✅ Ver datos del usuario
- ✅ Editar username
- ✅ Ver saldo, rol, fechas
- ✅ Botón de logout

---

## 🔌 Conexión con Backend

### Configuración

La app se conecta al backend en `http://localhost:8080`

**Archivo**: `src/services/apiClient.js`

```javascript
const API_BASE_URL = 'http://localhost:8080';
```

### Endpoints Utilizados

```
AUTENTICACIÓN
├─ POST /api/auth/register
├─ POST /api/auth/login
└─ POST /api/auth/logout

TRANSACCIONES
├─ GET  /api/transactions/balance
├─ POST /api/transactions/initiate
├─ POST /api/transactions/confirm/{id}
└─ GET  /api/transactions/history

USUARIOS
├─ GET  /api/users/profile
├─ PUT  /api/users/profile
└─ GET  /api/users/validate/{username}
```

---

## 🔐 Seguridad

### ✅ Características Implementadas

- **SecureStore**: Tokens guardados de forma segura
- **JWT**: Access tokens (7 días) + Refresh tokens (14 días)
- **Auto-refresh**: Renovación automática de tokens expirados
- **Biometría**: TouchID/FaceID para confirmar transferencias
- **HTTPS**: Recomendado para producción

---

## 📁 Estructura del Proyecto

```
FlashyBankMobile/
├── App.js                          # Entry point
├── package.json                    # Dependencias
├── src/
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LoginScreen.js
│   │   │   └── RegisterScreen.js
│   │   └── app/
│   │       ├── HomeScreen.js
│   │       ├── TransferScreen.js
│   │       ├── ConfirmScreen.js
│   │       ├── HistoryScreen.js
│   │       └── ProfileScreen.js
│   ├── services/
│   │   ├── apiClient.js           # Axios configurado
│   │   ├── storageService.js      # SecureStore wrapper
│   │   ├── authService.js         # Login, register, logout
│   │   ├── transactionService.js  # Transferencias
│   │   └── userService.js         # Usuarios
│   ├── context/
│   │   └── AuthContext.js         # Estado global de auth
│   ├── navigation/
│   │   ├── AuthNavigator.js       # Login/Register
│   │   ├── AppNavigator.js        # Home, Transfer, etc.
│   │   └── RootNavigator.js       # Navegación condicional
│   └── components/                # (Pendiente)
└── app.json                       # Config Expo
```

---

## 🛠️ Tecnologías

| Tecnología | Versión | Uso |
|-------------|---------|-----|
| **Expo** | 54.0.0 | Framework base |
| **React Native** | 0.76 | Mobile framework |
| **React Navigation** | 6.x | Navegación |
| **React Native Paper** | 5.x | UI Components |
| **Axios** | Latest | HTTP Client |
| **Expo SecureStore** | Latest | Almacenamiento seguro |
| **Expo Local Authentication** | Latest | Biometría |
| **Context API** | - | Estado global |

---

## 🎨 Próximos Pasos (Integración con Pencil/Figma)

### Pendiente de Integrar

1. **Diseño Visual de Pencil**
   - [ ] Recibir código/screenshots de Pencil
   - [ ] Analizar componentes del diseño
   - [ ] Crear tema personalizado de React Native Paper
   - [ ] Integrar colores y tipografías

2. **Componentes Personalizados**
   - [ ] Logo de FlashyBank
   - [ } Fondo de pantalla
   - [ ] Colores personalizados
   - [ ] Tipografías custom
   - [ ] Animaciones y transiciones

3. **Mejoras de UI**
   - [ ] Bottom Navigation
   - [ ] Floating Action Button
   - [ ] Toast notifications custom
   - [ ] Pull-to-refresh mejorado
   - [ ] Shimmer loading effects

---

## 🧪 Pruebas

### Credenciales de Prueba

```
Backend: http://localhost:8080
Usuario: testuser
Password: password123
Saldo inicial: $1000.00
```

### Flujo de Prueba Completo

1. **Abrir la app** → Pantalla de Login
2. **Login** → Usar `testuser` / `password123`
3. **Home** → Ver saldo de $1000.00
4. **Nueva Transferencia** → Ingresar destinatario `juan`, monto `100`
5. **Confirmar** → Usar biometría
6. **Verificar** → Saldo actualizado a $899.50
7. **Historial** → Ver la transferencia completada
8. **Perfil** → Ver datos del usuario

---

## 📚 Documentación del Backend

- **[API_DOCUMENTATION.md](../flashyBank/API_DOCUMENTATION.md)** - Documentación completa
- **[FlashyBank-API-Postman-Collection.json](../flashyBank/FlashyBank-API-Postman-Collection.json)** - Colección Postman

---

## 🔧 Solución de Problemas

### Error: "Network request failed"

**Problema**: La app no puede conectar con el backend

**Solución**:
1. Verificar que el backend esté corriendo: `http://localhost:8080/api/hello`
2. En iOS Simulator, usar `http://127.0.0.1:8080` en lugar de `localhost`
3. En dispositivo físico, usar la IP de tu Mac: `http://192.168.x.x:8080`

### Error: "Biometrics not supported"

**Problema**: El dispositivo no soporta biometría

**Solución**: La app tiene fallback y continuará sin biometría

### Error: "Token expired"

**Problema**: Token JWT expiró

**Solución**: La app renueva automáticamente el token con refreshToken

---

## 🚀 Roadmap

```
✅ Fase 1: Configuración Base - COMPLETADO
✅ Fase 2: Autenticación - COMPLETADO
✅ Fase 3: Pantallas Core - COMPLETADO
✅ Fase 4: Biometría - COMPLETADO
⏭️  Fase 5: Integración Diseño Pencil - EN PROGRESO
🔮 Fase 6: Testing & Deploy
```

---

## 📄 Licencia

Este proyecto es parte de FlashyBank MVP.

---

<div align="center">

**FlashyBank Mobile 📱 | Backend 100% Completado ✅**

**Hecho con ❤️ para FlashyBank**

</div>
