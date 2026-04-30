const { GroupEvents } = require('../../../domain/observer/ISubject');

class SendJoinRequest {
  constructor(groupRepo, groupMemberRepo, groupRequestRepo, subject) {
    this.groupRepo = groupRepo;
    this.groupMemberRepo = groupMemberRepo;
    this.groupRequestRepo = groupRequestRepo;
    this.subject = subject;
  }

  async execute(groupId, { userId, userName }) {
    if (!userId || !userName) {
      throw new Error('MISSING_FIELDS');
    }

    const group = await this.groupRepo.findById(groupId);
    if (!group) {
      throw new Error('GROUP_NOT_FOUND');
    }

    const member = await this.groupMemberRepo.findByGroupAndUser(groupId, userId);
    if (member) {
      throw new Error('ALREADY_MEMBER');
    }

    const existingRequest = await this.groupRequestRepo.findByGroupAndUser(groupId, userId);
    if (existingRequest) {
      if (existingRequest.status === 'pending') {
        throw new Error('REQUEST_ALREADY_EXISTS');
      }
      // Si ya existe (p.ej. fue rechazada), la "limpiamos" para crearla de nuevo
      // o simplemente dejamos que el .create (que hace un .set) la sobreescriba.
      // Pero borramos para asegurar que el timestamp de creación sea nuevo si se prefiere,
      // aunque FirestoreGroupRequestRepository.create ya usa serverTimestamp().
      await this.groupRequestRepo.deleteByUserAndGroup(groupId, userId);
    }

    const newRequest = { groupId, userId, userName };
    const result = await this.groupRequestRepo.create(newRequest);

    // Notificar al Admin del grupo
    if (this.subject && group.creatorId) {
      this.subject.notify(GroupEvents.SOLICITUD_INGRESO, {
        targetUserId: group.creatorId,
        groupId: group.id,
        groupName: group.name,
        userName: userName,
        applicantId: userId
      });
    }

    return result;
  }
  // ... rest of the methods
}

module.exports = SendJoinRequest;
