# 🎯 Guía para IntelliJ IDEA - FlashyBank Paso 2

## 📋 Paso 1: Abrir el Proyecto en IntelliJ

### 1. Abrir el proyecto
```
1. Abre IntelliJ IDEA
2. Click en "Open" (o File → Open)
3. Navega a: /Users/macbook/Documents/05_Proyectos/FlashyBank/flashyBank
4. Selecciona la carpeta "flashyBank"
5. Click en "Open"
```

### 2. Esperar la indexación
- IntelliJ detectará automáticamente que es un proyecto Gradle
- Espera a que termine de indexar y descargar dependencias
- Verás el icono de Gradle en la parte inferior derecha

---

## 🗄️ Paso 2: Configurar PostgreSQL

### Opción A: Usar Terminal de IntelliJ

1. **Abrir Terminal en IntelliJ**:
   - View → Tool Windows → Terminal
   - O presiona: `⌥F3` (Option + F3)

2. **Verificar PostgreSQL**:
   ```bash
   pg_isready
   ```
   Si responde "localhost:5432 - accepting connections", ✅ está corriendo

3. **Si PostgreSQL NO está corriendo**:
   ```bash
   brew services start postgresql
   ```

4. **Crear la base de datos**:
   ```bash
   createdb flashybank
   ```

5. **Verificar que se creó**:
   ```bash
   psql -U postgres -l | grep flashybank
   ```

### Opción B: Usar Database Tool de IntelliJ

1. **Abrir Database Tool**:
   - View → Tool Windows → Database
   - O presiona: `⌘⇧E` (Cmd + Shift + E)

2. **Agregar conexión PostgreSQL**:
   - Click en el icono "+" (DataSource)
   - Selecciona "PostgreSQL"

3. **Configurar conexión**:
   ```
   Host: localhost
   Port: 5432
   Database: postgres
   User: postgres
   Password: root (o tu contraseña)
   ```

4. **Probar conexión**:
   - Click en "Test Connection"
   - Si es exitosa, click en "OK"

5. **Crear base de datos**:
   - En la consola de SQL (Query Console), ejecuta:
   ```sql
   CREATE DATABASE flashybank;
   ```
   - O ejecuta: `⌘⏎` (Cmd + Enter)

---

## 🏃 Paso 3: Ejecutar la Aplicación

### Método 1: Ejecutar desde Gradle

1. **Abrir Gradle Tool Window**:
   - View → Tool Windows → Gradle
   - O presiona: `⌘⇧G` (Cmd + Shift + G)

2. **Navegar a Tasks**:
   ```
   flashybank → Tasks → application
   ```

3. **Ejecutar bootRun**:
   - Click derecho en `bootRun`
   - Selecciona "Run 'flashybank [bootRun]'"

### Método 2: Crear Run Configuration (RECOMENDADO)

1. **Crear configuración**:
   - Run → Edit Configurations...
   - Click en "+" (Add Configuration)
   - Selecciona "Spring Boot"

2. **Configurar**:
   ```
   Name: FlashyBankApp
   Main class: com.flashybank.FlashyBankApplication
   Use classpath of module: flashybank.main
   VM options: (opcional) -Dspring.profiles.active=dev
   ```

3. **Guardar y ejecutar**:
   - Click en "Apply"
   - Click en "OK"
   - Ahora puedes ejecutar con: `⌃R` (Ctrl + R) o click en el botón ▶️ verde

### Método 3: Ejecutar directamente desde la clase principal

1. **Navegar a la clase principal**:
   ```
   src/main/java/com/flashybank/FlashyBankApplication.java
   ```

2. **Ejecutar**:
   - Click en el icono verde ▶️ junto a `public static void main`
   - O click derecho en el archivo → "Run 'FlashyBankApplication'"

---

## ✅ Paso 4: Verificar que la App Está Corriendo

Cuando la aplicación inicie correctamente, verás en la consola:

```
  .   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
( ( )\___ | '_ | '_| | '_ \/ _` | \ \ \ \
 \\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_\__, | / / / /
 =========|_|==============|___/=/_/_/_/
 :: Spring Boot ::                (v3.5.10)

...

