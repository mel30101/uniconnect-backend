class GetAllFaculties {
  constructor(catalogRepo) {
    this.catalogRepo = catalogRepo;
  }

  async execute() {
    return await this.catalogRepo.getAllFaculties();
  }
}

module.exports = GetAllFaculties;
