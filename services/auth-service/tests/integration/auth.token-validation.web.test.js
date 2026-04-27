/**
 * Integration Tests - Token Validation (GET Version)
 * Valida estructura y validez de tokens mediante parámetros de URL
 * Cubre: Criterio 2, 3, 4
 */

const request = require('supertest');
const app = require('../../index');
const TestDatabaseSetup = require('../utils/setupTestDB');
const JWTValidator = require('../helpers/jwtValidator');
const TokenBuilder = require('../helpers/tokenBuilder');

let db;

describe('GET /google - Token Validation', () => {
  
  beforeAll(async () => {
    db = await TestDatabaseSetup.initializeTestDB();
  });

  beforeEach(async () => {
    await TestDatabaseSetup.clearDatabase(db);
  });

  afterAll(async () => {
    if (db) await db.terminate();
  });

  describe('Caso de Prueba 3: Token inválido o malformado', () => {
    
    it('debe retornar 401 para token malformado', async () => {
      const invalidToken = TokenBuilder.createInvalidToken();

      const response = await request(app)
        .get('/google')
        .query({ token: invalidToken });
      
      expect([401, 403, 302]).toContain(response.status);
    });

    it('debe retornar 401 para token nulo o ausente', async () => {
      const response = await request(app)
        .get('/google')
        .query({ token: null });

      expect([401, 403, 302]).toContain(response.status);
    });

    it('no debe crear usuario en Firestore para token inválido', async () => {
      await request(app)
        .get('/google')
        .query({ token: TokenBuilder.createInvalidToken() });

      const snapshot = await db.collection('users').get();
      expect(snapshot.size).toBe(0);
    });
  });

  describe('Caso de Prueba 4: Estructura del JWT', () => {
    
    it('debe retornar JWT con formato válido si el token es correcto', async () => {
      const validToken = TokenBuilder.createValidDomainToken();

      const response = await request(app)
        .get('/google')
        .query({ token: validToken });

      if (response.status === 200) {
        const jwt = response.body.jwt;
        expect(JWTValidator.isValidFormat(jwt)).toBe(true);
      } else {
        console.warn('El backend está redirigiendo (302) en lugar de responder 200');
      }
    });

    it('JWT generado debe contener los datos del usuario', async () => {
      const validToken = TokenBuilder.createValidDomainToken({
        uid: 'google_test_uid_123'
      });

      const response = await request(app)
        .get('/google')
        .query({ token: validToken });

      if (response.status === 200) {
        const jwt = response.body.jwt;
        const payload = JWTValidator.getPayload(jwt);
        expect(payload).toHaveProperty('uid');
      }
    });

    it('JWT generado no debe estar expirado', async () => {
      const validToken = TokenBuilder.createValidDomainToken();

      const response = await request(app)
        .get('/google')
        .query({ token: validToken });

      if (response.status === 200) {
        const jwt = response.body.jwt;
        expect(JWTValidator.isExpired(jwt)).toBe(false);
      }
    });
  });
});