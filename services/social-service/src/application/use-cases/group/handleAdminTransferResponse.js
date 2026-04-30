const { GroupEvents } = require('../../../domain/observer/ISubject');

class HandleAdminTransferResponse {
  constructor(groupRepo, groupMemberRepo, userRepo, db, subject) {
    this.groupRepo = groupRepo;
    this.groupMemberRepo = groupMemberRepo;
    this.userRepo = userRepo;
    this.db = db;
    this.subject = subject;
  }

  async execute(groupId, candidateId, action) {
    const group = await this.groupRepo.findById(groupId);
    if (!group || !group.pendingAdminTransfer) {
      throw new Error('NO_PENDING_TRANSFER');
    }

    const transfer = group.pendingAdminTransfer;

    if (transfer.candidateId !== candidateId) {
      throw new Error('NOT_AUTHORIZED');
    }

    const candidate = await this.userRepo.findById(candidateId);
    const candidateName = candidate ? (candidate.name || candidate.displayName || 'El candidato') : 'El candidato';

    if (action === 'accept') {
      // Ejecutar transferencia atómica
      await this.db.runTransaction(async (transaction) => {
        const groupRef = this.db.collection('groups').doc(groupId);
        
        // 1. Cambiar el creador del grupo
        transaction.update(groupRef, { 
          creatorId: candidateId,
          pendingAdminTransfer: null 
        });

        // 2. Actualizar rol del nuevo admin
        const candidateMember = await this.groupMemberRepo.getRefsByGroupAndUser(groupId, candidateId);
        if (candidateMember) {
          transaction.update(candidateMember.ref, { role: 'admin' });
        }

        // 3. Sacar al antiguo admin del grupo
        const oldAdminMember = await this.groupMemberRepo.getRefsByGroupAndUser(groupId, transfer.requesterId);
        if (oldAdminMember) {
          transaction.delete(oldAdminMember.ref);
        }
      });

      // Notificar al antiguo admin que el candidato aceptó
      if (this.subject) {
        this.subject.notify(GroupEvents.TRANSFERENCIA_ADMIN_ACEPTADA, {
          targetUserId: transfer.requesterId,
          groupId: group.id,
          groupName: group.name,
          userName: candidateName
        });

        // También notificar al nuevo admin (opcional, pero buena práctica)
        this.subject.notify(GroupEvents.TRANSFERENCIA_ADMIN, {
          targetUserId: candidateId,
          groupId: group.id,
          groupName: group.name
        });
      }

      return { success: true, message: 'Transferencia completada. Ahora eres el administrador.' };

    } else if (action === 'reject') {
      // Limpiar la solicitud pendiente
      await this.groupRepo.update(groupId, {
        pendingAdminTransfer: null
      });

      // Notificar al administrador que fue rechazada
      if (this.subject) {
        this.subject.notify(GroupEvents.TRANSFERENCIA_ADMIN_RECHAZADA, {
          targetUserId: transfer.requesterId,
          groupId: group.id,
          groupName: group.name,
          userName: candidateName
        });
      }

      return { success: true, message: 'Solicitud de transferencia rechazada.' };
    } else {
      throw new Error('INVALID_ACTION');
    }
  }
}

module.exports = HandleAdminTransferResponse;
