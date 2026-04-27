const { GroupEvents } = require('../../../domain/observer/ISubject');

class HandleRequestAction {
  constructor(groupMemberRepo, groupRequestRepo, groupRepo, subject) {
    this.groupMemberRepo = groupMemberRepo;
    this.groupRequestRepo = groupRequestRepo;
    this.groupRepo = groupRepo;
    this.subject = subject;
  }

  async execute(groupId, requestId, status) {
    const group = await this.groupRepo.findById(groupId);
    
    if (status === 'accepted') {
      await this.groupMemberRepo.add({
        groupId,
        userId: requestId,
        role: 'student',
        joinedAt: new Date()
      });
      await this.groupRequestRepo.updateStatus(groupId, requestId, 'accepted');
      
      // Notificar al usuario que fue aceptado
      if (this.subject && group) {
        this.subject.notify(GroupEvents.MIEMBRO_ACEPTADO, {
          targetUserId: requestId,
          groupId: group.id,
          groupName: group.name
        });
      }
    } else {
      await this.groupRequestRepo.updateStatus(groupId, requestId, 'rejected');
      
      // Notificar al usuario que fue rechazado
      if (this.subject && group) {
        this.subject.notify(GroupEvents.MIEMBRO_RECHAZADO, {
          targetUserId: requestId,
          groupId: group.id,
          groupName: group.name
        });
      }
    }

    return { message: `Solicitud ${status} correctamente` };
  }
}

module.exports = HandleRequestAction;
