/**
 * Test Database Setup Helper
 * Configuración de BD de prueba aislada para integración tests
 * ⚠️ CRÍTICO: Usa SOLO BD en memoria, NUNCA producción
 */

const admin = require('firebase-admin');

class TestDatabaseSetup {
  /**
   * Inicializa la BD de prueba con máxima protección
   * SOLO funciona con Firestore Emulator local
   * DETIENE EJECUCIÓN si intenta usar producción
   * @returns {object} - Instancia de Firestore
   */
  static initializeTestDB() {
    if (process.env.NODE_ENV !== 'test') {
      throw new Error(
        'FALLO CRÍTICO: NODE_ENV no es "test". Esto protege BD de producción. ' +
        'Configura: export NODE_ENV=test (o NODE_ENV=test npm test)'
      );
    }

    const emulatorHost = process.env.FIRESTORE_EMULATOR_HOST;
    if (!emulatorHost || (!emulatorHost.includes('localhost') && !emulatorHost.includes('127.0.0.1'))) {
      throw new Error(
        'FALLO CRÍTICO: FIRESTORE_EMULATOR_HOST no apunta a localhost. ' +
        'Esto podría conectar a producción. Configura: FIRESTORE_EMULATOR_HOST=localhost:8080'
      );
    }

    const projectId = process.env.FIREBASE_TEST_PROJECT_ID || 'test-project';
    if (projectId.includes('production') || projectId.includes('prod')) {
      throw new Error(
        'FALLO CRÍTICO: projectId parece ser producción. ' +
        'Usa FIREBASE_TEST_PROJECT_ID=test-project (sin "production" en el nombre)'
      );
    }

    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      console.warn(
        'ADVERTENCIA: GOOGLE_APPLICATION_CREDENTIALS está configurado. ' +
        'En tests usaremos Firestore Emulator, no las credenciales reales.'
      );
    }

    admin.apps.forEach(app => app.delete());

    try {
      admin.initializeApp(
        {
          projectId: projectId,
          databaseURL: `http://${emulatorHost}/?ns=${projectId}`
        },
        'test-app'
      );
    } catch (error) {
      if (!error.message.includes('already exists')) {
        throw error;
      }
    }

    const db = admin.app('test-app').firestore();

    console.log('✓ BD de prueba: EMULADOR FIRESTORE (en memoria, aislada)');
    console.log(`✓ Proyecto: ${projectId}`);
    console.log(`✓ Emulador: ${emulatorHost}`);

    return db;
  }

  /**
   * Limpia todas las colecciones de la BD de prueba
   * @param {object} db - Instancia de Firestore
   */
  static async clearDatabase(db) {
    const collections = ['users', 'sessions', 'tokens'];
    
    for (const collection of collections) {
      const snapshot = await db.collection(collection).get();
      const batch = db.batch();
      
      snapshot.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
    }
  }

  /**
   * Limpia una colección específica
   * @param {object} db - Instancia de Firestore
   * @param {string} collectionName - Nombre de la colección
   */
  static async clearCollection(db, collectionName) {
    const snapshot = await db.collection(collectionName).get();
    const batch = db.batch();
    
    snapshot.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
  }

  /**
   * Inserta un documento de prueba
   * @param {object} db - Instancia de Firestore
   * @param {string} collection - Nombre de la colección
   * @param {string} docId - ID del documento
   * @param {object} data - Datos del documento
   */
  static async insertTestDocument(db, collection, docId, data) {
    await db.collection(collection).doc(docId).set(data);
  }

  /**
   * Obtiene un documento de prueba
   * @param {object} db - Instancia de Firestore
   * @param {string} collection - Nombre de la colección
   * @param {string} docId - ID del documento
   */
  static async getTestDocument(db, collection, docId) {
    const doc = await db.collection(collection).doc(docId).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  }

  /**
   * Verifica que estamos usando emulador (no producción)
   * @returns {boolean}
   */
  static isUsingEmulator() {
    return !!process.env.FIRESTORE_EMULATOR_HOST;
  }

  /**
   * Valida que la configuración de BD es segura para testing
   * THROWS ERROR si intenta usar producción
   * @throws {Error} Si la configuración es de producción
   */
  static validateTestEnvironment() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'FALLO CRÍTICO: NODE_ENV es "production". ' +
        'NO SE PUEDEN EJECUTAR TESTS contra base de datos de producción. ' +
        'Configura: export NODE_ENV=test'
      );
    }

    if (!this.isUsingEmulator()) {
      throw new Error(
        'FALLO CRÍTICO: Firestore Emulator no está configurado. ' +
        'Ejecuta primero: firebase emulators:start --only firestore ' +
        'Luego configura: FIRESTORE_EMULATOR_HOST=localhost:8080'
      );
    }

    console.log('✓ Ambiente de test validado: SEGURO PARA EJECUTAR');
  }
}

module.exports = TestDatabaseSetup;
