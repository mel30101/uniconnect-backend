const request = require('supertest');
const app = require('../../index');
const DatabaseFactory = require('../../src/config/databaseFactory');
const db = DatabaseFactory.getDatabase();

describe('Social Service - Criterio 4: Transferencia de Administración', () => {
    let groupId;
    const adminOriginalId = 'profe-admin-123';
    const nuevoAdminId = 'estudiante-sucesor-999';

    beforeAll(async () => {
        // 1. Crear el grupo con el admin original
        const groupRef = await db.collection('groups').add({
            name: 'Grupo de Transferencia',
            subjectId: 'SOFT-3',
            creatorId: adminOriginalId
        });
        groupId = groupRef.id;

        // 2. IMPORTANTE: El nuevo admin DEBE ser miembro antes de poder ser admin
        // Según TransferAdmin.js, si no es miembro, lanza NEW_ADMIN_NOT_FOUND
        await db.collection('group_members').add({
            groupId: groupId,
            userId: nuevoAdminId,
            role: 'student'
        });

        // 3. El admin original también debe estar en group_members como admin
        await db.collection('group_members').add({
            groupId: groupId,
            userId: adminOriginalId,
            role: 'admin'
        });
    });

    it('debe transferir la propiedad del grupo y actualizar roles correctamente', async () => {
        // Ejecutar la transferencia (Usando el endpoint que vimos en tus rutas)
        const res = await request(app)
            .put(`/groups/${groupId}/transfer-admin`)
            .send({
                adminId: adminOriginalId,
                newAdminId: nuevoAdminId
            });

        expect(res.status).toBe(200);

        // --- VERIFICACIÓN DE BASE DE DATOS ---

        // 1. Verificar que el creatorId en la colección 'groups' cambió
        const groupDoc = await db.collection('groups').doc(groupId).get();
        expect(groupDoc.data().creatorId).toBe(nuevoAdminId);
        console.log('✅ Criterio 4: creatorId actualizado en Firestore.');

        // 2. Verificar que el nuevo admin ahora tiene el ROL de admin
        const memberSnapshot = await db.collection('group_members')
            .where('groupId', '==', groupId)
            .where('userId', '==', nuevoAdminId)
            .get();
        
        expect(memberSnapshot.docs[0].data().role).toBe('admin');
        console.log('✅ Criterio 4: Rol de miembro actualizado a admin.');

        // 3. Verificar que el admin original ya NO está en el grupo (según la lógica del código)
        const oldAdminSnapshot = await db.collection('group_members')
            .where('groupId', '==', groupId)
            .where('userId', '==', adminOriginalId)
            .get();
        
        expect(oldAdminSnapshot.empty).toBe(true);
        console.log('✅ Observación: El admin original fue removido del grupo exitosamente.');
    });

    it('debe notificar al nuevo administrador sobre la transferencia', async () => {
        await new Promise(resolve => setTimeout(resolve, 2000));

        const notificationsSnapshot = await db.collection('notifications')
            .where('targetUserId', '==', nuevoAdminId)
            .where('type', '==', 'TRANSFERENCIA_ADMIN')
            .get();

        expect(notificationsSnapshot.empty).toBe(false);
        console.log('✅ Criterio 4: Notificación de transferencia persistida.');
    });
});