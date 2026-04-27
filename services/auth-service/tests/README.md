# Auth Service - Integration Testing Documentation

## CRÍTICO: PROTECCIÓN CONTRA BD DE PRODUCCIÓN

**Los tests usan Firestore Emulator (BD en memoria completamente aislada).**

Si ejecutas tests sin seguir estos pasos, **PODRÍAS BORRAR DATOS DE PRODUCCIÓN**.

---

## Cómo Ejecutar Tests de Forma SEGURA

### PASO 1: Iniciar Firestore Emulator (Terminal 1)

```bash
firebase emulators:start --only firestore
```

Debes ver: `✓ firestore emulator started at http://localhost:8080`

**DEJA ESTE TERMINAL ABIERTO**

### PASO 2: Ejecutar Tests (Terminal 2)

En la carpeta `auth-service`:

**Opción A: macOS/Linux/WSL**
```bash
NODE_ENV=test npm test
```

**Opción B: Windows PowerShell**
```powershell
$env:NODE_ENV='test'; npm test
```

**Opción C: Windows CMD**
```cmd
set NODE_ENV=test && npm test
```

---

## Verificación de Seguridad

Cuando veas este output, **estás 100% protegido**:

```
════════════════════════════════════════════════════════
 AMBIENTE DE TESTING CONFIGURADO
════════════════════════════════════════════════════════
NODE_ENV: test
Emulador: localhost:8080
Proyecto: test-project
════════════════════════════════════════════════════════
```

Y en la BD:

```
✓ Conectando a Firestore Emulator: localhost:8080 (TEST)
✓ Proyecto de test: test-project
✓ PROTECCIÓN: BD completamente aislada en memoria
```

---

## Resumen

Este proyecto implementa una suite completa de pruebas de integración para validar los endpoints críticos del servicio de autenticación, garantizando que el contrato entre backend y cliente no se rompa con cambios futuros.

**Tecnologías:**
- Jest (Test Runner)
- Supertest (HTTP Client para tests)
- Firestore Emulator (BD aislada en memoria)

---

## Estructura de Carpetas

```
tests/
├── integration/                          # Tests de integración
│   ├── auth.domain-validation.test.js   # Validación de dominio @ucaldas.edu.co
│   ├── auth.token-validation.test.js    # Validación estructura JWT
│   ├── auth.error-handling.test.js      # Manejo de errores
│   ├── auth.security.test.js            # Headers y seguridad
│   └── auth.database-isolation.test.js  # Aislamiento BD
├── helpers/                              # Utilidades reutilizables
│   ├── jwtValidator.js                  # Validar JWTs
│   ├── tokenBuilder.js                  # Crear tokens mock
│   └── googleProfileMock.js             # Simular perfiles Google
├── fixtures/                             # Datos predefinidos
│   └── userFixtures.js                  # Usuarios de prueba
├── utils/                                # Configuración
│   └── setupTestDB.js                   # Setup BD aislada
├── jest.setup.js                        # Configuración global Jest
├── CRITERIOS_ACEPTACION.md              # Criterios de aceptación
├── CASOS_PRUEBA.md                      # Casos de prueba
├── GUIA_EJECUCION_SEGURA.md             # Guía de ejecución segura
└── README.md                            # Este archivo
```

---

## Criterios de Aceptación

### Obligatorios
- **Criterio 1:** GET /google - Validación de dominio
- **Criterio 5:** Uso de BD de prueba aislada (Firestore Emulator ✓)

### Propuestos por QA (Edge Cases)
- **Criterio 2:** Validación de token inválido/expirado
- **Criterio 3:** Estructura y validez del JWT: Token inválido o malformado
- **Criterio 4:** Manejo de errores 500
- **Criterio 6:** Headers de seguridad

---

## Scripts Disponibles

```bash
npm test                  # Todos los tests (REQUIERE NODE_ENV=test)
npm run test:integration # Solo tests de integración
npm run test:watch      # Modo watch (desarrollo)
npm run test:coverage   # Ver cobertura de tests

```

---

## Configuración de BD

