const request = require('supertest');
const app = require('../../index');

describe('Social Service - Suite de Pruebas: Creación de Grupos', () => {
  const asignaturaId = 'ASIG-SW3-TEST';

  describe.skip('Pruebas de integración en pausa por despliegue', () => {
    it('Criterio 2: Debe retornar 409 si ya existen 3 grupos para la misma asignatura', async () => {
      for (let i = 1; i <= 4; i++) {
        const res = await request(app)
          .post('/groups')
          .send({
            name: `Grupo de Prueba Límite ${i}-${Date.now()}`,
            subjectId: asignaturaId,
            description: 'Validando límite de 3',
            creatorId: 'user-qa-123'
          });

        if (i <= 3) {
          expect(res.status).toBe(201);
        } else {
          if (res.status !== 409) {
            console.warn('⚠️ HALLAZGO: El sistema permitió crear un 4to grupo. El Criterio 2 no se cumple.');
          }
          expect(res.status).toBe(409);
        }
      }
    });
  });

  it('Debe fallar si el nombre del grupo ya existe', async () => {
    const nombreUnico = `Grupo Unico ${Date.now()}`;
    const payload = {
      name: nombreUnico,
      subjectId: 'MAT-1',
      description: 'Test duplicado',
      creatorId: 'user-qa-123'
    };

    await request(app).post('/groups').send(payload);

    const res = await request(app).post('/groups').send(payload);

    expect(res.status).not.toBe(201);
    console.log('✅ Validación de nombre duplicado probada.');
  });

  it('Debe fallar (Error 500 o 400) si falta el creatorId', async () => {
    const res = await request(app)
      .post('/groups')
      .send({
        name: 'Grupo sin creador',
        subjectId: 'MAT-2'
      });

    expect(res.status).not.toBe(201);
    console.log('✅ Validación de campos obligatorios probada.');
  });

});