class CreateGroup {
  constructor(groupRepo, groupMemberRepo) {
    this.groupRepo = groupRepo;
    this.groupMemberRepo = groupMemberRepo;
  }

  async execute({ name, subjectId, description, creatorId }) {
    // Validar campos requeridos
    if (!name || !subjectId || !creatorId) {
      throw new Error('MISSING_FIELDS');
    }
    if (name.length < 3) {
      throw new Error('NAME_TOO_SHORT');
    }

    // Verificar nombre único
    const existing = await this.groupRepo.findByName(name);
    if (existing) {
      throw new Error('GROUP_NAME_ALREADY_EXISTS');
    }

    // Validar límite de 3 grupos por asignatura
    const existingCount = await this.groupRepo.countBySubjectId(subjectId);
    if (existingCount >= 3) {
      throw new Error('SUBJECT_GROUP_LIMIT_REACHED');
    }

    // Crear el grupo
    const newGroup = await this.groupRepo.create({ name, subjectId, description, creatorId });

    // Agregar creador como admin
    await this.groupMemberRepo.add({
      groupId: newGroup.id,
      userId: creatorId,
      role: 'admin',
      joinedAt: new Date()
    });

    return newGroup;
  }
}

module.exports = CreateGroup;