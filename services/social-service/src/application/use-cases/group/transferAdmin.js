class TransferAdmin {
  constructor(groupRepo, groupMemberRepo, db) {
    this.groupRepo = groupRepo;
    this.groupMemberRepo = groupMemberRepo;
    this.db = db;
  }

  async execute(groupId, adminId, newAdminId) {
    if (!adminId || !newAdminId) {
      throw new Error('MISSING_FIELDS');
    }

    // Usar transacción para asegurar consistencia
    return await this.db.runTransaction(async (transaction) => {
      const groupRef = this.db.collection('groups').doc(groupId);
      const groupDoc = await transaction.get(groupRef);

      if (!groupDoc.exists) {
        throw new Error('GROUP_NOT_FOUND');
      }

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
  }
}

module.exports = TransferAdmin;
