const request = require('supertest');
const app = require('../../index');
const DatabaseFactory = require('../../src/config/databaseFactory');
const db = DatabaseFactory.getDatabase();

describe('Event Services - Pruebas de Suscripciones y Categorías', () => {

  beforeAll(async () => {
    await DatabaseFactory.getDatabase();
  });

  beforeEach(async () => {
    jest.restoreAllMocks();
    // Limpiar la colección 'event_subscriptions' para mantener el aislamiento
    const snapshot = await db.collection('event_subscriptions').get();
    const batch = db.batch();
    snapshot.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
  });

  // 1. Obtener la lista de categorías
  it('debe obtener la lista de categorías disponibles', async () => {
    const response = await request(app)
      .get('/events/categories');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  // 2. Obtener las categorías suscritas de un usuario
  it('debe obtener las categorías suscritas de un usuario específico', async () => {
    // 1. Crear una categoría de prueba en Firestore
    await db.collection('categories').doc('cat-academia').set({
      id: 'cat-academia',
      name: 'Academia'
    });

    // 2. Crear suscripción de prueba con la estructura del repositorio
    await db.collection('event_subscriptions').doc('estudiante-123').set({
      categoryIds: ['cat-academia']
    });

    // Esperar al emulador de Firestore
    await new Promise((resolve) => setTimeout(resolve, 500));

    // 3. Hacer la petición GET al endpoint
    const response = await request(app)
      .get('/events/suscripciones/estudiante-123');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  // 3. Prueba de eliminación de suscripción (desuscribirse)
  it('debe permitir a un usuario desuscribirse de una categoría', async () => {
    // 1. Crear la suscripción previa usando la misma estructura del repositorio
    await db.collection('event_subscriptions').doc('estudiante-123').set({
      categoryIds: ['cat-academia']
    });

    await new Promise((resolve) => setTimeout(resolve, 500));

    // 2. Llamar al endpoint DELETE usando query params
    const response = await request(app)
      .delete('/events/suscribir?userId=estudiante-123&categoryId=cat-academia');

    expect(response.status).toBe(204); // Sin contenido tras eliminar

    // 3. Validar que la suscripción fue eliminada del arreglo en Firestore
    const snap = await db.collection('event_subscriptions').doc('estudiante-123').get();
    
    expect(snap.exists).toBe(true);
    const data = snap.data();
    expect(data.categoryIds).not.toContain('cat-academia');
  });

  // 4. Validación de parámetros en la eliminación
  it('debe retornar 400 si faltan parámetros al desuscribirse', async () => {
    const response = await request(app)
      .delete('/events/suscribir'); // Sin parámetros en la URL

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toContain('Faltan parámetros');
  });
});