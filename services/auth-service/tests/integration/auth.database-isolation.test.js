/**
 * Integration Tests - Database Isolation
 * Valida que la BD de prueba está aislada de producción
 * Cubre: Criterio 5 (Obligatorio)
 */

const TestDatabaseSetup = require('../utils/setupTestDB');

let db;

describe('Database Isolation - Test Environment', () => {
  beforeAll(() => {
    db = TestDatabaseSetup.initializeTestDB();
  });

  afterAll(async () => {
    if (db) await db.terminate();
  });

  describe('Validación de Entorno de Prueba', () => {
    it('debe estar usando Firestore Emulator', () => {
      expect(TestDatabaseSetup.isUsingEmulator()).toBe(true);
      expect(process.env.FIRESTORE_EMULATOR_HOST).toBeDefined();
    });

    it('debe tener NODE_ENV configurado como test', () => {
      expect(process.env.NODE_ENV).toBe('test');
    });

    it('debe usar proyecto de prueba, no producción', () => {
      const projectId = process.env.FIREBASE_TEST_PROJECT_ID;
      expect(projectId).toBeDefined();
      expect(projectId).not.toContain('production');
    });

    it('debe validar que no es ambiente de producción', () => {
      expect(() => {
        TestDatabaseSetup.validateTestEnvironment();
      }).not.toThrow();
    });
  });

  describe('Limpieza de Datos entre Suites', () => {
    it('datos de prueba no persisten entre suites', async () => {
      const testData = {
        uid: 'test_isolation_uid',
        email: 'test@ucaldas.edu.co',
        name: 'Test User'
      };

      await TestDatabaseSetup.insertTestDocument(
        db,
        'users',
        testData.uid,
        testData
      );

      let user = await TestDatabaseSetup.getTestDocument(
        db,
        'users',
        testData.uid
      );
      expect(user).not.toBeNull();

      await TestDatabaseSetup.clearCollection(db, 'users');

      user = await TestDatabaseSetup.getTestDocument(db, 'users', testData.uid);
      expect(user).toBeNull();
    });

    it('clearDatabase limpia todas las colecciones', async () => {
      const collections = ['users', 'sessions'];

      for (const collection of collections) {
        await TestDatabaseSetup.insertTestDocument(
          db,
          collection,
          'test_doc',
          { test: true }
        );
      }

      await TestDatabaseSetup.clearDatabase(db);

      for (const collection of collections) {
        const doc = await TestDatabaseSetup.getTestDocument(
          db,
          collection,
          'test_doc'
        );
        expect(doc).toBeNull();
      }
    });
  });

  describe('Aislamiento de Datos en Colecciones', () => {
    it('datos en colección users no afectan sessions', async () => {

      await TestDatabaseSetup.insertTestDocument(db, 'users', 'user_1', {
        email: 'user@ucaldas.edu.co'
      });

      await TestDatabaseSetup.insertTestDocument(db, 'sessions', 'session_1', {
        userId: 'user_1'
      });

      await TestDatabaseSetup.clearCollection(db, 'users');

      const session = await TestDatabaseSetup.getTestDocument(
        db,
        'sessions',
        'session_1'
      );
      expect(session).not.toBeNull();
    });
  });
});
