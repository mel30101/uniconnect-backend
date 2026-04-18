class GetFormationLevels {
  constructor(catalogRepo) {
    this.catalogRepo = catalogRepo;
  }

  async execute(facultyId, academicLevelId) {
    // Obtener mappings filtrados por facultad y nivel académico
    const mappings = await this.catalogRepo.getMappingsByFilter({ facultyId, academicLevelId });
    
    // Extraer IDs únicos de niveles de formación
    const formationIds = [...new Set(mappings.map(m => m.formationLevelId))];
    
    // Obtener los datos de cada nivel de formación
    return await this.catalogRepo.getFormationLevelsByIds(formationIds);
  }
}

module.exports = GetFormationLevels;
