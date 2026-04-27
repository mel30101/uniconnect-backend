/**
 * Token Builder Helper
 * Constructor para crear tokens mock de Google
 */

class TokenBuilder {
  /**
   * Crea un token mock simple (para testing local)
   * En tests reales, usarías tokens reales o JWT fixtures
   * @param {object} options
   * @returns {string}
   */
  static createMockToken(options = {}) {
    const {
      email = 'test@ucaldas.edu.co',
      uid = 'google_' + Math.random().toString(36).substr(2, 9),
      name = 'Test User',
      isValid = true
    } = options;

    const payload = {
      iss: 'https://accounts.google.com',
      azp: 'mock-client-id',
      aud: 'mock-client-id',
      sub: uid,
      email: email,
      email_verified: true,
      name: name,
      picture: 'https://example.com/photo.jpg',
      given_name: name.split(' ')[0],
      family_name: name.split(' ').pop(),
      locale: 'es',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600
    };

    return Buffer.from(JSON.stringify(payload)).toString('base64');
  }

  /**
   * Crea token con dominio válido (@ucaldas.edu.co)
   * @param {object} options
   * @returns {string}
   */
  static createValidDomainToken(options = {}) {
    return this.createMockToken({
      email: options.email || 'student@ucaldas.edu.co',
      uid: options.uid,
      name: options.name || 'Valid Student',
      ...options
    });
  }

  /**
   * Crea token con dominio inválido (gmail, hotmail, etc)
   * @param {object} options
   * @returns {string}
   */
  static createInvalidDomainToken(options = {}) {
    return this.createMockToken({
      email: options.email || 'external@gmail.com',
      uid: options.uid,
      name: options.name || 'External User',
      ...options
    });
  }

  /**
   * Crea un token malformado para testing de error handling
   * @returns {string}
   */
  static createInvalidToken() {
    return 'invalid.malformed.token.xyz';
  }

  /**
   * Crea un token vacío/nulo
   * @returns {null}
   */
  static createNullToken() {
    return null;
  }
}

module.exports = TokenBuilder;
