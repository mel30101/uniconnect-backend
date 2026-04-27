const request = require('supertest');
const app = require('../../index');

describe('Social Service - Pruebas de Borde (Boundary Testing)', () => {
  const asignaturaId = `BORDE-ASIG-${Date.now()}`;
  
  it('BORDE: Debe permitir nombres con el mínimo exacto (3 caracteres)', async () => {
    const res = await request(app)
      .post('/groups')
      .send({
        name: 'SW3',
        subjectId: asignaturaId,
        description: 'Mínimo permitido',
        creatorId: 'qa-tester'
      });
    
    expect(res.status).toBe(201);
    console.log('✅ Borde inferior (3 caracteres) aceptado correctamente.');
  });

  it('BORDE: Debe rechazar nombres con menos del mínimo (2 caracteres)', async () => {
    const res = await request(app)
      .post('/groups')
      .send({
        name: 'AB',
        subjectId: asignaturaId,
        description: 'Por debajo del mínimo',
        creatorId: 'qa-tester'
      });
    
    expect(res.status).not.toBe(201);
    console.log('✅ Borde inferior (2 caracteres) rechazado correctamente.');
  });


  it('BORDE: Debe permitir crear hasta el 3er grupo (Límite máximo permitido)', async () => {
    for (let i = 2; i <= 3; i++) {
      const res = await request(app)
        .post('/groups')
        .send({
          name: `Grupo Borde ${i}-${asignaturaId}`,
          subjectId: asignaturaId,
          description: 'Límite exacto',
          creatorId: 'qa-tester'
        });
      expect(res.status).toBe(201);
    }
    console.log('✅ Borde superior (3 grupos) alcanzado con éxito.');
  });

  it('BORDE: No debe permitir un 4to grupo (Excediendo el límite)', async () => {
    const res = await request(app)
      .post('/groups')
      .send({
        name: `Grupo Prohibido-${asignaturaId}`,
        subjectId: asignaturaId,
        description: 'Excediendo el límite',
        creatorId: 'qa-tester'
      });

    if (res.status === 201) {
      console.error('❌ FALLO DE BORDE: El sistema permitió un 4to grupo.');
    }
    
    expect(res.status).toBe(409);
  });

  it('BORDE: Debe fallar con strings vacíos en campos obligatorios', async () => {
    const res = await request(app)
      .post('/groups')
      .send({
        name: '', 
        subjectId: asignaturaId,
        creatorId: 'qa-tester'
      });
    
    expect(res.status).not.toBe(201);
    console.log('✅ Borde "String Vacío" manejado (no permitió creación).');
  });
});