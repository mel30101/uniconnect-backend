class GetUserGroups {
  constructor(groupMemberRepo, groupRepo, catalogRepo, userRepo) {
    this.groupMemberRepo = groupMemberRepo;
    this.groupRepo = groupRepo;
    this.catalogRepo = catalogRepo;
    this.userRepo = userRepo;
  }

  async execute(userId, role) {
    const admin = require('firebase-admin');

    // Obtener membresías del usuario
    const memberships = await this.groupMemberRepo.findByUserId(userId, role);
    const groupIds = memberships.map(m => m.groupId);
    if (groupIds.length === 0) return [];

    // Obtener los grupos
    const groups = [];
    for (const groupId of groupIds) {
      const group = await this.groupRepo.findById(groupId);
      if (!group) continue;

      // Obtener nombre de la materia
      const subject = await this.catalogRepo.getSubjectById(group.subjectId);
      const subjectName = subject ? subject.name : 'Materia desconocida';

      // Obtener nombre del admin/creador
      let adminName = 'Desconocido';
      if (group.creatorId) {
        const creator = await this.userRepo.findById(group.creatorId);
        if (creator) adminName = creator.name;
      }

      // Obtener miembros
      const members = await this.groupMemberRepo.findByGroupId(groupId);
      const memberIds = members.map(m => m.userId);
      const memberUsers = await this.userRepo.findByIds(memberIds);
      const memberNames = memberUsers.map(u => u.exists !== false ? u.name : 'Usuario desconocido');

      groups.push({
        ...group,
        subjectName,
        adminName,
        members: memberNames
      });
    }

    return groups;
  }
}

module.exports = GetUserGroups;
