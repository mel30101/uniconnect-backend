class HandleRequestAction {
  constructor(groupMemberRepo, groupRequestRepo) {
    this.groupMemberRepo = groupMemberRepo;
    this.groupRequestRepo = groupRequestRepo;
  }

  async execute(groupId, requestId, status) {
    if (status === 'accepted') {
      // Agregar como miembro
      await this.groupMemberRepo.add({
        groupId,
        userId: requestId,
        role: 'student',
        joinedAt: new Date()
      });
      await this.groupRequestRepo.updateStatus(groupId, requestId, 'accepted');
    } else {
      await this.groupRequestRepo.updateStatus(groupId, requestId, 'rejected');
    }

    return { message: `Solicitud ${status} correctamente` };
  }
}

module.exports = HandleRequestAction;
