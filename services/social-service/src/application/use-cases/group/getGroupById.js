class GetGroupById {
  constructor(groupRepo, groupMemberRepo, catalogRepo, userRepo) {
    this.groupRepo = groupRepo;
    this.groupMemberRepo = groupMemberRepo;
    this.catalogRepo = catalogRepo;
    this.userRepo = userRepo;
  }

  async execute(groupId) {
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

    return {
      ...group,
      subjectName,
      members: memberDetails
    };
  }
}

module.exports = GetGroupById;
