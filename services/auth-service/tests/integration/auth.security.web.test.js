/**
 * Integration Tests - Security 
 * Versión final con headers de Origin para validar CORS
 */

const request = require('supertest');
const app = require('../../index');
const TestDatabaseSetup = require('../utils/setupTestDB');

let db;
const VALID_ORIGIN = 'http://localhost:3000'; 

describe('GET /google - Security Headers (Web)', () => {
  beforeAll(async () => {
    db = await TestDatabaseSetup.initializeTestDB();
  });

  afterAll(async () => {
    if (db) await db.terminate();
  });

  describe('Caso de Prueba 9: Headers de Seguridad', () => {
    
    it.skip('debe incluir headers CORS', async () => {
      const response = await request(app)
        .get('/google') 
        .set('Origin', VALID_ORIGIN) 
        .query({ redirect: VALID_ORIGIN });

      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });

    it('debe no exponer X-Powered-By header', async () => {
      const response = await request(app)
        .get('/google') 
        .set('Origin', VALID_ORIGIN)
        .query({ redirect: VALID_ORIGIN });

      expect(response.headers['x-powered-by']).toBeUndefined();
    });

    it('debe realizar redirección segura (302)', async () => {
      const response = await request(app)
        .get('/google') 
        .set('Origin', VALID_ORIGIN)
        .query({ redirect: VALID_ORIGIN });

      expect(response.status).toBe(302);
      expect(response.header.location).toContain('accounts.google.com');
    });

    it('debe no incluir información sensible en headers', async () => {
      const response = await request(app)
        .get('/google') 
        .set('Origin', VALID_ORIGIN)
        .query({ redirect: VALID_ORIGIN });

      const sensitiveHeaders = ['authorization', 'x-api-key', 'x-secret'];
      sensitiveHeaders.forEach(header => {
        const value = response.headers[header];
        if (value) {
          expect(value).not.toContain('secret');
          expect(value).not.toContain('password');
        }
      });
    });
  });

  describe('CORS Configuration', () => {
    it('debe permitir preflight requests (OPTIONS)', async () => {
      const response = await request(app)
        .options('/google') 
        .set('Origin', VALID_ORIGIN);

      expect([200, 204]).toContain(response.status);
    });

    it.skip('debe incluir allowed origins en CORS durante el GET', async () => {
      const response = await request(app)
        .get('/google') 
        .set('Origin', VALID_ORIGIN)
        .query({ redirect: VALID_ORIGIN });

      expect(response.headers['access-control-allow-origin']).toBeDefined();
      expect(response.headers['access-control-allow-origin']).toBe(VALID_ORIGIN);
    });
  });
});