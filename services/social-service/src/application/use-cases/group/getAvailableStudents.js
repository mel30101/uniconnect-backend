class GetAvailableStudents {
  constructor(groupMemberRepo, userRepo) {
    this.groupMemberRepo = groupMemberRepo;
    this.userRepo = userRepo;
  }

  async execute(groupId, subjectId, search = '') {
    // Obtener miembros actuales del grupo
    const currentMembers = await this.groupMemberRepo.findByGroupId(groupId);
    const excludedIds = currentMembers.map(m => m.userId);

    // Obtener todos los usuarios
    const allUsers = await this.userRepo.findAll();

    // Filtrar: materia inscrita, no en el grupo, coincide con búsqueda
    const students = allUsers.filter(user => {
      const matchesSubject = user.enrolledSubjects?.includes(subjectId);
      const notInGroup = !excludedIds.includes(user.id);
      const matchesName = user.name?.toLowerCase().includes(search.toLowerCase());
      return matchesSubject && notInGroup && matchesName;
    });

    return students;
  }
}

module.exports = GetAvailableStudents;
