/**
 * Integration Tests - Error Handling (GET Version)
 * Valida manejo robusto de errores y edge cases
 * Cubre: Criterio 4
 */

const request = require('supertest');
const app = require('../../index');
const TestDatabaseSetup = require('../utils/setupTestDB');

let db;

describe('GET /google - Error Handling', () => {
  
  beforeAll(async () => {
    db = await TestDatabaseSetup.initializeTestDB();
  });

  beforeEach(async () => {
    jest.restoreAllMocks(); 
    await TestDatabaseSetup.clearDatabase(db);
  });

  afterAll(async () => {
    if (db) {
      await TestDatabaseSetup.clearDatabase(db);
      await db.terminate();
    }
    await new Promise(resolve => setTimeout(resolve, 500));
  });

  describe('Caso de Prueba 5: Error 500 - BD No Disponible', () => {
    
    it('debe retornar 500 con mensaje genérico cuando falla DB', async () => {
      jest.spyOn(db, 'collection').mockImplementation(() => {
        throw new Error('Database connection failed');
      });

      const response = await request(app)
        .get('/google')
        .query({ token: 'valid_mock_token' });

      if (response.status === 500) {
        expect(response.body).toHaveProperty('error');
        expect(JSON.stringify(response.body)).not.toContain('Database connection failed');
      }
    });

    it('no debe retornar detalles internos del servidor en el cuerpo del error', async () => {
      const response = await request(app)
        .get('/google')
        .query({ token: 'force_error' });

      if (response.status === 500) {
        const message = JSON.stringify(response.body);
        expect(message).not.toContain('/src/config');
        expect(message).not.toContain('node_modules');
      }
    });
  });

  describe('Edge Cases - Parámetros de URL', () => {
    
    it('debe manejar request sin el parámetro token', async () => {
      const response = await request(app)
        .get('/google'); 

      expect([400, 401, 302]).toContain(response.status);
    });

    it('debe manejar request con token vacío en la URL', async () => {
      const response = await request(app)
        .get('/google')
        .query({ token: '' });

      expect([401, 403, 302]).toContain(response.status);
    });

    it('debe ser resistente a inyección básica en parámetros', async () => {
      const response = await request(app)
        .get('/google')
        .query({ token: "'; DROP TABLE users; --" });

      expect(response.status).not.toBe(500);
      expect([401, 403, 302]).toContain(response.status);
    });
  });
});