class GetAllSubjects {
  constructor(catalogRepo) {
    this.catalogRepo = catalogRepo;
  }

  async execute() {
    return await this.catalogRepo.getAllSubjects();
  }
}

module.exports = GetAllSubjects;
