const request = require('supertest');
const app = require('../../index');
const DatabaseFactory = require('../../src/config/databaseFactory');
const db = DatabaseFactory.getDatabase();

describe('Social Service - Gestión de Miembros', () => {
  let groupId;

  // Preparamos un grupo antes de las pruebas
  beforeAll(async () => {
    const groupRef = await db.collection('groups').add({
      name: 'Grupo para Miembros',
      subjectId: 'SW3',
      creatorId: 'admin-1'
    });
    groupId = groupRef.id;
  });

  it('debe agregar un miembro nuevo exitosamente', async () => {
    const res = await request(app)
      .post(`/groups/${groupId}/members`)
      .send({
        userId: 'estudiante-nuevo',
        userName: 'Carlos QA',
        role: 'member'
      });

    expect(res.status).toBe(201); // O 200, según lo que use el equipo
    console.log('✅ Miembro agregado correctamente.');
  });

  describe.skip('Pruebas de integración en pausa por despliegue', () => {
    it('BORDE: No debe permitir agregar al mismo miembro dos veces', async () => {
      // Intentamos agregar al mismo 'estudiante-nuevo'
      const res = await request(app)
        .post(`/groups/${groupId}/members`)
        .send({
          userId: 'estudiante-nuevo',
          userName: 'Carlos QA'
        });

      // Debería fallar porque ya está dentro
      expect(res.status).toBe(400);
      console.log('✅ El sistema previene miembros duplicados.');
    });
  });

  describe.skip('Pruebas de integración en pausa por despliegue', () => {
    it('BORDE: Debe fallar si el grupo no existe', async () => {
      const res = await request(app)
        .post('/groups/ID-FALSO/members')
        .send({
          userId: 'user-99',
          userName: 'Infiltrado'
        });

      expect(res.status).toBe(404);
      console.log('✅ El sistema valida que el grupo exista antes de añadir.');
    });
  });
});