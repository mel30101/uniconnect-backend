class RemoveMember {
  constructor(groupMemberRepo) {
    this.groupMemberRepo = groupMemberRepo;
  }

  async execute(groupId, userId, adminId) {
    // Verificar que quien intenta eliminar es admin
    const adminMember = await this.groupMemberRepo.findByGroupAndUser(groupId, adminId);
    if (!adminMember || adminMember.role !== 'admin') {
      throw new Error('NOT_AUTHORIZED');
    }

    // No puede eliminarse a sí mismo
    if (userId === adminId) {
      throw new Error('CANNOT_REMOVE_SELF');
    }

    // Verificar que el usuario es miembro
    const member = await this.groupMemberRepo.findByGroupAndUser(groupId, userId);
    if (!member) {
      throw new Error('MEMBER_NOT_FOUND');
    }

    await this.groupMemberRepo.remove(groupId, userId);
    return { message: 'Miembro eliminado con éxito del grupo' };
  }
}

module.exports = RemoveMember;
