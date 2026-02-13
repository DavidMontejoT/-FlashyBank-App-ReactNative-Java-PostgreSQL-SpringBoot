# FlashyBank - Quick Reference Card

## 🚀 Comandos Rápidos

### Ejecutar aplicación
```bash
cd /Users/macbook/Documents/05_Proyectos/FlashyBank/flashyBank
./gradlew bootRun
```

### Compilar sin ejecutar
```bash
./gradlew build
```

### Limpiar y recompilar
```bash
./gradlew clean build
```

### Ejecutar tests
```bash
./gradlew test
```

---

## 🗄️ Base de Datos

### Crear base de datos PostgreSQL
```bash
psql -U postgres
CREATE DATABASE flashybank;
\q
```

### Conectar a la base de datos
```bash
psql -U postgres -d flashybank
```

### Ver tablas
```sql
\dt
```

### Consultar usuarios
```sql
SELECT id, username, balance, role, enabled FROM users;
```

### Consultar transacciones
```sql
SELECT * FROM transactions ORDER BY created_at DESC;
```

---

## 🧪 Testing con cURL

### 1. Registrar usuario
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "juan",
    "password": "password123"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "juan",
    "password": "password123"
  }'
```

**Guardar el token en variable:**
```bash
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "juan", "password": "password123"}' \
  | jq -r '.accessToken')
```

### 3. Endpoint protegido
```bash
curl -X GET http://localhost:8080/api/protected \
  -H "Authorization: Bearer $TOKEN"
```

### 4. Refresh token
```bash
REFRESH_TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "juan", "password": "password123"}' \
  | jq -r '.refreshToken')

curl -X POST http://localhost:8080/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\": \"$REFRESH_TOKEN\"}"
```

---

## 🧪 Testing con HTTPie (más legible)

### Instalar HTTPie
```bash
brew install httpie
```

### Registrar
```bash
http POST localhost:8080/api/auth/register \
  username=juan \
  password=password123
```

### Login
```bash
http POST localhost:8080/api/auth/login \
  username=juan \
  password=password123
```

### Endpoint protegido
```bash
http GET localhost:8080/api/protected \
  Authorization:"Bearer $TOKEN"
```

---

## 📊 Estructura de Proyecto

```
flashyBank/
├── src/main/java/com/flashybank/
│   ├── config/           # Configuración Spring Security
│   ├── controller/       # REST controllers
│   ├── dto/              # Data Transfer Objects
│   ├── filter/           # JWT filter
│   ├── model/            # JPA entities
│   ├── repository/       # JPA repositories
│   ├── service/          # Business logic
│   └── util/             # JWT utilities
├── src/main/resources/
│   ├── application.yaml  # Configuración
│   └── data.sql          # Datos iniciales
├── build.gradle          # Dependencias
├── JWT_SETUP.md          # Guía JWT completa
├── API_ENDPOINTS.md      # Referencia de API
├── PROJECT_SUMMARY.md    # Resumen del proyecto
└── QUICK_REFERENCE.md    # Este archivo
```

---

## 🔐 Tokens JWT

### Guardar tokens del login
```bash
RESPONSE=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "juan", "password": "password123"}')

ACCESS_TOKEN=$(echo $RESPONSE | jq -r '.accessToken')
REFRESH_TOKEN=$(echo $RESPONSE | jq -r '.refreshToken')

echo "Access Token: $ACCESS_TOKEN"
echo "Refresh Token: $REFRESH_TOKEN"
```

### Decodificar token (para debug)
```bash
echo $ACCESS_TOKEN | jwt decode -
```

O online: https://jwt.io/

---

## 🛠️ Solución de Problemas

### Error: Connection refused
```bash
# Verificar que PostgreSQL esté corriendo
brew services list
brew services start postgresql

# O verificar si hay otro proceso en puerto 8080
lsof -i :8080
```

### Error: Database "flashybank" does not exist
```bash
psql -U postgres -c "CREATE DATABASE flashybank;"
```

### Verificar logs de la aplicación
```bash
./gradlew bootRun 2>&1 | tee output.log
```

### Limpiar base de datos
```bash
psql -U postgres -d flashybank -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
```

---

## 📝 Archivos de Configuración

### application.yaml
```yaml
jwt.secret: claveSuperSecretaParaFirmarTokens...
jwt.expiration: 604800000 # 7 días
jwt.refresh-expiration: 1209600000 # 14 días

spring.datasource.url: jdbc:postgresql://localhost:5432/flashybank
spring.datasource.username: postgres
spring.datasource.password: root
```

---

## 🎯 Endpoints Resumen

| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Registrar usuario |
| POST | `/api/auth/login` | No | Login |
| POST | `/api/auth/refresh` | No | Refresh token |
| GET | `/api/hello` | No | Test público |
| GET | `/api/protected` | Sí | Test protegido |

---

## 📚 Recursos

- **Spring Security**: https://docs.spring.io/spring-security/reference/
- **JJWT**: https://github.com/jwtk/jjwt
- **Spring Boot**: https://spring.io/projects/spring-boot

---

## 🔄 Roadmap

```
✅ Paso 1: Configuración Base
✅ Paso 2: JWT Authentication (ESTE PASO)
⏭️  Paso 3: Transfer Service (SIGUIENTE)
🔮 Paso 4: React Native App
🔮 Paso 5: Testing & Deploy
```

---

## 📞 Contacto

Para dudas o problemas con la implementación, consulta:
1. `JWT_SETUP.md` - Guía completa de implementación
2. `API_ENDPOINTS.md` - Referencia de endpoints
3. `PROJECT_SUMMARY.md` - Resumen visual del proyecto
