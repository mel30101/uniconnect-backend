#!/usr/bin/env bash

# SCRIPT DE PROTECCIÓN DE TESTS
# Ejecuta tests con protecciones contra usar BD de producción

# Detener en cualquier error
set -e

echo "════════════════════════════════════════════════════════"
echo "VERIFICACIÓN DE PROTECCIÓN CONTRA BD DE PRODUCCIÓN"
echo "════════════════════════════════════════════════════════"

# Verificar NODE_ENV
if [ "$NODE_ENV" = "production" ]; then
  echo "❌ ERROR CRÍTICO: NODE_ENV=production"
  echo "NO SE PUEDEN EJECUTAR TESTS EN PRODUCCIÓN"
  exit 1
fi

# Verificar Firestore Emulator
if ! nc -z localhost 8080 2>/dev/null; then
  echo "❌ ERROR: Firestore Emulator no está corriendo en localhost:8080"
  echo ""
  echo "Abre otro terminal y ejecuta:"
  echo "  firebase emulators:start --only firestore"
  echo ""
  exit 1
fi

echo "✓ Firestore Emulator corriendo en localhost:8080"

# Configurar ambiente seguro
export NODE_ENV=test
export FIREBASE_TEST_PROJECT_ID=test-project
export FIRESTORE_EMULATOR_HOST=localhost:8080

echo "════════════════════════════════════════════════════════"
echo "Configuración de tests:"
echo "  NODE_ENV: $NODE_ENV"
echo "  FIRESTORE_EMULATOR_HOST: $FIRESTORE_EMULATOR_HOST"
echo "  FIREBASE_TEST_PROJECT_ID: $FIREBASE_TEST_PROJECT_ID"
echo "════════════════════════════════════════════════════════"

# Ejecutar tests
echo ""
echo "Ejecutando tests..."
npm test "$@"

echo ""
echo "════════════════════════════════════════════════════════"
echo "✓ TESTS COMPLETADOS CORRECTAMENTE"
echo "✓ BD de producción NO fue modificada"
echo "════════════════════════════════════════════════════════"
