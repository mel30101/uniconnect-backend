const request = require('supertest');
const app = require('../../index');
const DatabaseFactory = require('../../src/config/databaseFactory');
const db = DatabaseFactory.getDatabase();

describe('Social Service - Criterio 3: Persistencia de Notificaciones', () => {

    let groupId; // Declaramos la variable aquí para que todos los "it" la vean
    const adminId = 'profe-admin-456';

    // Este bloque se ejecuta UNA VEZ antes de todos los tests
    beforeAll(async () => {
        const groupRef = await db.collection('groups').add({
            name: 'Grupo de Algoritmos',
            subjectId: 'ALG-101',
            creatorId: adminId
        });
        groupId = groupRef.id; // Guardamos el ID para los demás tests
    });

    it('debe persistir una notificación cuando se envía una solicitud de ingreso', async () => {
        const res = await request(app)
            .post(`/groups/${groupId}/requests`)
            .send({
                userId: 'estudiante-qa-999',
                userName: 'Pepito QA'
            });

        expect(res.status).toBe(200);
        await new Promise(resolve => setTimeout(resolve, 3000));
    }, 10000);

    it('debe contener un mensaje descriptivo con el nombre del usuario y el grupo', async () => {
        const notificationsSnapshot = await db.collection('notifications')
            .where('targetUserId', '==', 'profe-admin-456')
            .get();

        const data = notificationsSnapshot.docs[0].data();

        expect(data.message).toContain('Pepito QA');
        expect(data.message).toContain('Grupo de Algoritmos');
        console.log('✅ El formato del mensaje es correcto.');
    });

    it('debe marcar la notificación como NO LEÍDA por defecto', async () => {
        const notificationsSnapshot = await db.collection('notifications')
            .where('targetUserId', '==', 'profe-admin-456')
            .get();

        const data = notificationsSnapshot.docs[0].data();

        expect(data.read).toBe(false);
        console.log('✅ Estado inicial de lectura validado: false');
    });

    it('debe persistir la fecha de creación automáticamente', async () => {
        const notificationsSnapshot = await db.collection('notifications')
            .where('targetUserId', '==', 'profe-admin-456')
            .get();

        const data = notificationsSnapshot.docs[0].data();

        expect(data.createdAt).toBeDefined();
        expect(data.createdAt._seconds).toBeGreaterThan(0);
        console.log('✅ Marca de tiempo (Timestamp) detectada correctamente.');
    });

    it('debe persistir una notificación para el miembro cuando es agregado directamente', async () => {
        const nuevoMiembroId = 'estudiante-invitado-777';

        const res = await request(app)
            .post(`/groups/${groupId}/members`) // Ahora groupId sí está definido
            .send({
                userId: nuevoMiembroId,
                userName: 'Juan Invitado'
            });

        expect(res.status).toBe(201);

        await new Promise(resolve => setTimeout(resolve, 3000));

        const notificationsSnapshot = await db.collection('notifications')
            .where('targetUserId', '==', nuevoMiembroId)
            .get();

        if (notificationsSnapshot.empty) {
            console.warn('⚠️ HALLAZGO: El miembro fue agregado, pero NO recibió una notificación.');
        } else {
            console.log('✅ ÉXITO: Notificación de inclusión directa persistida.');
        }

        expect(notificationsSnapshot.empty).toBe(false);
    }, 10000);
});