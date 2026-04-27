# GUÍA DE EJECUCIÓN SEGURA DE TESTS

## CRÍTICO: Tu BD de producción está siendo borrada por los tests

Por favor, sigue EXACTAMENTE estos pasos para arreglarlo:

---

## PASO 1: Instalar Firestore Emulator

El Firestore Emulator mantiene los tests en una BD completamente separada, EN MEMORIA, que NO afecta producción.

```bash
# Instalar Firebase CLI si no lo tienes
npm install -g firebase-tools

# Inicializar Firebase en el proyecto raíz (si no está ya)
firebase init

# Descargar el emulador
firebase emulators:start --only firestore
```

**IMPORTANTE:** Mantén este terminal abierto. El emulador debe estar ejecutándose mientras corres tests.

---

## PASO 2: Ejecutar Tests CORRECTAMENTE

Abre OTRO terminal en la carpeta `auth-service` y corre:

```bash
# Opción 1: Con NODE_ENV=test (recomendado)
NODE_ENV=test npm test

# Opción 2: En Windows (PowerShell)
$env:NODE_ENV='test'; npm test

# Opción 3: En Windows (CMD)
set NODE_ENV=test && npm test
```

---

## PASO 3: Verificar que todo está correctamente aislado

Cuando veas este output, estás 100% protegido:

```
════════════════════════════════════════════════════════
AMBIENTE DE TESTING CONFIGURADO
════════════════════════════════════════════════════════
NODE_ENV: test
Emulador: localhost:8080
Proyecto: test-project
════════════════════════════════════════════════════════
```

Si NO ves esto, **DETENTE INMEDIATAMENTE** y verifica:
1. ¿NODE_ENV está configurado como "test"?
2. ¿El Firestore Emulator está corriendo?

---

## ✓ Verificación: Confirmar que no afecta producción

Para confirmar que los tests NO tocan tu BD real:

1. **Abre Firebase Console** en el navegador
2. **Verifica que tus colecciones de usuarios siguen intactas**
3. Los tests solo modifican la BD del EMULADOR (puerto 8080)

---

## QUÉ NO HACER

**NO hagas esto:**
```bash
npm test                    # Sin NODE_ENV=test, podrías usar BD real
npx jest --watch           # Podrías usar BD real sin protección
```

**NO ejecutes tests si:**
- No ves "localhost:8080" en FIRESTORE_EMULATOR_HOST
- No ves "test-project" en el output
- NODE_ENV no es "test"

---

## Si Algo Falla

### Error: "FALLO CRÍTICO: NODE_ENV no es 'test'"
```bash
# Solución: Configura NODE_ENV correctamente
NODE_ENV=test npm test
```

### Error: "FALLO CRÍTICO: FIRESTORE_EMULATOR_HOST no apunta a localhost"
```bash
# Solución 1: Inicia el emulador
firebase emulators:start --only firestore

# Solución 2: En otro terminal, ejecuta tests
NODE_ENV=test FIRESTORE_EMULATOR_HOST=localhost:8080 npm test
```

### Error: "Port 8080 already in use"
```bash
# Encuentra el proceso
lsof -i :8080          # macOS/Linux
netstat -ano | findstr :8080   # Windows

# Mata el proceso
kill -9 <PID>          # macOS/Linux
taskkill /PID <PID> /F # Windows
```

---

## Scripts Disponibles

```bash
npm test                    # Todos los tests (NODE_ENV=test requerido)
npm run test:integration   # Solo tests de integración
npm run test:watch        # Modo watch
npm run test:coverage     # Ver cobertura
```

---

## Resumen de Seguridad

| Componente | BD Real (Producción) | BD Emulador (Tests) |
|---|---|---|
| **Ubicación** | Cloud Firestore remoto | localhost:8080 local |
| **Datos** | Usuarios reales | Datos de prueba EN MEMORIA |
| **Persistencia** | Permanente | Se borra cuando terminas |
| **Aislamiento** | ✗ Accesible desde código | ✓ AISLADA de aplicación |

---

## Verificación Final

Antes de considerar "resuelto" el problema:

- [ ] Firestore Emulator corriendo (`firebase emulators:start`)
- [ ] Tests ejecutándose con `NODE_ENV=test npm test`
- [ ] Output muestra "localhost:8080" y "test-project"
- [ ] Tu BD de producción NO tiene cambios después de tests
- [ ] El .env.test está configurado correctamente

Si todos los checkboxes están marcados, ¡estás COMPLETAMENTE PROTEGIDO!

---

## Documentación Adicional

Ver los siguientes archivos para más detalles:

- [README.md](./README.md) - Estructura de tests
