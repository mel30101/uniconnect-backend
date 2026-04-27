/**
 * User Fixtures
 * Datos predefinidos de usuarios para testing
 */

const userFixtures = {
  validUcaldasUser: {
    uid: 'google_12345',
    name: 'Carlos Mendez',
    email: 'carlos.mendez@ucaldas.edu.co',
    lastLogin: new Date()
  },

  anotherValidUser: {
    uid: 'google_67890',
    name: 'María García',
    email: 'maria.garcia@ucaldas.edu.co',
    lastLogin: new Date()
  },

  externalUser: {
    uid: 'google_external',
    name: 'John Doe',
    email: 'john.doe@gmail.com',
    lastLogin: new Date()
  },

  minimalUser: {
    uid: 'google_minimal',
    name: 'User',
    email: 'user@ucaldas.edu.co'
  },

  userWithSpecialChars: {
    uid: 'google_special',
    name: 'José María Pérez-López',
    email: 'jose.maria@ucaldas.edu.co',
    lastLogin: new Date()
  }
};

module.exports = userFixtures;
