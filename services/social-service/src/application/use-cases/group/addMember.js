class AddMember {
  constructor(groupMemberRepo) {
    this.groupMemberRepo = groupMemberRepo;
  }

  async execute(groupId, { userId, role }) {
    // Verificar que no sea ya miembro
    const existing = await this.groupMemberRepo.findByGroupAndUser(groupId, userId);
    if (existing) {
      throw new Error('ALREADY_MEMBER');
    }

    await this.groupMemberRepo.add({
      groupId,
      userId,
      role: role || 'student',
      joinedAt: new Date()
    });

    return { message: 'Miembro añadido correctamente' };
  }
}

module.exports = AddMember;
