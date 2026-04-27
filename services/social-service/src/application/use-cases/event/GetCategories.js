class GetCategories {
  constructor(categoryRepo) {
    this.categoryRepo = categoryRepo;
  }

  async execute() {
    return await this.categoryRepo.findAll();
  }
}

module.exports = GetCategories;
