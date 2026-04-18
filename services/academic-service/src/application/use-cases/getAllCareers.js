class GetAllCareers {
  constructor(catalogRepo) {
    this.catalogRepo = catalogRepo;
  }

  async execute() {
    return await this.catalogRepo.getAllCareers();
  }
}

module.exports = GetAllCareers;
