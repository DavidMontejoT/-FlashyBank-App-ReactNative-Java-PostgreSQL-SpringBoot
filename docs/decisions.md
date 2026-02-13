# 📋 Architecture Decision Records (ADR)

**Proyecto:** FlashyBank
**Versión:** 1.0.0
**Fecha:** 2025-02-12

---

## Índice de Decisiones

- [ADR-001: ¿Por qué React Native + Expo?](#adr-001)
- [ADR-002: ¿Por qué Spring Boot?](#adr-002)
- [ADR-003: ¿Por qué PostgreSQL?](#adr-003)
- [ADR-004: ¿Por qué JWT con Refresh Tokens?](#adr-004)
- [ADR-005: ¿Por qué Quick Mode de 2 horas?](#adr-005)
- [ADR-006: ¿Por qué Sistema de Temas con 4 Paletas?](#adr-006)

---

## ADR-001: ¿Por qué React Native + Expo?

**Fecha:** 2025-01-15
**Estado:** Aceptado
**Decisión por:** Equipo de Arquitectura

### Contexto

FlashyBank necesita una app móvil que funcione tanto en iOS como en Android. El mercado objetivo es amplio y el tiempo de desarrollo es crítico.

### Opciones Consideradas

| Opción | Ventajas | Desventajas |
|--------|----------|-------------|
| **React Native + Expo** | • Una sola codebase<br>• Desarrollo rápido<br>• OTA updates<br>• Gran ecosistema | • Performance nativa<br>• Tamaño de app |
| **React Native CLI** | • Más control<br>• Módulos nativos | • Dos codebases<br>• Más lento |
| **Flutter** | • Performance nativa<br>• Una sola codebase | • Lenguaje Dart<br>• Ecosistema menor |
| **Nativas (Swift + Kotlin)** | • Máxima performance<br>• APIs completas | • Dos codebases<br>• Muy costoso |

### Decisión

**Elegimos React Native + Expo** por las siguientes razones:

1. **Una sola codebase para iOS y Android**
   - Ahorra ~50% de tiempo de desarrollo
   - Menor costo de mantenimiento
   - Paridad de features entre plataformas

2. **Expo SDK**
   - Configuración cero
   - Acceso a APIs nativas (cámara, biometría, etc.)
   - OTA updates (sin aprobar en stores)

3. **React Native Paper**
   - Componentes Material Design ya estilizados
   - Soporte de temas nativo
   - Accesibilidad incluida

4. **Ecosistema maduro**
   - Axios (HTTP client)
   - React Navigation (navegación)
   - Expo SecureStore (almacenamiento seguro)
   - Expo Local Authentication (biometría)

5. **Talento disponible**
   - Fácil encontrar desarrolladores React
   - Comunidad activa

### Consecuencias

**Positivas:**
- ✅ Desarrollo 50% más rápido
- ✅ Menor costo de mantenimiento
- ✅ OTA updates para hotfixes
- ✅ Componentes UI listos (RN Paper)

**Negativas:**
- ⚠️ App más pesada (~50MB)
- ⚠️ Performance ~10% menor que nativa
- ⚠️ Dependencia de Expo

### Mitigaciones

- Usar **Lazy Loading** para reducir tamaño
- Optimizar imágenes y assets
- Usar **Hermes** (JS engine optimizado)
- **Eject** solo si es necesario (módulos nativos custom)

---

## ADR-002: ¿Por qué Spring Boot?

**Fecha:** 2025-01-10
**Estado:** Aceptado
**Decisión por:** Equipo de Backend

### Contexto

FlashyBank necesita un backend robusto, seguro y escalable para manejar transacciones bancarias. El tiempo de desarrollo es importante, pero la seguridad y confiabilidad son críticas.

### Opciones Consideradas

| Opción | Ventajas | Desventajas |
|--------|----------|-------------|
| **Spring Boot** | • Seguridad empresarial<br>• Ecosistema masivo<br>• Probado en banca | • Verbosidad<br>• Consumo de memoria |
| **Node.js + Express** | • Rápido desarrollo<br>• JS fullstack | • Menor seguridad<br>• Event loop (bloqueo) |
| **Django + DRF** | • Rápido desarrollo<br>• Admin incluido | • Menor ecosistema<br>• GIL |
| **Go + Gin** | • Performance máxima<br>• Binario pequeño | • Ecosistema menor<br>• Curva de aprendizaje |

### Decisión

**Elegimos Spring Boot 3.5.10** por las siguientes razones:

1. **Seguridad empresarial**
   - **Spring Security** está probado en banca
   - Autenticación y autorización robustas
   - Protección contra CVEs (Common Vulnerabilities)

2. **Ecosistema probado en banca**
   - JPA (Hibernate) para transacciones ACID
   - Spring Data JPA para repositories
   - Validaciones Jakarta
   - Manejo de excepciones robusto

3. **Productividad**
   - Auto-configuración
   - Starters (dependencias pre-configuradas)
   - Actuator (métricas y health checks)

4. **Escalabilidad**
   - Soporte nativo para **distribuidos**
   - Caching con Redis
   - Message queues (RabbitMQ, Kafka)

5. **Talento disponible**
   - Fácil encontrar desarrolladores Java
   - Documentación extensiva
   - Comunidad masiva

### Consecuencias

**Positivas:**
- ✅ Seguridad de grado empresarial
- ✅ Transacciones ACID (crítico para banca)
- ✅ Escalabilidad horizontal
- ✅ Ecosistema probado

**Negativas:**
- ⚠️ Consumo de memoria (~200MB base)
- ⚠️ Startup time (~3-5 segundos)
- ⚠️ Verbosidad de código

### Mitigaciones

- Usar **GraalVM** para compilar a nativo (startup ~0.1s)
- **Lazy Initialization** de beans
- **Profile-based config** (dev, prod)
- **Docker** para despliegue consistente

---

## ADR-003: ¿Por qué PostgreSQL?

**Fecha:** 2025-01-12
**Estado:** Aceptado
**Decisión por:** Equipo de Datos

### Contexto

FlashyBank necesita una base de datos relacional para manejar transacciones bancarias. La consistencia de datos es crítica (no se puede perder dinero).

### Opciones Consideradas

| Opción | Ventajas | Desventajas |
|--------|----------|-------------|
| **PostgreSQL** | • ACID completo<br>• JSONB<br>• Extensiones | • Configuración |
| **MySQL** | • Popular<br>• Fácil de usar | • Menos features |
| **MongoDB** | • Flexible<br>• Escalable | • No ACID<br>• Consistencia eventual |
| **Oracle** | • Empresarial<br>• Robusto | • Costoso<br>• Complejo |

### Decisión

**Elegimos PostgreSQL 15+** por las siguientes razones:

1. **ACID completo**
   - Atomicity: Las transacciones son atómicas
   - Consistency: Datos siempre consistentes
   - Isolation: Transacciones aisladas
   - Durability: Datos persistentes

2. **JSONB**
   - Guardar datos flexibles (ej: metadata de transacciones)
   - Indexación de JSON
   - Queries híbridas (relacional + JSON)

3. **Extensiones**
   - **pg_cron**: Jobs programados
   - **pg_stat_statements**: Monitoreo de queries
   - **PostGIS**: Ubicaciones (futuro)

4. **Open Source**
   - Sin costos de licencia
   - Comunidad activa
   - Actualizaciones frecuentes

5. **Probado en banca**
   - Muchas fintech usan PostgreSQL
   - Robusto y confiable

### Consecuencias

**Positivas:**
- ✅ Consistencia ACID (crítico para dinero)
- ✅ JSONB para flexibilidad
- ✅ Extensiones potentes
- ✅ Open source

**Negativas:**
- ⚠️ Requiere tuning para alta carga
- ⚠️ Requiere backups y replicación

### Mitigaciones

- **Replicación** (streaming replication)
- **Backups automáticos** (WAL archiving)
- **Connection pooling** (PgBouncer)
- **Monitoring** (pgAdmin, Prometheus)

---

## ADR-004: ¿Por qué JWT con Refresh Tokens?

**Fecha:** 2025-01-14
**Estado:** Aceptado
**Decisión por:** Equipo de Seguridad

### Contexto

FlashyBank necesita un sistema de autenticación que sea seguro, pero también conveniente para los usuarios. No queremos que hagan login constantemente.

### Opciones Consideradas

| Opción | Ventajas | Desventajas |
|--------|----------|-------------|
| **JWT + Refresh Token** | • Sin sesiones<br>• Escalable<br>• Login infrecuente | • Revocación compleja |
| **Session-based** | • Revocación fácil<br>• Simple | • Almacenamiento server<br>• No escalable |
| **OAuth 2.0** | • Estándar<br>• Integraciones | • Complejo<br>• Overkill |
| **API Key** | • Simple | • Inseguro<br>• No expira |

### Decisión

**Elegimos JWT con Refresh Tokens** por las siguientes razones:

1. **Stateless**
   - No requiere almacenamiento server
   - Escalable horizontalmente
   - Ideal para microservicios

2. **Expiración diferida**
   - **Access Token**: 7 días (uso diario)
   - **Refresh Token**: 14 días (renovación sin login)
   - Balance seguridad / UX

3. **Token Blacklist**
   - Soluciona el problema de revocación
   - Logout proper
   - Tokens invalidados inmediatamente

4. **Compacto**
   - Solo un header en requests HTTP
   - Ahorra ancho de banda
   - Más rápido que cookies

5. **Estándar**
   - RFC 7519
   - Librerías en todos los lenguajes
   - Fácil de implementar

### Consecuencias

**Positivas:**
- ✅ Escalable (stateless)
- ✅ Login infrecuente (14 días)
- ✅ Token blacklist (revocación)
- ✅ Compacto (un header)

**Negativas:**
- ⚠️ Requiere blacklist para logout
- ⚠️ Requiere storage seguro en mobile

### Mitigaciones

- **SecureStore** (Expo) para almacenar tokens
- **Token blacklist** en BD (logout)
- **Auto-refresh** cuando access expira
- **HTTPS** obligatorio en producción

---

## ADR-005: ¿Por qué Quick Mode de 2 horas?

**Fecha:** 2025-01-20
**Estado:** Aceptado
**Decisión por:** Equipo de Producto

### Contexto

FlashyBank quiere mejorar la experiencia de usuarios que hacen transferencias frecuentes. El flujo normal es de 2 pasos (iniciar + confirmar), lo cual puede ser tedioso.

### Opciones Consideradas

| Opción | Ventajas | Desventajas |
|--------|----------|-------------|
| **Quick Mode 2 horas** | • UX mejorada<br>• Seguridad razonable | • Complejidad |
| **Quick Mode 24 horas** | • Más conveniente | • Menor seguridad |
| **Sin Quick Mode** | • Simple | • Peor UX |
| **Recordar destinatarios** | • Simple | • Menos flexible |

### Decisión

**Elegimos Quick Mode de 2 horas** por las siguientes razones:

1. **Balance seguridad / UX**
   - 2 horas es suficiente para un día de trabajo
   - No es tan largo como comprometer seguridad
   - Requiere activación con biometría

2. **Ahorro de tiempo**
   - Usuarios frecuentes ahorran 1 paso por transferencia
   - Ejemplo: 10 transferencias → 10 pasos menos
   - **ROI positivo en UX**

3. **Segmentación de usuarios**
   - Usuarios ocasionales: modo normal
   - Usuarios frecuentes: quick mode
   - **Personalización de experiencia**

4. **Seguridad mantenida**
   - Requiere biometría para activar
   - Expira automáticamente
   - Límite de monto ($500 max)

5. **Psicología**
   - **Limitado**: no es permanente
   - **Exclusivo**: se siente premium
   - **Opcional**: usuario decide

### Consecuencias

**Positivas:**
- ✅ UX mejorada para frecuentes
- ✅ Diferenciación de competencia
- ✅ Seguridad razonable

**Negativas:**
- ⚠️ Complejidad adicional
- ⚠️ Requiere biometría

### Mitigaciones

- **Límite de monto** ($500 max en quick mode)
- **Activación con biometría** (no automática)
- **Expiración automática** (2 horas)
- **Desactivación manual** (usuario control)

---

## ADR-006: ¿Por qué Sistema de Temas con 4 Paletas?

**Fecha:** 2025-01-22
**Estado:** Aceptado
**Decisión por:** Equipo de Diseño

### Contexto

FlashyBank quiere destacar por su diseño visual. La mayoría de apps bancarias son aburridas (blanco/azul). Queremos ofrecer personalización.

### Opciones Consideradas

| Opción | Ventajas | Desventajas |
|--------|----------|-------------|
| **4 Paletas** | • Diferenciación<br>• Personalización | • Complejidad |
| **2 Paletas (Light/Dark)** | • Simple<br>• Estándar | • No diferencia |
| **Tema Custom** | • Máxima flexibilidad | • Muy complejo |
| **Sin temas** | • Simple | • Aburrido |

### Decisión

**Elegimos 4 Paletas (Light, Dark, Midnight, Sunset)** por las siguientes razones:

1. **Diferenciación**
   - La mayoría de apps bancarias son aburridas
   - **FlashyBank es revolucionaria** en diseño
   - **Marketing**: "4 temas para tu mood"

2. **Personalización**
   - **Light**: Día productivo
   - **Dark**: Noche
   - **Midnight**: Elegante, premium
   - **Sunset**: Cálido, amigable

3. **Psicología del color**
   - **Azul (Light/Dark)**: Confianza, banca
   - **Púrpura/Dorado (Midnight)**: Premium, exclusivo
   - **Naranja/Rosa (Sunset)**: Cálido, amigable

4. **Tendencias 2025**
   - Dark mode es estándar
   - Temas custom son trending
   - Gen Z quiere personalización

5. **React Native Paper**
   - Soporte nativo de temas
   - Cambio dinámico
   - Persistencia fácil

### Consecuencias

**Positivas:**
- ✅ Diferenciación de competencia
- ✅ Personalización
- ✅ Marketing (4 temas)
- ✅ Trending en 2025

**Negativas:**
- ⚠️ Complejidad adicional
- ⚠️ Testing de 4 temas

### Mitigaciones

- **Tema por defecto** (Light) para nuevos usuarios
- **Persistencia** (AsyncStorage)
- **Cambio dinámico** (sin reiniciar app)
- **Componentes temáticos** (RN Paper)

---

## 📊 Resumen de Decisiones

| ADR | Decisión | Impacto |
|-----|----------|----------|
| **ADR-001** | React Native + Expo | Desarrollo 50% más rápido |
| **ADR-002** | Spring Boot 3.5.10 | Seguridad empresarial |
| **ADR-003** | PostgreSQL 15+ | Consistencia ACID |
| **ADR-004** | JWT + Refresh Token | Login cada 14 días |
| **ADR-005** | Quick Mode 2 horas | UX mejorada |
| **ADR-006** | 4 Paletas de temas | Diferenciación |

---

## 🔄 Proceso de ADR

### Plantilla

```markdown
## ADR-XXX: [Título]

**Fecha:** YYYY-MM-DD
**Estado:** [Propuesto | Aceptado | Rechazado]
**Decisión por:** [Rol]

### Contexto
[Descripción del problema]

### Opciones Consideradas
| Opción | Ventajas | Desventajas |
|--------|----------|-------------|
| ... | ... | ... |

### Decisión
[Elegimos X porque...]

### Consecuencias
**Positivas:**
- ✅ ...
**Negativas:**
- ⚠️ ...

### Mitigaciones
- ...
```

### Flujo

```
1. PROPUESTO
   └─ Problema identificado
   └─ Opciones consideradas

2. REVISIÓN
   └─ Equipo de arquitectura revisa
   └─ Se solicita feedback

3. DECISIÓN
   └─ Aceptado / Rechazado
   └─ Documentado en docs/decisions.md
```

---

**Última actualización:** 2025-02-12
**Versión:** 1.0.0
