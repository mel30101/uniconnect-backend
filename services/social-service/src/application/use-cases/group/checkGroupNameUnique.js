class CheckGroupNameUnique {
  constructor(groupRepo) {
    this.groupRepo = groupRepo;
  }

  async execute(name) {
    const existing = await this.groupRepo.findByName(name);
    return !existing;
  }
}

module.exports = CheckGroupNameUnique;
