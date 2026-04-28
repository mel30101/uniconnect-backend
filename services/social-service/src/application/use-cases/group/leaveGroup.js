class LeaveGroup {
  constructor(groupMemberRepo, groupRepo) {
    this.groupMemberRepo = groupMemberRepo;
    this.groupRepo = groupRepo;
  }

  async execute(groupId, userId) {
    const group = await this.groupRepo.findById(groupId);
    if (!group) {
      throw new Error('GROUP_NOT_FOUND');
    }

    // Si es el admin (creador), no puede salir sin transferir
    if (group.creatorId === userId) {
      throw new Error('ADMIN_CANNOT_LEAVE_WITHOUT_TRANSFER');
    }

    const member = await this.groupMemberRepo.findByGroupAndUser(groupId, userId);
    if (!member) {
      throw new Error('NOT_A_MEMBER');
    }

    await this.groupMemberRepo.remove(groupId, userId);
    return { message: 'Has salido del grupo correctamente' };
  }
}

module.exports = LeaveGroup;
