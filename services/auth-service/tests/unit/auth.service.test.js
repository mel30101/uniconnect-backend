const DatabaseFactory = require('../../src/config/databaseFactory');
const TestDatabaseSetup = require('../helpers/testDatabaseSetup');
const TokenBuilder = require('../helpers/tokenBuilder');
const JWTValidator = require('../helpers/jwtValidator');

describe('Auth Service - Unit Tests', () => {
  let db;

  beforeAll(async () => {
    db = DatabaseFactory.getDatabase();
    await TestDatabaseSetup.validateTestEnvironment();
  });

  beforeEach(async () => {
    await TestDatabaseSetup.clearDatabase(db);
  });

  describe('JWT Validator Helper', () => {
    it('debería validar correctamente un formato de token válido', () => {
      const mockToken = TokenBuilder.createValidDomainToken();
      const isValid = JWTValidator.isValidFormat(mockToken);
      
      expect(isValid).toBe(true);
    });

    it('debería detectar un token malformado o nulo como inválido', () => {
      const invalidToken = TokenBuilder.createInvalidToken();
      const isValid = JWTValidator.isValidFormat(invalidToken);
      
      expect(isValid).toBe(false); 
    });

    it('debería extraer el UID del payload correctamente', () => {
      const uid = 'google_test_123';
      const mockToken = TokenBuilder.createValidDomainToken({ uid });
      const extractedUid = JWTValidator.extractUid(mockToken);

      expect(extractedUid).toBe(uid);
    });
  });
});