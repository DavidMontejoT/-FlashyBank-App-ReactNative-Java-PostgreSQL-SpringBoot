# 🏗️ Arquitectura de FlashyBank

**Versión:** 1.0.0
**Última actualización:** 2025-02-12

---

## 📋 Tabla de Contenidos

- [Arquitectura General](#arquitectura-general)
- [Arquitectura del Backend](#arquitectura-del-backend)
- [Arquitectura de la App Móvil](#arquitectura-de-la-app-móvil)
- [Autenticación JWT](#autenticación-jwt)
- [Sistema de Transferencias](#sistema-de-transferencias)
- [Base de Datos](#base-de-datos)
- [Sistema de Temas](#sistema-de-temas)
- [Quick Mode](#quick-mode)

---

## 🏛️ Arquitectura General

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           FLASHYBANK SYSTEM                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────────────────┐         ┌──────────────────────────┐       │
│  │    Backend Layer         │         │    Mobile Layer          │       │
│  │    (Spring Boot)         │         │    (React Native)        │       │
│  │                          │         │                          │       │
│  │  ┌──────────────────┐   │         │  ┌──────────────────┐   │       │
│  │  │  Controllers     │   │         │  │  Screens         │   │       │
│  │  │  - Auth          │   │         │  │  - Login         │   │       │
│  │  │  - Transaction   │   │         │  │  - Register      │   │       │
│  │  │  - User          │   │         │  │  - Home          │   │       │
│  │  └──────────────────┘   │         │  │  - Transfer      │   │       │
│  │           │              │         │  │  - Confirm       │   │       │
│  │           ▼              │         │  │  - History       │   │       │
│  │  ┌──────────────────┐   │         │  │  - Profile       │   │       │
│  │  │  Services        │   │         │  └──────────────────┘   │       │
│  │  │  - Auth          │   │         │           │              │       │
│  │  │  - Transaction   │   │         │           ▼              │       │
│  │  │  - User          │   │         │  ┌──────────────────┐   │       │
│  │  └──────────────────┘   │         │  │  Context         │   │       │
│  │           │              │         │  │  - AuthContext   │   │       │
│  │           ▼              │         │  └──────────────────┘   │       │
│  │  ┌──────────────────┐   │         │           │              │       │
│  │  │  Repositories   │   │         │           ▼              │       │
│  │  │  - UserRepo     │   │         │  ┌──────────────────┐   │       │
│  │  │  - TransacRepo  │   │         │  │  Services        │   │       │
│  │  └──────────────────┘   │         │  │  - API Client    │   │       │
│  │           │              │         │  │  - Storage       │   │       │
│  │           ▼              │         │  └──────────────────┘   │       │
│  └──────────┬───────────────┘         └──────────┬───────────────┘       │
│             │                                  │                       │
│             │         HTTP/JSON                │                       │
│             │         TLS/SSL                 │                       │
│             └────────────┬───────────────────┘                       │
│                          │                                           │
└──────────────────────────┼───────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        Database Layer                                      │
│                                                                             │
│  ┌────────────────────────────┐  ┌──────────────────────────────┐       │
│  │         users               │  │       transactions            │       │
│  │                            │  │                              │       │
│  │  ┌──────────────────┐     │  │  ┌──────────────────────┐   │       │
│  │  │ id               │     │  │  │ id                   │   │       │
│  │  │ username         │     │  │  │ sender_id            │   │       │
│  │  │ password         │     │  │  │ receiver_username    │   │       │
│  │  │ balance          │     │  │  │ amount               │   │       │
│  │  │ role             │     │  │  │ status               │   │       │
│  │  │ enabled          │     │  │  │ description          │   │       │
│  │  │ created_at       │     │  │  │ created_at           │   │       │
│  │  │ updated_at       │     │  │  └──────────────────────┘   │       │
│  │  └──────────────────┘     │  │                              │       │
│  └────────────────────────────┘  └──────────────────────────────┘       │
│                                                                             │
│                         PostgreSQL 15+                                       │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔧 Arquitectura del Backend

### Patrón: Layered Architecture (MVC)

```
┌─────────────────────────────────────────────────────────────┐
│                     Presentation Layer                    │
│  ┌───────────────────────────────────────────────────┐   │
│  │  Controllers (@RestController)                      │   │
│  │  - AuthController                                   │   │
│  │  - TransactionController                            │   │
│  │  - UserController                                   │   │
│  └───────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      Business Logic Layer                  │
│  ┌───────────────────────────────────────────────────┐   │
│  │  Services (@Service)                                │   │
│  │  - AuthService                                      │   │
│  │    - login()                                        │   │
│  │    - register()                                     │   │
│  │    - refreshToken()                                 │   │
│  │    - logout()                                       │   │
│  │  - TransactionService                               │   │
│  │    - initiateTransfer()                             │   │
│  │    - confirmTransfer()                              │   │
│  │    - cancelTransfer()                               │   │
│  │  - UserService                                      │   │
│  │    - getProfile()                                   │   │
│  │    - updateProfile()                                │   │
│  │    - validateUser()                                 │   │
│  └───────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Data Access Layer                       │
│  ┌───────────────────────────────────────────────────┐   │
│  │  Repositories (JPA)                                 │   │
│  │  - UserRepository extends JpaRepository<User, Long>│ │
│  │  - TransactionRepository extends JpaRepository...   │ │
│  │  - TokenBlacklistRepository extends JpaRepository...││
│  └───────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Database Layer                            │
│  PostgreSQL 15+                                              │
└─────────────────────────────────────────────────────────────┘
```

### Detalle de Componentes

#### 1. **Controllers** (Presentation Layer)

**Responsabilidad:**
- Recibir requests HTTP
- Validar inputs con Jakarta Validation
- Retornar responses HTTP apropiados
- Delegar lógica de negocio a Services

**Ejemplo:**
```java
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody @Valid LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }
}
```

#### 2. **Services** (Business Logic Layer)

**Responsabilidad:**
- Implementar lógica de negocio
- Validar reglas de negocio
- Orquestar operaciones
- Manejar transacciones con `@Transactional`

**Ejemplo:**
```java
@Service
public class TransactionService {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public Transaction initiateTransfer(InitiateTransferRequest request, String senderUsername) {
        // 1. Validar saldo
        User sender = userRepository.findByUsername(senderUsername)
            .orElseThrow(() -> new UserNotFoundException());

        if (sender.getBalance().compareTo(request.getAmount()) < 0) {
            throw new InsufficientBalanceException();
        }

        // 2. Validar destinatario
        User receiver = userRepository.findByUsername(request.getReceiverUsername())
            .orElseThrow(() -> new UserNotFoundException());

        // 3. Crear transacción PENDING
        Transaction transaction = new Transaction();
        transaction.setSenderId(sender.getId());
        transaction.setReceiverUsername(request.getReceiverUsername());
        transaction.setAmount(request.getAmount());
        transaction.setStatus(TransactionStatus.PENDING);
        transaction.setDescription(request.getDescription());

        return transactionRepository.save(transaction);
    }

    @Transactional
    public Transaction confirmTransfer(Long transactionId, String username) {
        // 1. Obtener transacción
        Transaction transaction = transactionRepository.findById(transactionId)
            .orElseThrow(() -> new TransactionNotFoundException());

        // 2. Validar permisos
        if (!transaction.getSenderUsername().equals(username)) {
            throw new UnauthorizedException();
        }

        // 3. Validar estado
        if (transaction.getStatus() != TransactionStatus.PENDING) {
            throw new InvalidTransactionStatusException();
        }

        // 4. Actualizar saldos
        User sender = userRepository.findById(transaction.getSenderId()).get();
        User receiver = userRepository.findByUsername(transaction.getReceiverUsername()).get();

        sender.setBalance(sender.getBalance().subtract(transaction.getAmount()));
        receiver.setBalance(receiver.getBalance().add(transaction.getAmount()));

        userRepository.save(sender);
        userRepository.save(receiver);

        // 5. Actualizar estado
        transaction.setStatus(TransactionStatus.COMPLETED);
        return transactionRepository.save(transaction);
    }
}
```

#### 3. **Repositories** (Data Access Layer)

**Responsabilidad:**
- CRUD básico (JPA)
- Queries personalizadas
- Manejo de entidades

**Ejemplo:**
```java
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);

    boolean existsByUsername(String username);

    @Query("SELECT u FROM User u WHERE LOWER(u.username) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<User> findByUsernameContainingIgnoreCase(@Param("search") String search, Pageable pageable);
}
```

#### 4. **Security Layer**

**JwtAuthenticationFilter:**
```java
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private TokenBlacklistRepository tokenBlacklistRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                  HttpServletResponse response,
                                  FilterChain chain) throws ServletException, IOException {
        // 1. Extraer token del header "Authorization: Bearer <token>"
        String token = extractToken(request);

        if (token != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            // 2. Verificar si está en blacklist
            if (tokenBlacklistRepository.existsByToken(token)) {
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Token inválido");
                return;
            }

            // 3. Extraer username
            String username = jwtUtil.extractUsername(token);

            // 4. Cargar UserDetails
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            // 5. Validar token
            if (jwtUtil.isTokenValid(token, userDetails)) {
                // 6. Crear Authentication y setear en SecurityContext
                UsernamePasswordAuthenticationToken authToken =
                    new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        chain.doFilter(request, response);
    }
}
```

---

## 📱 Arquitectura de la App Móvil

### Patrón: Component-Based Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       UI Layer                             │
│  ┌───────────────────────────────────────────────────┐   │
│  │  Screens (React Components)                         │   │
│  │  - LoginScreen                                      │   │
│  │  - RegisterScreen                                   │   │
│  │  - HomeScreen                                       │   │
│  │  - TransferScreen                                   │   │
│  │  - ConfirmScreen                                     │   │
│  │  - HistoryScreen                                     │   │
│  │  - ProfileScreen                                     │   │
│  └───────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    State Management                         │
│  ┌───────────────────────────────────────────────────┐   │
│  │  AuthContext (React Context)                         │   │
│  │  - user: User                                        │   │
│  │  - accessToken: string                               │   │
│  │  - refreshToken: string                              │   │
│  │  - login()                                           │   │
│  │  - register()                                        │   │
│  │  - logout()                                          │   │
│  │  - refreshAccessToken()                              │   │
│  └───────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      Service Layer                          │
│  ┌───────────────────────────────────────────────────┐   │
│  │  Services                                           │   │
│  │  - authService: Login, register, logout             │   │
│  │  - transactionService: Initiate, confirm, history  │   │
│  │  - userService: Profile, validate, update           │   │
│  │  - storageService: SecureStore wrapper             │   │
│  └───────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Client Layer                          │
│  ┌───────────────────────────────────────────────────┐   │
│  │  Axios (HTTP Client)                                 │   │
│  │  - Base URL: http://localhost:8080                 │   │
│  │  - Interceptor: Auto-refresh tokens                │   │
│  │  - Headers: Authorization: Bearer <token>          │   │
│  └───────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                     Storage Layer                           │
│  ┌───────────────────────────────────────────────────┐   │
│  │  SecureStore (Expo)                                 │   │
│  │  - accessToken: Cifrado hardware                   │   │
│  │  - refreshToken: Cifrado hardware                  │   │
│  │  - theme: Tema actual                              │   │
│  │  - quickMode: Expiración Quick Mode               │   │
│  └───────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Detalle de Componentes

#### 1. **AuthContext** (State Management)

**Responsabilidad:**
- Estado global de autenticación
- Métodos para login, register, logout
- Auto-refresh de tokens expirados

**Ejemplo:**
```javascript
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTokens();
  }, []);

  const loadTokens = async () => {
    try {
      const access = await storageService.getAccessToken();
      const refresh = await storageService.getRefreshToken();
      if (access && refresh) {
        setAccessToken(access);
        setRefreshToken(refresh);
        // Decodificar JWT para obtener user
        const decoded = jwtDecode(access);
        setUser({ username: decoded.sub });
      }
    } catch (error) {
      console.error('Error loading tokens:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    const response = await authService.login(username, password);
    setAccessToken(response.accessToken);
    setRefreshToken(response.refreshToken);
    await storageService.saveTokens(response.accessToken, response.refreshToken);
    setUser({ username: response.username });
  };

  const logout = async () => {
    await authService.logout(refreshToken);
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
    await storageService.clearTokens();
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
```

#### 2. **Navigation** (React Navigation)

**Estructura:**
```
RootNavigator (condicional)
│
├─ Auth Stack (cuando NO hay token)
│  ├─ LoginScreen
│  └─ RegisterScreen
│
└─ App Stack (cuando SÍ hay token)
   ├─ HomeScreen
   ├─ TransferScreen
   ├─ ConfirmScreen
   ├─ HistoryScreen
   └─ ProfileScreen
```

**Ejemplo:**
```javascript
const RootNavigator = () => {
  const { accessToken } = useAuth();

  return accessToken ? <AppNavigator /> : <AuthNavigator />;
};
```

#### 3. **Biometric Authentication**

**Responsabilidad:**
- Solicitar Face ID / Touch ID
- Confirmar transferencias sensibles
- Fallback si no hay biometría

**Ejemplo:**
```javascript
const confirmWithBiometrics = async () => {
  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();

    if (!hasHardware || !isEnrolled) {
      // Fallback: confirmar con botón
      return confirmWithoutBiometrics();
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Confirma la transferencia con Face ID',
      fallbackLabel: 'Usar contraseña',
    });

    if (result.success) {
      await transactionService.confirmTransfer(transactionId);
      navigation.navigate('History');
    }
  } catch (error) {
    console.error('Biometric error:', error);
  }
};
```

---

## 🔐 Autenticación JWT

### Flujo Completo de Autenticación

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         JWT AUTHENTICATION FLOW                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. REGISTER                                                               │
│  ─────────                                                                │
│  Client                           Server                       DB          │
│    │                               │                            │         │
│    │ POST /api/auth/register       │                            │         │
│    │ {username, password} ────────>│                            │         │
│    │                               │ INSERT INTO users           │         │
│    │                               │ (username, password_hash) ──>│         │
│    │                               │<────────────────────────────│         │
│    │                               │                            │         │
│    │                               │ JWT.generateToken()         │         │
│    │                               │ JWT.generateRefreshToken()  │         │
│    │                               │                            │         │
│    │<────────────────────────────── │                            │         │
│    │ {accessToken, refreshToken}    │                            │         │
│    │                               │                            │         │
│                                                                             │
│  2. LOGIN                                                                  │
│  ───────                                                                  │
│  Client                           Server                       DB          │
│    │                               │                            │         │
│    │ POST /api/auth/login          │                            │         │
│    │ {username, password} ────────>│                            │         │
│    │                               │ SELECT * FROM users       │         │
│    │                               │ WHERE username = ? ──────>│         │
│    │                               │<────────────────────────────│         │
│    │                               │ BCrypt.check(password)     │         │
│    │                               │                            │         │
│    │                               │ JWT.generateToken()         │         │
│    │                               │ JWT.generateRefreshToken()  │         │
│    │                               │                            │         │
│    │<────────────────────────────── │                            │         │
│    │ {accessToken, refreshToken}    │                            │         │
│    │                               │                            │         │
│                                                                             │
│  3. ACCESS PROTECTED ENDPOINT                                              │
│  ────────────────────────────                                              │
│  Client                           Server                       DB          │
│    │                               │                            │         │
│    │ GET /api/transactions/balance │                            │         │
│    │ Authorization: Bearer <token> │                            │         │
│    │ ─────────────────────────────>│                            │         │
│    │                               │ JWT.verify(token)           │         │
│    │                               │ JWT.extractUsername()       │         │
│    │                               │                            │         │
│    │                               │ TokenBlacklist.check()      │         │
│    │                               │                            │         │
│    │                               │ UserDetailsService.load()  │         │
│    │                               │ ────────────────────────>│         │
│    │                               │<────────────────────────────│         │
│    │                               │                            │         │
│    │                               │ SecurityContext.setAuth()   │         │
│    │                               │                            │         │
│    │                               │ Controller.getBalance()    │         │
│    │                               │ ────────────────────────>│         │
│    │                               │<────────────────────────────│         │
│    │                               │                            │         │
│    │<────────────────────────────── │                            │         │
│    │ {username, balance}           │                            │         │
│    │                               │                            │         │
│                                                                             │
│  4. REFRESH TOKEN                                                          │
│  ───────────────                                                           │
│  Client                           Server                       DB          │
│    │                               │                            │         │
│    │ POST /api/auth/refresh        │                            │         │
│    │ {refreshToken} ──────────────>│                            │         │
│    │                               │ JWT.verify(refreshToken)    │         │
│    │                               │ TokenBlacklist.check()      │         │
│    │                               │                            │         │
│    │                               │ JWT.generateToken()         │         │
│    │                               │ JWT.generateRefreshToken()  │         │
│    │                               │                            │         │
│    │<────────────────────────────── │                            │         │
│    │ {accessToken, refreshToken}    │                            │         │
│    │                               │                            │         │
│                                                                             │
│  5. LOGOUT                                                                 │
│  ────────                                                                 │
│  Client                           Server                       DB          │
│    │                               │                            │         │
│    │ POST /api/auth/logout         │                            │         │
│    │ Authorization: Bearer <token> │                            │         │
│    │ {refreshToken} ──────────────>│                            │         │
│    │                               │ TokenBlacklist.add()       │         │
│    │                               │ (accessToken) ───────────>│         │
│    │                               │ TokenBlacklist.add()       │         │
│    │                               │ (refreshToken) ──────────>│         │
│    │                               │                            │         │
│    │<────────────────────────────── │                            │         │
│    │ {message: "Logout exitoso"}    │                            │         │
│    │                               │                            │         │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Estructura del Token JWT

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        JWT STRUCTURE                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  HEADER                          PAYLOAD                      SIGNATURE    │
│  ┌─────────────────┐           ┌─────────────────────────┐      ┌───────┐│
│  │                 │           │                         │      │       ││
│  │ {"alg": "HS384",│    .     │ {"sub": "juanperez",     │  .   │ HMAC- ││
│  │  "typ": "JWT"   │           │   "iat": 1737764500,    │      │ SHA384││
│  │}                │           │   "exp": 1738369300      │      │ sign  ││
│  │                 │           │ }                       │      │       ││
│  └─────────────────┘           └─────────────────────────┘      └───────┘│
│         Base64URL                        Base64URL              Calculated│
│         Encoded                          Encoded              from data│
│                                                                             │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                          Complete JWT Token                                 │
│                                                                             │
│  eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJqdWFucGVyZXoiLCJpYXQiOjE3Mzc3NjQ1MDAsImV4│
│  cCI6MTczODM2OTMwMH0.xxx...                                                │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Duración de Tokens

| Token | Duración | Propósito |
|-------|----------|-----------|
| **Access Token** | 7 días | Requests diarios a la API |
| **Refresh Token** | 14 días | Renovar access sin login |

**Ventajas:**
- Expiración corta de access token: Seguridad
- Expiración larga de refresh token: UX sin login frecuente
- Token blacklist: Logout inmediato

---

## 💸 Sistema de Transferencias

### Flujo de Transferencia en 2 Pasos

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    TRANSFER FLOW - 2 STEPS                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PASO 1: INICIAR TRANSFERENCIA                                              │
│  ─────────────────────────                                                   │
│                                                                             │
│  Client                        Server                      DB               │
│    │                            │                            │              │
│    │ POST /transactions/initiate│                            │              │
│    │ {receiver, amount}        │                            │              │
│    │ ─────────────────────────>│                            │              │
│    │                            │ Validate balance           │              │
│    │                            │ Validate receiver          │              │
│    │                            │ ────────────────────────> │              │
│    │                            │<────────────────────────── │              │
│    │                            │                            │              │
│    │                            │ INSERT INTO transactions    │              │
│    │                            │ (status: PENDING) ────────>│              │
│    │                            │<────────────────────────── │              │
│    │                            │                            │              │
│    │<─────────────────────────── │                            │              │
│    │ {id, status: PENDING}      │                            │              │
│    │                            │                            │              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ CONFIRM SCREEN                                                   │   │
│  │ Para: mariagarcia                                               │   │
│  │ Monto: $150.50                                                  │   │
│  │ Descripción: Pago de préstamo                                    │   │
│  │ [CANCELAR]  [CONFIRMAR CON FACE ID]                             │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  PASO 2: CONFIRMAR TRANSFERENCIA                                            │
│  ──────────────────────────────                                             │
│                                                                             │
│  User presses "CONFIRMAR"                                                    │
│    │                            │                            │              │
│    │ 📱 Biometric Auth          │                            │              │
│    │ Face ID / Touch ID         │                            │              │
│    │ ✅ Success                 │                            │              │
│    │                            │                            │              │
│    │ POST /transactions/confirm │                            │              │
│    │ /{id}                     │                            │              │
│    │ ─────────────────────────>│                            │              │
│    │                            │ Validate status: PENDING    │              │
│    │                            │ Validate sender            │              │
│    │                            │ ────────────────────────> │              │
│    │                            │<────────────────────────── │              │
│    │                            │                            │              │
│    │                            │ UPDATE users               │              │
│    │                            │ SET balance = balance - 150.50│         │
│    │                            │ WHERE username = 'juanperez'│         │
│    │                            │ ────────────────────────> │              │
│    │                            │<────────────────────────── │              │
│    │                            │                            │              │
│    │                            │ UPDATE users               │              │
│    │                            │ SET balance = balance + 150.50│         │
│    │                            │ WHERE username = 'mariagarcia'│        │
│    │                            │ ────────────────────────> │              │
│    │                            │<────────────────────────── │              │
│    │                            │                            │              │
│    │                            │ UPDATE transactions         │              │
│    │                            │ SET status = COMPLETED     │              │
│    │                            │ WHERE id = ? ────────────>│              │
│    │                            │<────────────────────────── │              │
│    │                            │                            │              │
│    │<─────────────────────────── │                            │              │
│    │ {status: COMPLETED}        │                            │              │
│    │                            │                            │              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ SUCCESS SCREEN                                                   │   │
│  │ ✅ Transferencia completada                                       │   │
│  │ $150.50 enviados a mariagarcia                                   │   │
│  │ [VER HISTORIAL]                                                 │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Estados de Transacción

| Estado | Descripción | Transiciones |
|--------|-------------|--------------|
| **PENDING** | Transferencia iniciada, no confirmada | → COMPLETED, → CANCELLED |
| **COMPLETED** | Transferencia completada | - (Terminal) |
| **CANCELLED** | Transferencia cancelada | - (Terminal) |

**Reglas:**
- Solo el remitente puede confirmar/cancelar
- El remitente debe tener saldo suficiente
- No se puede transferir a sí mismo
- Solo transacciones PENDING pueden confirmarse

---

## 🗄️ Base de Datos

### Esquema PostgreSQL

```sql
┌─────────────────────────────────────────────────────────────────────────────┐
│                              DATABASE SCHEMA                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────┐   │
│  │                        TABLE: users                                │   │
│  ├───────────────────────────────────────────────────────────────────┤   │
│  │ Column          │ Type         │ Null │ Key │ Default │ Extra      │   │
│  ├─────────────────┼──────────────┼──────┼─────┼─────────┼───────────│   │
│  │ id              │ BIGINT       │ NO   │ PK  │ AUTO    │ AUTO_INC   │   │
│  │ username        │ VARCHAR(50)  │ NO   │ UK  │         │            │   │
│  │ password        │ VARCHAR(255) │ NO   │     │         │ BCrypt hash│   │
│  │ balance         │ DECIMAL(19,2)│ NO   │     │ 1000.00 │            │   │
│  │ role            │ VARCHAR(20)  │ NO   │     │ USER     │            │   │
│  │ enabled         │ BOOLEAN     │ NO   │     │ true     │            │   │
│  │ created_at      │ TIMESTAMP   │ NO   │     │ NOW()    │            │   │
│  │ updated_at      │ TIMESTAMP   │ NO   │     │ NOW()    │            │   │
│  └───────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────┐   │
│  │                     TABLE: transactions                            │   │
│  ├───────────────────────────────────────────────────────────────────┤   │
│  │ Column            │ Type         │ Null │ Key │ Default │ Extra     │   │
│  ├───────────────────┼──────────────┼──────┼─────┼─────────┼───────────│   │
│  │ id                │ BIGINT       │ NO   │ PK  │ AUTO    │ AUTO_INC  │   │
│  │ sender_id         │ BIGINT       │ NO   │ FK  │         │ users.id  │   │
│  │ receiver_username │ VARCHAR(50)  │ NO   │     │         │           │   │
│  │ amount            │ DECIMAL(19,2)│ NO   │     │         │           │   │
│  │ status            │ VARCHAR(20)  │ NO   │     │ PENDING  │           │   │
│  │ description       │ TEXT         │ YES  │     │         │           │   │
│  │ created_at        │ TIMESTAMP   │ NO   │     │ NOW()    │           │   │
│  └───────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────┐   │
│  │                  TABLE: token_blacklist                           │   │
│  ├───────────────────────────────────────────────────────────────────┤   │
│  │ Column      │ Type         │ Null │ Key │ Default │ Extra           │   │
│  ├─────────────┼──────────────┼──────┼─────┼─────────┼───────────────│   │
│  │ id          │ BIGINT       │ NO   │ PK  │ AUTO    │ AUTO_INC       │   │
│  │ token       │ TEXT         │ NO   │ UK  │         │ JWT token       │   │
│  │ token_type  │ VARCHAR(20)  │ NO   │     │         │ ACCESS/REFRESH │   │
│  │ created_at  │ TIMESTAMP   │ NO   │     │ NOW()    │                │   │
│  └───────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  FK: transactions.sender_id → users.id                                      │
│  UK: Unique constraint                                                      │
│  PK: Primary key                                                           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Índices

```sql
-- Performance indexes
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_transactions_sender_id ON transactions(sender_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX idx_token_blacklist_token ON token_blacklist(token);
```

---

## 🎨 Sistema de Temas

### 4 Paletas de Colores

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          THEME SYSTEM                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. LIGHT MODE (Default)                                                   │
│  ─────────────────                                                        │
│  Background: #FFFFFF (Blanco)                                              │
│  Surface: #F5F5F5 (Gris claro)                                             │
│  Primary: #2196F3 (Azul Flashy)                                            │
│  Secondary: #FFC107 (Ambar)                                                │
│  Text: #212121 (Gris oscuro)                                               │
│  Text Secondary: #757575 (Gris medio)                                      │
│  Success: #4CAF50 (Verde)                                                  │
│  Error: #F44336 (Rojo)                                                    │
│                                                                             │
│  2. DARK MODE                                                              │
│  ────────────                                                              │
│  Background: #121212 (Negro suave)                                        │
│  Surface: #1E1E1E (Gris muy oscuro)                                        │
│  Primary: #2196F3 (Azul Flashy)                                            │
│  Secondary: #FFC107 (Ambar)                                                │
│  Text: #FFFFFF (Blanco)                                                    │
│  Text Secondary: #B0B0B0 (Gris claro)                                     │
│  Success: #4CAF50 (Verde)                                                  │
│  Error: #F44336 (Rojo)                                                    │
│                                                                             │
│  3. MIDNIGHT MODE (Elegante)                                               │
│  ─────────────────────────                                                 │
│  Background: #0D1B2A (Azul marino muy oscuro)                              │
│  Surface: #1A2D3F (Azul marino oscuro)                                      │
│  Primary: #64B5F6 (Azul claro)                                             │
│  Secondary: #FFD54F (Dorado)                                               │
│  Text: #E3F2FD (Azul muy claro)                                            │
│  Text Secondary: #90CAF9 (Azul medio)                                      │
│  Success: #81C784 (Verde suave)                                            │
│  Error: #E57373 (Rojo suave)                                               │
│                                                                             │
│  4. SUNSET MODE (Cálido)                                                   │
│  ────────────────────                                                      │
│  Background: #2D1B2E (Púrpura muy oscuro)                                   │
│  Surface: #3E272E (Púrpura oscuro)                                         │
│  Primary: #FFAB91 (Coral)                                                   │
│  Secondary: #FFCC80 (Naranja)                                               │
│  Text: #FFF3E0 (Crema)                                                     │
│  Text Secondary: #FFB74D (Naranja claro)                                    │
│  Success: #A5D6A7 (Verde suave)                                            │
│  Error: #EF9A9A (Rojo suave)                                               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Implementación en React Native Paper

```javascript
// src/themes/index.js
import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#2196F3',
    secondary: '#FFC107',
    background: '#FFFFFF',
    surface: '#F5F5F5',
    error: '#F44336',
    success: '#4CAF50',
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#2196F3',
    secondary: '#FFC107',
    background: '#121212',
    surface: '#1E1E1E',
    error: '#F44336',
    success: '#4CAF50',
  },
};

export const midnightTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#64B5F6',
    secondary: '#FFD54F',
    background: '#0D1B2A',
    surface: '#1A2D3F',
    error: '#E57373',
    success: '#81C784',
  },
};

export const sunsetTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#FFAB91',
    secondary: '#FFCC80',
    background: '#2D1B2E',
    surface: '#3E272E',
    error: '#EF9A9A',
    success: '#A5D6A7',
  },
};
```

---

## ⏱️ Quick Mode

### Funcionamiento

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        QUICK MODE (2 HORAS)                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  USUARIO ACTIVA QUICK MODE                                                  │
│  ────────────────────────────                                              │
│                                                                             │
│  1. Home → Ajustes → Quick Mode                                            │
│  2. Activar con biometría                                                   │
│  3. Quick Mode activado por 2 horas                                        │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ ⏱️ Quick Mode Activado                                             │   │
│  │ Expira en: 1h 59m 32s                                              │   │
│  │                                                                     │   │
│  │ Beneficios:                                                         │   │
│  │ • Salta pantalla de confirmación                                    │   │
│  │ • Transferencias en 1 paso                                          │   │
│  │ • Ahorra tiempo en operaciones frecuentes                          │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  TRANSFERENCIA NORMAL (3 pasos)             TRANSFERENCIA QUICK MODE (2 pasos)│
│  ─────────────────────────────────────────────────────────────────────────   │
│  1. Transfer → Iniciar                    1. Transfer → Iniciar            │
│  2. Confirm Screen                        2. Confirmar con biometría       │
│  3. Confirmar con biometría               (sin pantalla de confirmación)    │
│                                                                             │
│  Ahorro: 1 paso menos por transferencia                                     │
│                                                                             │
│  EXPIRACIÓN                                                                 │
│  ─────────                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ ⏱️ Quick Mode Expirado                                             │   │
│  │                                                                     │   │
│  │ Tu Quick Mode ha expirado. Vuelve a activarlo para continuar         │   │
│  │ ahorrando tiempo en tus transferencias.                             │   │
│  │                                                                     │   │
│  │ [ACTIVAR QUICK MODE]                                               │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  SEGURIDAD                                                                 │
│  ────────                                                                 │
│  • Activación requiere biometría                                           │
│  • Expiración automática de 2 horas                                        │
│  • Solo para transferencias bajo $500                                      │
│  • Desactivable manualmente                                                │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Persistencia

```javascript
// Almacenar en SecureStore
const activateQuickMode = async () => {
  const expiresAt = Date.now() + (2 * 60 * 60 * 1000); // 2 horas
  await storageService.saveQuickModeExpiry(expiresAt);
};

// Verificar expiración
const isQuickModeActive = async () => {
  const expiresAt = await storageService.getQuickModeExpiry();
  return Date.now() < expiresAt;
};

// Auto-expiración
useEffect(() => {
  const checkExpiration = setInterval(async () => {
    const expiresAt = await storageService.getQuickModeExpiry();
    if (Date.now() >= expiresAt) {
      setQuickModeActive(false);
      clearInterval(checkExpiration);
    }
  }, 60000); // Chequear cada minuto

  return () => clearInterval(checkExpiration);
}, []);
```

---

## 📚 Recursos Adicionales

- [Documentación de la API](api.md)
- [Guía de Deployment](deployment.md)
- [Architecture Decision Records](decisions.md)
- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [React Native Documentation](https://reactnative.dev/)
- [Expo Documentation](https://docs.expo.dev/)

---

**Última actualización:** 2025-02-12
**Versión:** 1.0.0
