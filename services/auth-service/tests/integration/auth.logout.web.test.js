const request = require('supertest');
const app = require('../../index');

describe('Auth Service - Logout Integration Tests', () => {
  
  it('should clear the uniconnect_token cookie on logout', async () => {
    const response = await request(app)
      .post('/logout')
      .send();

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Sesión cerrada');
    
    const cookieHeader = response.headers['set-cookie'][0];
    expect(cookieHeader).toMatch(/uniconnect_token=;/); 
    expect(cookieHeader).toMatch(/Expires=Thu, 01 Jan 1970/); 
  });

  it('should deny access to /me after a simulated logout', async () => {
    const response = await request(app)
      .get('/me')
      .set('Cookie', []); 

    expect(response.status).toBe(401); 
  });
});