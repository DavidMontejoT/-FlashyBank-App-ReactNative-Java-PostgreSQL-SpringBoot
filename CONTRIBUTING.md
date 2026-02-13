# 🤝 Guía para Contribuidores

**Proyecto:** FlashyBank
**Versión:** 1.0.0
**Última actualización:** 2025-02-12

---

## 📋 Tabla de Contenidos

- [Cómo Contribuir](#cómo-contribuir)
- [Configuración del Entorno](#configuración-del-entorno)
- [Ejecutar Backend Localmente](#ejecutar-backend-localmente)
- [Ejecutar App Móvil Localmente](#ejecutar-app-móvil-localmente)
- [Ejecutar Tests](#ejecutar-tests)
- [Estándar de Código](#estándar-de-código)
- [Proceso de Pull Requests](#proceso-de-pull-requests)
- [Reportar Bugs](#reportar-bugs)

---

## 🚀 Cómo Contribuir

¡Gracias por considerar contribuir a FlashyBank! Aquí tienes los pasos:

### 1. Fork y Clone

```bash
# Fork el repositorio
git clone https://github.com/TU_USUARIO/flashybank.git
cd flashybank
```

### 2. Crear Rama

```bash
# Crear rama para tu feature
git checkout -b feature/tu-feature

# O para un bugfix
git checkout -b fix/tu-bugfix
```

### 3. Hacer Cambios y Commits

```bash
# Hacer cambios
git add .
git commit -m "Add: descripción de tu feature"
```

### 4. Push y Pull Request

```bash
# Push a tu fork
git push origin feature/tu-feature

# Abrir Pull Request en GitHub
```

---

## 🛠️ Configuración del Entorno

### Requerimientos Comunes

#### Backend

- **Java 21+**
  ```bash
  java -version  # openjdk version "21.0.1"
  ```

- **Gradle 8+**
  ```bash
  ./gradlew --version
  ```

- **PostgreSQL 15+**
  ```bash
  psql --version  # psql (PostgreSQL) 15.x
  ```

- **IDE Recomendado:** IntelliJ IDEA

#### Mobile

- **Node.js 18+**
  ```bash
  node -v  # v18.x.x
  ```

- **Expo CLI**
  ```bash
  npm install -g expo-cli
  expo --version  # 6.x.x
  ```

- **Expo Go** en tu dispositivo
  - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
  - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

---

## 🖥️ Ejecutar Backend Localmente

### 1. Configurar Base de Datos

```bash
# Crear base de datos
createdb flashybank

# O con psql
psql -U postgres
CREATE DATABASE flashybank;
CREATE USER flashybank_user WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE flashybank TO flashybank_user;
\q
```

### 2. Configurar Conexión

Editar `backend/src/main/resources/application.yaml`:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/flashybank
    username: flashybank_user
    password: password

jwt:
  secret: claveSuperSecretaParaFirmarTokensConAlMenos256BitsParaHSASeguro
  expiration: 604800000  # 7 días
  refresh-expiration: 1209600000  # 14 días
```

### 3. Ejecutar

```bash
cd backend

# Opción 1: Con Gradle
./gradlew bootRun

# Opción 2: Con IDE (IntelliJ)
# Abrir backend/
# Run -> FlashyBankApplication

# Opción 3: Con script
./start.sh
```

### 4. Verificar

```bash
# Test endpoint
curl http://localhost:8080/api/hello

# Respuesta esperada
{"message":"Hola desde FlashyBank - API funcionando!","status":"online"}
```

### 5. Ver Logs

```bash
# Logs en consola
tail -f backend/build/*.log

# O en IntelliJ
# View -> Tool Windows -> Run
```

---

## 📱 Ejecutar App Móvil Localmente

### 1. Instalar Dependencias

```bash
cd mobile

# Instalar dependencias
npm install
```

### 2. Configurar API

Editar `mobile/src/services/apiClient.js`:

```javascript
const API_BASE_URL = 'http://localhost:8080';

// Si usas iOS Simulator
const API_BASE_URL = 'http://127.0.0.1:8080';

// Si usas dispositivo físico
const API_BASE_URL = 'http://TU_IP_LOCAL:8080';
```

### 3. Iniciar Expo

```bash
cd mobile

# Iniciar servidor de desarrollo
npx expo start

# O con shortcut
npm start
```

### 4. Abrir en Dispositivo

#### Opción 1: Expo Go (Recomendado)

```bash
# Escanear QR desde Expo Go
# Presiona 'a' para Android Emulator
# Presiona 'i' para iOS Simulator
```

#### Opción 2: iOS Simulator

```bash
# Requiere Xcode
npx expo run:ios
```

#### Opción 3: Android Emulator

```bash
# Requiere Android Studio
npx expo run:android
```

### 5. Verificar

1. **Abrir la app**
2. **Registrar usuario:**
   - Username: `testuser`
   - Password: `password123`
3. **Ver saldo:** $1000.00
4. **¡Todo funciona!**

### 6. Debug

#### Chrome DevTools

```bash
# Shake device (o Cmd+D en simulator)
# Click "Debug"
# Abre Chrome Inspector
```

#### React Native Debugger

```bash
# Instalar
npm install -g react-native-debugger

# Abrir
react-native-debugger

# En app: Shake -> Debug with Chrome
# Configurar port: 19001
```

---

## 🧪 Ejecutar Tests

### Backend

```bash
cd backend

# Tests unitarios
./gradlew test

# Tests de integración
./gradlew integrationTest

# Todos los tests
./gradlew check

# Coverage
./gradlew jacocoTestReport
open build/reports/jacoco/test/html/index.html
```

### Mobile

```bash
cd mobile

# Tests unitarios
npm test

# Tests con coverage
npm test -- --coverage

# Tests E2E (con Detox)
npm run test:e2e
```

---

## 📏 Estándar de Código

### Backend (Java)

#### Convenciones

```java
// Nombres de clases: PascalCase
public class UserService { }

// Nombres de métodos: camelCase
public void getUserById() { }

// Nombres de constantes: UPPER_SNAKE_CASE
public static final int MAX_LOGIN_ATTEMPTS = 3;

// Nombres de paquetes: lowercase
package com.flashybank.service;
```

#### Orden de Miembros

```java
public class Example {
    // 1. Constantes
    public static final String CONST = "value";

    // 2. Variables estáticas
    private static Logger logger = ...;

    // 3. Variables de instancia
    private UserRepository repository;

    // 4. Constructores
    public Example() { }

    // 5. Métodos públicos
    public void publicMethod() { }

    // 6. Métodos privados
    private void privateMethod() { }
}
```

#### Comentarios

```java
/**
 * Javadoc para clases y métodos públicos
 *
 * @param username El nombre de usuario
 * @return El usuario encontrado
 * @throws UserNotFoundException si no existe
 */
public User findByUsername(String username) {
    // Comentario inline si es necesario
    return repository.findByUsername(username)
        .orElseThrow(() -> new UserNotFoundException());
}
```

#### Lombok

```java
// Usar @Data para POJOs
@Data
@Entity
public class User {
    private Long id;
    private String username;
    // getters, setters, equals, hashCode auto-generados
}

// Usar @Builder para objetos complejos
@Builder
public class TransactionRequest {
    private String receiverUsername;
    private BigDecimal amount;
}
```

### Mobile (JavaScript/React)

#### Convenciones

```javascript
// Componentes: PascalCase
const HomeScreen = () => { };

// Variables/Funciones: camelCase
const userName = 'juan';
const getUserData = () => { };

// Constantes: UPPER_SNAKE_CASE
const MAX_RETRY_ATTEMPTS = 3;

// Archivos: PascalCase para componentes
// HomeScreen.js, LoginScreen.js
```

#### Hooks

```javascript
// Orden de hooks
const MyComponent = () => {
    // 1. useState
    const [user, setUser] = useState(null);

    // 2. useContext
    const { accessToken } = useAuth();

    // 3. useEffect
    useEffect(() => {
        loadData();
    }, []);

    // 4. Handlers
    const handlePress = () => { };

    // 5. Render
    return <View>...</View>;
};
```

#### Estilos

```javascript
// Usar StyleSheet.create
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    text: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});
```

#### Comentarios

```javascript
/**
 * JSDoc para funciones complejas
 *
 * @param {string} username - El nombre de usuario
 * @returns {Promise<User>} El usuario encontrado
 */
const getUser = async (username) => {
    // Comentario inline si es necesario
    return await apiClient.get(`/users/${username}`);
};
```

---

## 🔄 Proceso de Pull Requests

### 1. Antes de Abrir PR

- [ ] Tests pasando (`./gradlew check` y `npm test`)
- [ ] Código formateado
- [ ] Sin warnings de compilación
- [ ] Commits con mensajes claros
- [ ] Rama actualizada con `main`

### 2. Mensaje de Commit

Usar **Conventional Commits**:

```
<tipo>: <descripción>

[opcional cuerpo]

[opcional footer]
```

**Tipos:**

- `feat`: Nueva feature
- `fix`: Bugfix
- `docs`: Cambios en documentación
- `style`: Formateo (sin lógica)
- `refactor`: Refactorización
- `test`: Agregar tests
- `chore`: Tareas de mantenimiento

**Ejemplos:**

```bash
git commit -m "feat: add quick mode for transfers"
git commit -m "fix: correct balance update on transfer"
git commit -m "docs: update API documentation"
```

### 3. Pull Request Template

```markdown
## Descripción
Breve descripción de los cambios.

## Tipo de Cambio
- [ ] Bugfix (non-breaking change)
- [ ] Feature (non-breaking change)
- [ ] Breaking change (fix/feature causing breaking change)
- [ ] Documentation

## Testing
- [ ] Tests unitarios pasando
- [ ] Tests de integración pasando
- [ ] Manual testing completado

## Checklist
- [ ] Mi código sigue los estándares de código
- [ ] He realizado self-review de mi código
- [ ] He comentado código complejo
- [ ] He actualizado la documentación
- [ ] No hay nuevos warnings
- [ ] He agregado tests que prueban mis cambios
- [ ] Todos los tests pasan
- [ ] Mis cambios no generan nuevos warnings

## Screenshots (si aplica)
Before:
![before](link)
After:
![after](link)
```

### 4. Code Review

- Mantener PRs pequeños (< 400 líneas)
- Responder comentarios pronto
- Ser respetuoso y constructivo
- Solicitar re-review si cambias mucho

### 5. Merge

- Mantener historial limpia (rebase si es necesario)
- Usar "Squash and merge" si hay muchos commits pequeños
- Borrar rama después del merge

---

## 🐛 Reportar Bugs

### Plantilla de Bug Report

```markdown
## Descripción
Breve descripción del bug.

## Pasos para Reproducir
1. Ir a '...'
2. Click en '....'
3. Scroll a '....'
4. Ver error

## Comportamiento Esperado
Descripción de lo que debería pasar.

## Screenshots
Si aplica, agregar screenshots.

## Entorno
- OS: [e.g. iOS 16.0]
- Navegador: [e.g. Chrome 120]
- Versión de FlashyBank: [e.g. 1.0.0]

## Contexto Adicional
Logs, stack traces, etc.
```

### Cómo Reportar

1. **Buscar issues existentes** para evitar duplicados
2. **Usar plantilla** al crear issue
3. **Incluir entorno** (OS, versión, etc.)
4. **Adjuntar logs** si es posible
5. **Etiquetar** con `bug` y `needs-confirmation`

---

## 💡 Solicitar Features

### Plantilla de Feature Request

```markdown
## ¿Qué problema resuelve?
Descripción del problema que esta feature resolvería.

## Solución Propuesta
Descripción detallada de la solución.

## Alternativas Consideradas
Descripción de alternativas y por qué no fueron elegidas.

## Prioridad
- [ ] Alta
- [ ] Media
- [ ] Baja
```

---

## 📞 Contacto

- **Discusiones:** [GitHub Discussions](https://github.com/flashybank/flashybank/discussions)
- **Issues:** [GitHub Issues](https://github.com/flashybank/flashybank/issues)
- **Email:** dev@flashybank.com

---

## 📄 Licencia

Al contribuir, aceptas que tu código sea licenciado bajo la **Licencia MIT**. Ver [`LICENSE`](LICENSE) para detalles.

---

**¡Gracias por contribuir a FlashyBank!** 🎉

**Última actualización:** 2025-02-12
**Versión:** 1.0.0
