/**
 * Jest Global Setup
 * Se ejecuta una vez antes de todos los tests
 * CRÍTICO: Protege contra usar BD de producción
 */

module.exports = async () => {
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'FALLO CRÍTICO: NO SE PUEDEN EJECUTAR TESTS EN PRODUCCIÓN. ' +
      'Esto protege tu BD de usuarios reales. ' +
      'Ejecuta: NODE_ENV=test npm test'
    );
  }

  process.env.NODE_ENV = 'test';
  process.env.FIREBASE_TEST_PROJECT_ID = 'test-project';
  process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';

  console.log('════════════════════════════════════════════════════════');
  console.log('AMBIENTE DE TESTING CONFIGURADO');
  console.log('════════════════════════════════════════════════════════');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('Emulador:', process.env.FIRESTORE_EMULATOR_HOST);
  console.log('Proyecto:', process.env.FIREBASE_TEST_PROJECT_ID);
  console.log('════════════════════════════════════════════════════════');
  console.log('IMPORTANTE: Asegúrate que Firestore Emulator está corriendo:');
  console.log('firebase emulators:start --only firestore');
  console.log('════════════════════════════════════════════════════════');
};
