/**
 * Google Profile Mock Helper
 * Simula perfiles de Google para testing
 */

class GoogleProfileMock {
  /**
   * Crea un perfil mock válido con dominio @ucaldas.edu.co
   * @param {object} overrides
   * @returns {object}
   */
  static validUcaldasProfile(overrides = {}) {
    return {
      id: overrides.id || 'google_' + Math.random().toString(36).substr(2, 9),
      displayName: overrides.displayName || 'Juan Estudiante',
      name: {
        familyName: overrides.familyName || 'Estudiante',
        givenName: overrides.givenName || 'Juan'
      },
      emails: [
        {
          value: overrides.email || 'juan.estudiante@ucaldas.edu.co',
          verified: true
        }
      ],
      photos: [
        {
          value: overrides.photo || 'https://example.com/juan.jpg'
        }
      ],
      provider: 'google',
      ...overrides
    };
  }

  /**
   * Crea un perfil mock con dominio externo (gmail, hotmail, etc)
   * @param {object} overrides
   * @returns {object}
   */
  static invalidDomainProfile(overrides = {}) {
    return {
      id: overrides.id || 'google_' + Math.random().toString(36).substr(2, 9),
      displayName: overrides.displayName || 'External User',
      name: {
        familyName: overrides.familyName || 'User',
        givenName: overrides.givenName || 'External'
      },
      emails: [
        {
          value: overrides.email || 'external@gmail.com',
          verified: true
        }
      ],
      photos: [
        {
          value: overrides.photo || 'https://example.com/external.jpg'
        }
      ],
      provider: 'google',
      ...overrides
    };
  }

  /**
   * Crea un perfil sin email verificado
   * @param {object} overrides
   * @returns {object}
   */
  static unverifiedEmailProfile(overrides = {}) {
    const profile = this.validUcaldasProfile(overrides);
    profile.emails[0].verified = false;
    return profile;
  }

  /**
   * Crea un perfil sin email
   * @param {object} overrides
   * @returns {object}
   */
  static noEmailProfile(overrides = {}) {
    const profile = this.validUcaldasProfile(overrides);
    profile.emails = [];
    return profile;
  }
}

module.exports = GoogleProfileMock;
