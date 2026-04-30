const request = require('supertest');
const app = require('../../index');
const DatabaseFactory = require('../../src/config/databaseFactory');
const db = DatabaseFactory.getDatabase();

describe('Event Services - Pruebas de Integración de Eventos', () => {

  beforeAll(async () => {
    // Asegurar la conexión a la base de datos
    await DatabaseFactory.getDatabase();
  });

  beforeEach(async () => {
    jest.restoreAllMocks();
    // Limpiar la colección de eventos y suscripciones para aislar la prueba
    const collections = ['events', 'subscriptions'];
    for (const col of collections) {
      const snapshot = await db.collection(col).get();
      const batch = db.batch();
      snapshot.docs.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
    }
  });

  // 1. Prueba de creación exitosa
  it('debe permitir crear un evento de forma correcta', async () => {
    const newEvent = {
      title: 'Taller de Software 3',
      type: 'Académico',
      description: 'Revisión de proyectos del semestre',
      date: '2026-05-15T10:00:00Z',
    };

    const response = await request(app)
      .post('/events')
      .send(newEvent);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.title).toBe(newEvent.title);

    const eventDoc = await db.collection('events').doc(response.body.id).get();
    expect(eventDoc.exists).toBe(true);
    expect(eventDoc.data().title).toBe(newEvent.title);
  });

  // 2. Prueba de validación de campos obligatorios
  it('debe retornar error 400 si faltan datos requeridos', async () => {
    const invalidEvent = { title: '' };

    const response = await request(app)
      .post('/events')
      .send(invalidEvent);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toContain('Faltan parámetros obligatorios');
  });

  // 3. Prueba de obtención de eventos
  it('debe obtener la lista de eventos correctamente', async () => {
    // Crear evento de prueba
    const eventRef = await db.collection('events').add({
      title: 'Conferencia de IA',
      type: 'Tecnología',
      date: '2026-06-01T09:00:00Z'
    });

    const response = await request(app)
      .get('/events');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  // 5. Prueba de prevención de doble suscripción
  it('debe retornar 409 si ya está suscrito a una categoría', async () => {
    const subscriptionData = {
      userId: 'estudiante-123',
      categoryId: 'cat-academia'
    };

    // Simulamos la suscripción previa en Firestore
    await db.collection('subscriptions').add(subscriptionData);

    const response = await request(app)
      .post('/events/suscribir')
      .send(subscriptionData);

    expect(response.status).toBe(409);
  });
});