Started FlashyBankApplication in X.XXX seconds
```

Y verás:
- ✅ El puerto 8080 está activo
- ✅ "Tomcat started on port(s): 8080"
- ✅ "Started FlashyBankApplication"

---

## 🧪 Paso 5: Probar la API desde IntelliJ

### Opción A: Usar HTTP Client (Nativo en IntelliJ)

1. **Crear archivo HTTP Request**:
   - Click derecho en el proyecto
   - New → File
   - Nombre: `test-api.http`

2. **Agregar requests**:
   ```http
   ### 1. Test público
   GET http://localhost:8080/api/hello

   ### 2. Registrar usuario
   POST http://localhost:8080/api/auth/register
   Content-Type: application/json

   {
     "username": "juan",
     "password": "password123"
   }

   ### 3. Login
   POST http://localhost:8080/api/auth/login
   Content-Type: application/json

   {
     "username": "juan",
     "password": "password123"
   }

   ### 4. Endpoint protegido (reemplazar TOKEN con el access_token)
   GET http://localhost:8080/api/protected
   Authorization: Bearer TOKEN

   ### 5. Refresh token
   POST http://localhost:8080/api/auth/refresh
   Content-Type: application/json

   {
     "refreshToken": "REFRESH_TOKEN"
   }
   ```

3. **Ejecutar requests**:
   - Click en el icono ▶️ verde junto a cada request
   - O presiona: `⌃⏎` (Ctrl + Enter) con el cursor en el request

### Opción B: Usar Terminal

1. **Abrir Terminal**: `⌥F3` (Option + F3)

2. **Probar endpoints**:
   ```bash
   # Endpoint público
   curl http://localhost:8080/api/hello

   # Registrar usuario
   curl -X POST http://localhost:8080/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"username": "juan", "password": "password123"}'

   # Login
   curl -X POST http://localhost:8080/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username": "juan", "password": "password123"}'
   ```

---

## 🔧 Paso 6: Configuración de Database en IntelliJ

### Habilitar Database Tool

1. **Abrir Database panel**:
   - View → Tool Windows → Database
   - `⌘⇧E` (Cmd + Shift + E)

2. **Agregar conexión a flashybank**:
   - Click en "+" → "PostgreSQL"
   - Configurar:
     ```
     Database: flashybank
     Host: localhost
     Port: 5432
     User: postgres
     Password: root
     ```
   - Click en "Test Connection"
   - Click en "OK"

3. **Ver tablas**:
   - Expande la conexión "flashybank"
   - Expande "schemas" → "public" → "tables"
   - Verás las tablas: `users` y `transactions`

4. **Explorar datos**:
   - Click derecho en tabla `users`
   - Selecciona "Select Top 1000"
   - Verás los datos de la tabla

---

## 🎨 Paso 7: Personalizar IntelliJ para el Proyecto

### Habilitar auto-compile
1. Preferences → Build, Execution, Deployment → Compiler
2. ✅ Check "Build project automatically"
3. ✅ Check "Compile independent modules in parallel"

### Configurar save actions
1. Preferences → Editor → General → On Save
2. ✅ Check "Reformat code"
3. ✅ Check "Optimize imports"

### Habilitar annotations
1. Preferences → Build, Execution, Deployment → Compiler → Annotation Processors
2. ✅ Check "Enable annotation processing"

---

## 🐛 Paso 8: Debugging

### Ejecutar en modo Debug

1. **Usar Debug configuration**:
   - Click en el icono 🐛 (bug) verde
   - O presiona: `⌃D` (Ctrl + D)

2. **Agregar breakpoints**:
   - Click en el margen izquierdo junto a la línea de código
   - Aparecerá un punto rojo 🔴

3. **Inspeccionar variables**:
   - Cuando se detenga en un breakpoint
   - Pasa el mouse sobre variables para ver sus valores
   - Usa Variables panel (View → Tool Windows → Variables)

4. **Controlar ejecución**:
   - F8: Step Over (siguiente línea)
   - F7: Step Into (entrar en método)
   - ⌘⇧R: Resume (continuar ejecución)

---

## 📦 Estructura del Proyecto en IntelliJ

```
flashybank (Project Root)
├── .gradle                   [Gradle files - oculto]
├── .idea                     [IntelliJ config - oculto]
├── build                     [Build output]
├── src
│   ├── main
│   │   ├── java/com/flashybank
│   │   │   ├── config/       [SecurityConfig.java]
│   │   │   ├── controller/   [AuthController, TestController]
│   │   │   ├── dto/          [LoginRequest, LoginResponse, etc]
│   │   │   ├── filter/       [JwtAuthenticationFilter]
│   │   │   ├── model/        [User, Transaction]
│   │   │   ├── repository/   [UserRepository, TransactionRepository]
│   │   │   ├── service/      [AuthService, UserDetailsServiceImpl]
│   │   │   ├── util/         [JwtUtil]
│   │   │   └── FlashyBankApplication.java
│   │   └── resources
│   │       └── application.yaml
│   └── test
│       └── java/com/flashybank
│           └── repository/   [UserRepositoryTest]
├── build.gradle              [Dependencias]
└── README.md
```

---

## ⌨️ Atajos de Teclado Útiles (macOS)

| Acción | Atajo |
|--------|-------|
| Run | `⌃R` (Ctrl + R) |
| Debug | `⌃D` (Ctrl + D) |
| Stop | `⌘F2` (Cmd + F2) |
| Terminal | `⌥F3` (Option + F3) |
| Database | `⌘⇧E` (Cmd + Shift + E) |
| Gradle | `⌘⇧G` (Cmd + Shift + G) |
| Project view | `⌘1` (Cmd + 1) |
| Find action | `⇧⌘A` (Shift + Cmd + A) |
| System.out.println | `sout` + Tab |
| Public static void main | `psvm` + Tab |
| Reformat code | `⌘⌥L` (Cmd + Option + L) |

---

## 🎯 Checklist para Empezar

```
✅ Abrir proyecto en IntelliJ
✅ Esperar indexación de Gradle
✅ Crear base de datos flashybank
✅ Abrir Database Tool y conectar
✅ Ejecutar aplicación (bootRun)
✅ Verificar "Started FlashyBankApplication"
✅ Probar endpoint público con curl o HTTP Client
✅ Probar registro de usuario
✅ Probar login
✅ Probar endpoint protegido
```

---

## 🔥 Consejos Pro

1. **Usar Live Templates**:
   - Escribe `psvm` + Tab para generar `public static void main`
   - Escribe `sout` + Tab para `System.out.println`

2. **Ver estructura de archivo**:
   - Presiona: `⌘F12` (Cmd + F12)
   - Muestra todos los métodos del archivo actual

3. **Ir a definición**:
   - Presiona: `⌘B` (Cmd + B) sobre una clase/método
   - O `⌘ + Click` sobre el elemento

4. **Buscar archivos**:
   - Presiona: `⇧⌘⇧O` (Shift + Cmd + Shift + O)
   - Escribe el nombre del archivo

5. **Ver historial de git**:
   - Presiona: `⌘0` (Cmd + 0) para abrir Git panel
   - `⌘K` para commit

6. **Ejecutar tests específicos**:
   - Click derecho en método de test → "Run"
   - Click derecho en clase → "Run 'ClassName'"

---

## 📚 Recursos en IntelliJ

- **Gradle Tasks**: View → Tool Windows → Gradle
- **Database**: View → Tool Windows → Database
- **Terminal**: View → Tool Windows → Terminal
- **HTTP Client**: Tools → HTTP Client → Test RESTful Web Service

---

## 🚀 Quick Start (Resumen Rápido)

```bash
# 1. Abrir terminal en IntelliJ (⌥F3)

# 2. Crear base de datos
createdb flashybank

# 3. Ejecutar aplicación
# - Ir a: Run → Edit Configurations
# - Crear configuración Spring Boot
# - Ejecutar con ▶️

# 4. Probar API
# - Crear archivo test-api.http
# - Ejecutar requests con ▶️
```

¡Listo! 🎉

---

## ¿Problemas Comunes?

### Error: "Database flashybank does not exist"
```bash
# En terminal de IntelliJ
createdb flashybank
```

### Error: "Port 8080 already in use"
```bash
# En terminal
lsof -i :8080
kill -9 <PID>
```

### No veo las tablas en Database Tool
- Haz click derecho en la conexión
- Selecciona "Synchronize"
- O cierra y abre la conexión

---

**¡Disfruta programando en IntelliJ IDEA!** 🚀
