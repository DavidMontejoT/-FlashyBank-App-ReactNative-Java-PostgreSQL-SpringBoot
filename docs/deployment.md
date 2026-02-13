# 🚀 Guía de Deployment de FlashyBank

**Versión:** 1.0.0
**Última actualización:** 2025-02-12

---

## 📋 Tabla de Contenidos

- [Requerimientos de Producción](#requerimientos-de-producción)
- [Variables de Entorno](#variables-de-entorno)
- [Deployment del Backend](#deployment-del-backend)
- [Deployment de la App Móvil](#deployment-de-la-app-móvil)
- [Monitoreo y Logging](#monitoreo-y-logging)
- [Base de Datos](#base-de-datos)
- [Seguridad](#seguridad)

---

## 🖥️ Requerimientos de Producción

### Backend

| Requerimiento | Mínimo | Recomendado |
|---------------|---------|-------------|
| **CPU** | 2 vCPU | 4 vCPU |
| **RAM** | 2 GB | 4 GB |
| **Disco** | 20 GB | 50 GB SSD |
| **OS** | Ubuntu 22.04 | Ubuntu 22.04 LTS |
| **Java** | 21 | 21 |
| **PostgreSQL** | 15 | 15+ |

### Mobile Build

| Requerimiento | Versión |
|---------------|---------|
| **Node.js** | 18+ |
| **Expo CLI** | 6+ |
| **EAS Build** | Latest |

### Infraestructura

| Servicio | Propósito |
|----------|-----------|
| **VPS / Cloud** | Hosting del backend |
| **PostgreSQL** | Base de datos |
| **Docker** | Contenedores |
| **Nginx** | Reverse proxy |
| **SSL** | HTTPS (Let's Encrypt) |

---

## 🔧 Variables de Entorno

### Backend (`application-prod.yaml`)

```yaml
spring:
  datasource:
    url: ${DB_URL}
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}

jwt:
  secret: ${JWT_SECRET}  # Mínimo 256 bits
  expiration: 604800000  # 7 días (ms)
  refresh-expiration: 1209600000  # 14 días (ms)

server:
  port: 8080
  error:
    include-message: never  # No exponer mensajes de error
    include-stacktrace: never  # No exponer stacktraces

logging:
  level:
    com.flashybank: INFO
    org.springframework.security: WARN
  file:
    name: /var/log/flashybank/app.log
```

### Variables Requridas

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `DB_URL` | URL de PostgreSQL | `jdbc:postgresql://localhost:5432/flashybank` |
| `DB_USERNAME` | Usuario de BD | `flashybank_user` |
| `DB_PASSWORD` | Password de BD | `password_seguro_123` |
| `JWT_SECRET` | Clave secreta JWT | `claveSuperSecretaMinimo256Bits...` |

### App Móvil (`app.config.js`)

```javascript
export default {
  expo: {
    extra: {
      apiUrl: process.env.API_URL || 'https://api.flashybank.com',
    },
  },
};
```

### Variables Requridas

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `API_URL` | URL base de API | `https://api.flashybank.com` |

---

## 🐳 Deployment del Backend

### Opción 1: Docker + Docker Compose

#### 1. Crear `Dockerfile`

```dockerfile
# Backend/Dockerfile
FROM openjdk:21-jdk-slim

WORKDIR /app

# Copiar archivos
COPY build.gradle settings.gradle gradlew ./
COPY gradle gradle
COPY src src
COPY build/build/libs/*.jar app.jar

# Exponer puerto
EXPOSE 8080

# Ejecutar
ENTRYPOINT ["java", "-jar", "app.jar"]
```

#### 2. Crear `docker-compose.yml`

```yaml
version: '3.8'

services:
  db:
    image: postgres:15
    container_name: flashybank_db
    environment:
      POSTGRES_DB: flashybank
      POSTGRES_USER: flashybank_user
      POSTGRES_PASSWORD: password_seguro_123
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: always

  backend:
    build: ./backend
    container_name: flashybank_backend
    environment:
      DB_URL: jdbc:postgresql://db:5432/flashybank
      DB_USERNAME: flashybank_user
      DB_PASSWORD: password_seguro_123
      JWT_SECRET: claveSuperSecretaMinimo256BitsParaFirmarTokensJWT
    depends_on:
      - db
    ports:
      - "8080:8080"
    restart: always

volumes:
  postgres_data:
```

#### 3. Desplegar

```bash
# Build
docker-compose build

# Up
docker-compose up -d

# Logs
docker-compose logs -f backend

# Down
docker-compose down
```

---

### Opción 2: VPS + Systemd

#### 1. Subir al servidor

```bash
scp -r backend/ user@vps.example.com:/opt/flashybank/
```

#### 2. Crear servicio systemd

```bash
# /etc/systemd/system/flashybank.service
[Unit]
Description=FlashyBank Backend
After=syslog.target network.target

[Service]
User=flashybank
WorkingDirectory=/opt/flashybank
ExecStart=/opt/flashybank/gradlew bootRun
SuccessExitStatus=143
TimeoutStopSec=10
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

#### 3. Habilitar servicio

```bash
sudo systemctl daemon-reload
sudo systemctl enable flashybank
sudo systemctl start flashybank
sudo systemctl status flashybank
```

---

### Opción 3: Cloud (AWS, GCP, Azure)

#### AWS ECS

```json
{
  "family": "flashybank",
  "containerDefinitions": [
    {
      "name": "backend",
      "image": "flashybank/backend:latest",
      "memory": 2048,
      "cpu": 512,
      "essential": true,
      "portMappings": [
        {
          "containerPort": 8080,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "DB_URL",
          "value": "jdbc:postgresql://rds.amazonaws.com:5432/flashybank"
        },
        {
          "name": "JWT_SECRET",
          "value": "claveSuperSecreta..."
        }
      ]
    }
  ]
}
```

#### Google Cloud Run

```bash
# Build imagen
gcloud builds submit --tag gcr.io/PROJECT_ID/flashybank

# Desplegar
gcloud run deploy flashybank \
  --image gcr.io/PROJECT_ID/flashybank \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars DB_URL=...,JWT_SECRET=...
```

---

## 📱 Deployment de la App Móvil

### Opción 1: EAS Build (Recomendado)

#### 1. Configurar EAS

```bash
# Instalar EAS CLI
npm install -g eas-cli

# Login
eas login

# Configurar proyecto
eas build:configure
```

#### 2. Crear `eas.json`

```json
{
  "cli": {
    "version": ">= 5.2.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      },
      "ios": {
        "buildConfiguration": "Release"
      }
    }
  }
}
```

#### 3. Build para iOS

```bash
eas build --platform ios --profile production
```

**Requisitos:**
- Cuenta Apple Developer ($99/año)
- Certificados y Provisioning Profiles
- App Store Connect configurado

#### 4. Build para Android

```bash
eas build --platform android --profile production
```

**Requisitos:**
- Cuenta Google Play Console ($25 una vez)
- KeyStore de Android
- Google Play Console configurado

#### 5. Submit a Stores

```bash
# iOS
eas submit --platform ios --profile production

# Android
eas submit --platform android --profile production
```

---

### Opción 2: Local Build

#### iOS

```bash
# Requiere Mac con Xcode
cd mobile/
expo prebuild

# Abrir en Xcode
open ios/flashybank.xcworkspace

# Build desde Xcode
# Product > Archive
# Distribute to App Store
```

#### Android

```bash
# Build APK
cd mobile/
expo build:android --type apk

# Build App Bundle
expo build:android --type app-bundle

# Descargar desde Expo
# Subir a Google Play Console
```

---

## 📊 Monitoreo y Logging

### Backend Logging

#### Configuración Logback (`logback-spring.xml`)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <appender name="FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <file>/var/log/flashybank/app.log</file>
        <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
            <fileNamePattern>/var/log/flashybank/app.%d{yyyy-MM-dd}.log</fileNamePattern>
            <maxHistory>30</maxHistory>
        </rollingPolicy>
        <encoder>
            <pattern>%d{ISO8601} [%thread] %-5level %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>

    <root level="INFO">
        <appender-ref ref="FILE" />
    </root>
</configuration>
```

#### Monitoreo con Actuator

```yaml
# application-prod.yaml
management:
  endpoints:
    web:
      exposure:
        include: health,metrics,info
  endpoint:
    health:
      show-details: never  # No exponer detalles
```

**Endpoints:**
- `GET /actuator/health` - Health check
- `GET /actuator/metrics` - Métricas
- `GET /actuator/info` - Info de la app

### Mobile Logging

#### Sentry (Error Tracking)

```javascript
// App.js
import * as Sentry from 'sentry-expo';

Sentry.init({
  dsn: 'https://xxx@sentry.io/xxx',
  enableInExpoDevelopment: false,
  debug: __DEV__,
});
```

#### Firebase Analytics

```javascript
import analytics from '@react-native-firebase/analytics';

// Track event
await analytics().logEvent('transfer_completed', {
  amount: 150.50,
  receiver: 'mariagarcia',
});
```

---

## 🗄️ Base de Datos

### Backup Automático

#### Script de Backup

```bash
#!/bin/bash
# /opt/flashybank/backup-db.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR=/opt/backups/flashybank
DB_NAME=flashybank
DB_USER=flashybank_user

mkdir -p $BACKUP_DIR

pg_dump -U $DB_USER $DB_NAME | gzip > $BACKUP_DIR/flashybank_$DATE.sql.gz

# Mantener últimos 30 días
find $BACKUP_DIR -name "flashybank_*.sql.gz" -mtime +30 -delete
```

#### Cron Job

```bash
# Backup diario a las 3 AM
0 3 * * * /opt/flashybank/backup-db.sh
```

### Replicación

#### Master-Slave

```bash
# postgresql.conf (Master)
wal_level = replica
max_wal_senders = 3
max_replication_slots = 3

# pg_hba.conf (Master)
host replication repl_user 0.0.0.0/0 md5
```

```bash
# recovery.conf (Slave)
standby_mode = on
primary_conninfo = 'host=master_ip port=5432 user=repl_user'
```

---

## 🔒 Seguridad

### Nginx Reverse Proxy

#### Configuración

```nginx
# /etc/nginx/sites-available/flashybank
server {
    listen 80;
    server_name api.flashybank.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.flashybank.com;

    ssl_certificate /etc/letsencrypt/live/api.flashybank.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.flashybank.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### Habilitar

```bash
sudo ln -s /etc/nginx/sites-available/flashybank /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### SSL con Let's Encrypt

```bash
# Instalar certbot
sudo apt install certbot python3-certbot-nginx

# Obtener certificado
sudo certbot --nginx -d api.flashybank.com

# Renovación automática (cron)
0 0 * * * certbot renew --quiet
```

### Firewall

```bash
# UFW (Ubuntu)
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### Seguridad del Backend

#### 1. JWT Secret Seguro

```bash
# Generar secret
openssl rand -base64 64
```

#### 2. Variables de Entorno (no en código)

```bash
# /opt/flashybank/.env
DB_URL=jdbc:postgresql://...
DB_PASSWORD=password_seguro
JWT_SECRET=clave_super_secreta
```

```yaml
# application.yaml
spring:
  datasource:
    password: ${DB_PASSWORD}
jwt:
  secret: ${JWT_SECRET}
```

#### 3. CORS

```java
// SecurityConfig.java
@Override
public void addCorsMappings(CorsRegistry registry) {
    registry.addMapping("/**")
        .allowedOrigins("https://flashybank.com")  // Solo origen permitido
        .allowedMethods("GET", "POST", "PUT", "DELETE")
        .allowCredentials(true);
}
```

---

## 🧪 Testing Pre-Deployment

### Backend Tests

```bash
cd backend/

# Tests unitarios
./gradlew test

# Tests de integración
./gradlew integrationTest

# Coverage
./gradlew jacocoTestReport
```

### Mobile Tests

```bash
cd mobile/

# Tests unitarios
npm test

# Tests E2E con Detox
npm run test:e2e

# Build de prueba
eas build --profile preview
```

---

## 📋 Checklist de Deployment

### Backend

- [ ] Variables de entorno configuradas
- [ ] Base de datos creada y migrada
- [ ] JWT secret generado y seguro
- [ ] Firewall configurado
- [ ] Nginx configurado con SSL
- [ ] Logs configurados
- [ ] Monitoreo configurado
- [ ] Tests pasados
- [ ] Backup configurado

### Mobile

- [ ] API_URL de producción configurada
- [ ] Sentry/Firebase configurados
- [ ] Iconos y splash screens actualizados
- [ ] Versión incrementada
- [ ] Release notes escritas
- [ ] Tests pasados
- [ ] Build de prueba probado
- [ ] Screenshots preparados
- [ ] App Store / Play Store configurados

---

## 🔄 CI/CD Pipeline

### GitHub Actions (`.github/workflows/ci.yml`)

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up JDK 21
        uses: actions/setup-java@v3
        with:
          java-version: '21'
          distribution: 'temurin'
      - name: Run tests
        run: |
          cd backend
          ./gradlew test

  mobile:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Node
        uses: actions/setup-node@v3
        with:
          node-version: 18
      - name: Run tests
        run: |
          cd mobile
          npm install
          npm test
```

### GitHub Actions (`.github/workflows/cd.yml`)

```yaml
name: CD

on:
  push:
    tags:
      - 'v*'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /opt/flashybank
            git pull
            docker-compose up -d --build
```

---

## 📚 Recursos Adicionales

- [Spring Boot Deployment](https://spring.io/guides/topicals/spring-boot-docker/)
- [Expo EAS Build](https://docs.expo.dev/build/introduction/)
- [PostgreSQL Backup](https://www.postgresql.org/docs/current/backup.html)
- [Nginx Reverse Proxy](https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/)
- [Let's Encrypt](https://letsencrypt.org/)

---

**Última actualización:** 2025-02-12
**Versión:** 1.0.0