### Producción
- **Ubicación:** Cloud Firestore remoto (Firebase)
- **Credenciales:** FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
- **Datos:** Usuarios reales

### Tests (Emulator)
- **Ubicación:** localhost:8080 (en memoria)
- **Credenciales:** Solo projectId de test
- **Datos:** En memoria, se borra al terminar
- **Aislamiento:** ✓ Completamente separado de producción

---

## Protecciones de Seguridad

El sistema tiene MÚLTIPLES capas de protección:

```javascript
// 1. setupTestDB.js valida NODE_ENV
if (process.env.NODE_ENV !== 'test') {
  throw new Error('NO SE PUEDE USAR BD DE PRODUCCIÓN')
}

// 2. Valida que Emulator está en localhost
if (!emulatorHost.includes('localhost')) {
  throw new Error('INTENTO DE CONECTAR A BD REMOTA')
}

// 3. DatabaseFactory elige BD según ambiente
if (process.env.NODE_ENV === 'test') {
  // Usa Emulator
} else {
  // Usa BD real con credenciales
}

// 4. jest.setup.js bloquea si NODE_ENV=production
if (process.env.NODE_ENV === 'production') {
  throw new Error('FALLO CRÍTICO: TESTS EN PRODUCCIÓN')
}
```

---

## Si Algo Falla

### "FALLO CRÍTICO: NODE_ENV no es test"
```bash
# Ejecuta con NODE_ENV correcto:
NODE_ENV=test npm test
```

### "FALLO CRÍTICO: FIRESTORE_EMULATOR_HOST no apunta a localhost"
```bash
# Inicia Firestore Emulator:
firebase emulators:start --only firestore

# En otro terminal:
NODE_ENV=test npm test
```

### "Port 8080 already in use"
```bash
# Encuentra el proceso:
lsof -i :8080          # macOS/Linux
netstat -ano | findstr :8080  # Windows

# Mata el proceso:
kill -9 <PID>          # macOS/Linux
taskkill /PID <PID> /F # Windows
```

---

## Flujo de Prueba Típico

```javascript
describe('Test Suite', () => {
  let db;

  beforeAll(() => {
    // Validar ambiente de test
    TestDatabaseSetup.validateTestEnvironment();
    // Inicializar BD aislada (Emulator)
    db = TestDatabaseSetup.initializeTestDB();
  });

  beforeEach(async () => {
    // Limpiar antes de cada test
    await TestDatabaseSetup.clearDatabase(db);
  });

  afterAll(async () => {
    // Finalizar conexión
    if (db) await db.terminate();
  });

  it('debe hacer algo', async () => {
    // Arrange: preparar datos
    const token = TokenBuilder.createValidDomainToken();

    // Act: ejecutar
    const response = await request(app)
      .post('/auth/google')
      .send({ token });

    // Assert: validar
    expect(response.status).toBe(200);
  });
});
```

---

## Principios de Separación de Responsabilidades

Cada archivo test se enfoca en UN aspecto:

- **domain-validation.test.js**: Reglas de negocio (dominio)
- **token-validation.test.js**: Estructura de tokens
- **user-persistence.test.js**: Operaciones en BD
- **error-handling.test.js**: Manejo de errores
- **security.test.js**: Políticas de seguridad
- **database-isolation.test.js**: Aislamiento de BD

---

## Checklist de Seguridad

Antes de considerar "resuelto" el problema:

- [ ] Firestore Emulator corriendo (`firebase emulators:start`)
- [ ] Tests ejecutándose con `NODE_ENV=test npm test`
- [ ] Output muestra "localhost:8080" y "test-project"
- [ ] BD de producción NO tiene cambios después de tests
- [ ] .env.test configurado solo con valores de test
- [ ] DatabaseFactory elige BD correcta según NODE_ENV

Si todos están marcados, ¡estás **COMPLETAMENTE PROTEGIDO**!

---

## Documentación Adicional

- [GUIA_EJECUCION_SEGURA.md](./GUIA_EJECUCION_SEGURA.md) - Guía paso a paso


