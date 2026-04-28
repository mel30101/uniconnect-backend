const { GroupEvents } = require('../../../domain/observer/ISubject');

class RequestAdminTransfer {
  constructor(groupRepo, groupMemberRepo, userRepo, db, subject) {
    this.groupRepo = groupRepo;
    this.groupMemberRepo = groupMemberRepo;
    this.userRepo = userRepo;
    this.db = db;
    this.subject = subject;
  }

  async execute(groupId, adminId, candidateId) {
    if (!adminId || !candidateId) {
      throw new Error('MISSING_FIELDS');
    }

    const group = await this.groupRepo.findById(groupId);
    if (!group) {
      throw new Error('GROUP_NOT_FOUND');
    }

    // Verificar que el adminId es realmente el creador/admin del grupo
    if (group.creatorId !== adminId) {
      throw new Error('NOT_AUTHORIZED');
    }

    // Verificar que el candidato es miembro del grupo
    const candidateMember = await this.groupMemberRepo.findByGroupAndUser(groupId, candidateId);
    if (!candidateMember) {
      throw new Error('CANDIDATE_NOT_A_MEMBER');
    }

    // Actualizar el grupo con la transferencia pendiente
    await this.groupRepo.update(groupId, {
      pendingAdminTransfer: {
        candidateId,
        requesterId: adminId,
        status: 'pending',
        requestedAt: new Date()
      }
    });

    // Notificar al candidato
    if (this.subject) {
      const requester = await this.userRepo.findById(adminId);
      this.subject.notify(GroupEvents.TRANSFERENCIA_ADMIN_SOLICITADA, {
        targetUserId: candidateId,
        groupId: group.id,
        groupName: group.name,
        userName: requester ? (requester.name || requester.displayName || 'Un administrador') : 'Un administrador'
      });
    }

    return { success: true, message: 'Solicitud de transferencia enviada.' };
  }
}

module.exports = RequestAdminTransfer;
