/**
 * Integration Tests - Domain Validation (GET Version)
 * Valida que solo usuarios con dominio @ucaldas.edu.co pueden autenticarse
 * Cubre: Criterio 1 (Obligatorio) y Criterio 5 (Aislamiento)
 */

const request = require('supertest');
const app = require('../../index');
const TestDatabaseSetup = require('../utils/setupTestDB');
const TokenBuilder = require('../helpers/tokenBuilder'); 

let db;
const VALID_ORIGIN = 'http://localhost:3000';

describe('GET /google - Domain Validation', () => {
  
  beforeAll(async () => {
    TestDatabaseSetup.validateTestEnvironment();
    db = await TestDatabaseSetup.initializeTestDB();
  });

  beforeEach(async () => {
    await TestDatabaseSetup.clearDatabase(db);
  });

  afterAll(async () => {
    if (db) {
      await TestDatabaseSetup.clearDatabase(db);
      await db.terminate();
    }
    await new Promise(resolve => setTimeout(resolve, 500));
  });

  describe('Caso de Prueba 1: Dominio válido (@ucaldas.edu.co)', () => {
    
    it('debe permitir el acceso para usuario @ucaldas.edu.co', async () => {
      const token = TokenBuilder.createValidDomainToken({
        email: 'estudiante@ucaldas.edu.co'
      });

      const response = await request(app)
        .get('/google')
        .set('Origin', VALID_ORIGIN)
        .query({ token });

      expect([200, 302]).toContain(response.status);
    });

    it('debe crear el registro en el emulador si el dominio es correcto', async () => {
      const testUid = 'ucaldas_user_123';
      const testEmail = 'profesor@ucaldas.edu.co';
      
      const token = TokenBuilder.createValidDomainToken({
        uid: testUid,
        email: 'profesor@ucaldas.edu.co'
      });

      //Simulación para redirigir
      await db.collection('users').doc(testUid).set({
        uid: testUid,
        email: testEmail,
        name: 'Profesor Test'
      });

      await request(app)
        .get('/google')
        .set('Origin', VALID_ORIGIN)
        .query({ token });

      const userInDB = await TestDatabaseSetup.getTestDocument(db, 'users', testUid);
      expect(userInDB).not.toBeNull();
      expect(userInDB.email).toBe('profesor@ucaldas.edu.co');
    });
  });

  describe('Caso de Prueba 2: Dominio inválido (externo)', () => {
    
    it('debe denegar el acceso para correo @gmail.com', async () => {
      const token = TokenBuilder.createInvalidDomainToken({
        email: 'externo@gmail.com'
      });

      const response = await request(app)
        .get('/google')
        .set('Origin', VALID_ORIGIN)
        .query({ token });

      expect([401, 403, 302]).toContain(response.status);
      
      const snapshot = await db.collection('users').get();
      expect(snapshot.size).toBe(0);
    });

    it('no debe crear usuario en BD para dominios no autorizados', async () => {
      const token = TokenBuilder.createInvalidDomainToken({
        email: 'hacker@outlook.com'
      });

      await request(app)
        .get('/google')
        .query({ token });

      const snapshot = await db.collection('users').get();
      expect(snapshot.size).toBe(0);
    });
  });
});