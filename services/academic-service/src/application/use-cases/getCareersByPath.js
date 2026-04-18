class GetCareersByPath {
  constructor(catalogRepo) {
    this.catalogRepo = catalogRepo;
  }

  async execute(facultyId, academicLevelId, formationLevelId) {
    // Obtener mappings filtrados por ruta académica completa
    const mappings = await this.catalogRepo.getMappingsByFilter({
      facultyId,
      academicLevelId,
      formationLevelId
    });
    
    // Extraer IDs de carreras
    const careerIds = mappings.map(m => m.careerId);
    
    // Obtener datos de cada carrera
    return await this.catalogRepo.getCareersByIds(careerIds);
  }
}

module.exports = GetCareersByPath;
