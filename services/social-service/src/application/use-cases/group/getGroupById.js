class GetGroupById {
  constructor(groupRepo, groupMemberRepo, groupRequestRepo, catalogRepo, userRepo) {
    this.groupRepo = groupRepo;
    this.groupMemberRepo = groupMemberRepo;
    this.groupRequestRepo = groupRequestRepo;
    this.catalogRepo = catalogRepo;
    this.userRepo = userRepo;
  }

  async execute(groupId, userId = null) {
    const group = await this.groupRepo.findById(groupId);
    if (!group) return null;

    // Obtener nombre de la materia
    const subject = await this.catalogRepo.getSubjectById(group.subjectId);
    const subjectName = subject ? subject.name : 'Materia desconocida';

    // Obtener miembros con detalles
    const members = await this.groupMemberRepo.findByGroupId(groupId);
    const memberIds = members.map(m => m.userId);
    const memberUsers = await this.userRepo.findByIds(memberIds);

    const memberDetails = memberUsers.map(u => ({
      id: u.id,
      name: u.exists !== false ? u.name : 'Usuario desconocido',
      role: members.find(m => m.userId === u.id)?.role || 'student'
    }));

    let userStatus = 'none';
    if (userId) {
      if (group.creatorId === userId) {
        userStatus = 'admin';
      } else if (memberIds.includes(userId)) {
        userStatus = 'member';
      } else {
        // Check for pending/rejected requests
        const request = await this.groupRequestRepo.findByGroupAndUser(groupId, userId);
        if (request) {
          userStatus = request.status || 'pending';
        }
      }
    }

    return {
      ...group,
      subjectName,
      members: memberDetails,
      userStatus
    };
  }
}

module.exports = GetGroupById;
