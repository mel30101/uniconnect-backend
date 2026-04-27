const request = require('supertest');
const app = require('../../index'); // Ajusta la ruta a tu index.js

describe('Auth Service - Logout Integration Tests', () => {
  
  it('should clear the uniconnect_token cookie on logout', async () => {
    const response = await request(app)
      .post('/logout')
      .send();

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Sesión cerrada');
    
    // Verificamos que el header Set-Cookie contenga la instrucción de borrar
    const cookieHeader = response.headers['set-cookie'][0];
    expect(cookieHeader).toMatch(/uniconnect_token=;/); // Cookie vacía
    expect(cookieHeader).toMatch(/Expires=Thu, 01 Jan 1970/); // Fecha antigua para borrar
  });

  it('should deny access to /me after a simulated logout', async () => {
    // 1. Primero intentamos acceder sin token (simulando estar deslogueado)
    const response = await request(app)
      .get('/me')
      .set('Cookie', []); // Sin cookies

    // Si tu middleware verifyJwtCookie funciona bien, debería dar 401 o 403
    expect(response.status).toBe(401); 
  });
});