class GetEvents {
  constructor(eventRepo) {
    this.eventRepo = eventRepo;
  }

  async execute() {
    return await this.eventRepo.findAll();
  }
}

module.exports = GetEvents;
