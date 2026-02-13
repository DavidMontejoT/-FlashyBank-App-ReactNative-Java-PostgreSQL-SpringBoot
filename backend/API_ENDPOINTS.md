# FlashyBank API - Reference Document

## Base URL
```
http://localhost:8080
```

## Authentication Endpoints

### 1. Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "juan",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJqdWFuIiwiaWF0IjoxNzM5MjA...",
  "refreshToken": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJqdWFuIiwiaWF0IjoxNzM5MjA...",
  "username": "juan",
  "role": "USER"
}
```

### 2. Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "juan",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJqdWFuIiwiaWF0IjoxNzM5MjA...",
  "refreshToken": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJqdWFuIiwiaWF0IjoxNzM5MjA...",
  "username": "juan",
  "role": "USER"
}
```

### 3. Refresh Token
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJqdWFuIiwiaWF0IjoxNzM5MjA..."
}
```

**Response (200 OK):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJqdWFuIiwiaWF0IjoxNzM5MjA...",
  "refreshToken": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJqdWFuIiwiaWF0IjoxNzM5MjA...",
  "username": "juan",
  "role": "USER"
}
```

## Test Endpoints

### 1. Public Hello (No Authentication Required)
```http
GET /api/hello
```

**Response (200 OK):**
```json
{
  "message": "Hola desde FlashyBank - API funcionando!",
  "status": "online"
}
```

### 2. Protected Endpoint (Authentication Required)
```http
GET /api/protected
Authorization: Bearer <access_token>
```

**Response (200 OK):**
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

## Error Responses

### 400 Bad Request
```json
{
  "timestamp": "2025-02-10T12:00:00.000+00:00",
  "status": 400,
  "error": "Bad Request",
  "message": "El username es obligatorio",
  "path": "/api/auth/login"
}
```

### 401 Unauthorized
```json
{
  "timestamp": "2025-02-10T12:00:00.000+00:00",
  "status": 401,
  "error": "Unauthorized",
  "message": "Credenciales inválidas",
  "path": "/api/auth/login"
}
```

### 409 Conflict (Username already exists)
```json
{
  "timestamp": "2025-02-10T12:00:00.000+00:00",
  "status": 409,
  "error": "Conflict",
  "message": "El username ya está en uso",
  "path": "/api/auth/register"
}
```

## Authentication Flow

```
1. User registers
   → Client: POST /api/auth/register
   ← Server: Returns accessToken + refreshToken

2. User logs in
   → Client: POST /api/auth/login
   ← Server: Returns accessToken + refreshToken

3. Access protected endpoint
   → Client: GET /api/protected
   Header: Authorization: Bearer <accessToken>
   ← Server: Returns protected data

4. Access token expires (after 7 days)
   → Client: POST /api/auth/refresh
   Body: { "refreshToken": "<refreshToken>" }
   ← Server: Returns new accessToken + refreshToken
```

## Token Expiration

- **Access Token**: 7 days (604800000 ms)
- **Refresh Token**: 14 days (1209600000 ms)

## Postman Collection

You can import these endpoints into Postman:

```json
{
  "info": {
    "name": "FlashyBank API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Register",
          "request": {
            "method": "POST",
            "header": [],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"username\": \"juan\",\n  \"password\": \"password123\"\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            },
            "url": {
              "raw": "localhost:8080/api/auth/register",
              "host": ["localhost"],
              "port": "8080",
              "path": ["api", "auth", "register"]
            }
          }
        },
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "header": [],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"username\": \"juan\",\n  \"password\": \"password123\"\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            },
            "url": {
              "raw": "localhost:8080/api/auth/login",
              "host": ["localhost"],
              "port": "8080",
              "path": ["api", "auth", "login"]
            }
          }
        },
        {
          "name": "Refresh Token",
          "request": {
            "method": "POST",
            "header": [],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"refreshToken\": \"your_refresh_token_here\"\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            },
            "url": {
              "raw": "localhost:8080/api/auth/refresh",
              "host": ["localhost"],
              "port": "8080",
              "path": ["api", "auth", "refresh"]
            }
          }
        }
      ]
    },
    {
      "name": "Test",
      "item": [
        {
          "name": "Public Hello",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "localhost:8080/api/hello",
              "host": ["localhost"],
              "port": "8080",
              "path": ["api", "hello"]
            }
          }
        },
        {
          "name": "Protected Endpoint",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer your_access_token_here"
              }
            ],
            "url": {
              "raw": "localhost:8080/api/protected",
              "host": ["localhost"],
              "port": "8080",
              "path": ["api", "protected"]
            }
          }
        }
      ]
    }
  ]
}
```
