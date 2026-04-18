class GetGroupRequests {
  constructor(groupRequestRepo) {
    this.groupRequestRepo = groupRequestRepo;
  }

  async execute(groupId) {
    return await this.groupRequestRepo.findPendingByGroupId(groupId);
  }
}

module.exports = GetGroupRequests;
