class LeaveGroup {
  constructor(groupMemberRepo) {
    this.groupMemberRepo = groupMemberRepo;
  }

  async execute(groupId, userId) {
    const member = await this.groupMemberRepo.findByGroupAndUser(groupId, userId);
    if (!member) {
      throw new Error('NOT_A_MEMBER');
    }

    await this.groupMemberRepo.remove(groupId, userId);
    return { message: 'Has salido del grupo correctamente' };
  }
}

module.exports = LeaveGroup;
