const { GroupEvents } = require('../../../domain/observer/ISubject');

class TransferAdmin {
  constructor(groupRepo, groupMemberRepo, db, subject) {
    this.groupRepo = groupRepo;
    this.groupMemberRepo = groupMemberRepo;
    this.db = db;
    this.subject = subject;
  }

  async execute(groupId, adminId, newAdminId) {
    if (!adminId || !newAdminId) {
      throw new Error('MISSING_FIELDS');
    }

    let groupDataForNotify = null;

    // Usar transacción para asegurar consistencia
    await this.db.runTransaction(async (transaction) => {
      const groupRef = this.db.collection('groups').doc(groupId);
      const groupDoc = await transaction.get(groupRef);

      if (!groupDoc.exists) {
        throw new Error('GROUP_NOT_FOUND');
      }

      groupDataForNotify = { id: groupDoc.id, ...groupDoc.data() };

      // Verificar que el admin actual es realmente admin
      const currentAdminData = await this.groupMemberRepo.getRefsByGroupAndUser(groupId, adminId);
      if (!currentAdminData || currentAdminData.data.role !== 'admin') {
        throw new Error('NOT_AUTHORIZED');
      }

      // Verificar que el nuevo admin es miembro
      const newAdminData = await this.groupMemberRepo.getRefsByGroupAndUser(groupId, newAdminId);
      if (!newAdminData) {
        throw new Error('NEW_ADMIN_NOT_FOUND');
      }

      // Ejecutar la transferencia
      transaction.update(groupRef, { creatorId: newAdminId });
      transaction.update(newAdminData.ref, { role: 'admin' });
      transaction.delete(currentAdminData.ref);
    });

    // Notificar al nuevo Admin
    if (this.subject && groupDataForNotify) {
      this.subject.notify(GroupEvents.TRANSFERENCIA_ADMIN, {
        targetUserId: newAdminId,
        groupId: groupDataForNotify.id,
        groupName: groupDataForNotify.name
      });
    }

    return { success: true };
  }
}

module.exports = TransferAdmin;
