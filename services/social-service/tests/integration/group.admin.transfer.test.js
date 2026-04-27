const request = require('supertest');
const app = require('../../index');
const DatabaseFactory = require('../../src/config/databaseFactory');
const db = DatabaseFactory.getDatabase();

describe('Social Service - Criterio 4: Transferencia de Administración (Flujo Completo)', () => {
    let groupId;
    const adminOriginalId = 'admin-actual-123';
    const candidatoId = 'estudiante-candidato-456';

    beforeAll(async () => {
        const groupRef = await db.collection('groups').add({
            name: 'Grupo de Prueba Transferencia',
            subjectId: 'SOFT-3',
            creatorId: adminOriginalId
        });
        groupId = groupRef.id;

        await db.collection('group_members').add({
            groupId,
            userId: candidatoId,
            role: 'student'
        });
    });

    /**
     * ESTE TEST ESTÁ EN PAUSA (SKIP) HASTA QUE DESARROLLO TERMINE
     */
    describe.skip('Pruebas de Integración - Flujo Solicitud/Aceptación', () => {
        
        it('Escenario 1: El flujo completo de transferencia funciona (Solicitud -> Aceptación)', async () => {
            // 1. EL ADMIN SOLICITA LA TRANSFERENCIA
            // Se espera un endpoint tipo PATCH o POST según el requerimiento
            const solicitudRes = await request(app)
                .patch(`/groups/${groupId}/transferir-admin`) 
                .send({
                    newAdminId: candidatoId,
                    adminId: adminOriginalId
                });

            expect(solicitudRes.status).toBe(200);

            // 2. EL CANDIDATO ACEPTA LA TRANSFERENCIA
            // Imaginamos que se crea una solicitud que el candidato debe aprobar
            const aceptacionRes = await request(app)
                .put(`/groups/${groupId}/transferir-admin/accept`) 
                .send({ userId: candidatoId });

            expect(aceptacionRes.status).toBe(200);

            // 3. VERIFICACIÓN FINAL EN BASE DE DATOS
            const groupDoc = await db.collection('groups').doc(groupId).get();
            expect(groupDoc.data().creatorId).toBe(candidatoId);
            
            console.log('✅ El creatorId cambió exitosamente al candidato.');
        });

        it('Escenario 2: El flujo se cancela si el candidato RECHAZA', async () => {
            // 1. El admin solicita
            await request(app).patch(`/groups/${groupId}/transferir-admin`).send({ newAdminId: candidatoId });

            // 2. El candidato rechaza
            const rechazoRes = await request(app)
                .put(`/groups/${groupId}/transferir-admin/reject`)
                .send({ userId: candidatoId });

            expect(rechazoRes.status).toBe(200);

            // 3. El admin DEBE seguir siendo el original
            const groupDoc = await db.collection('groups').doc(groupId).get();
            expect(groupDoc.data().creatorId).toBe(adminOriginalId);
            
            console.log('✅ El admin original se mantiene tras el rechazo.');
        });
    });
});