class GetAcademicLevelsByFaculty {
  constructor(catalogRepo) {
    this.catalogRepo = catalogRepo;
  }

  async execute(facultyId) {
    // Obtener mappings filtrados por facultad
    const mappings = await this.catalogRepo.getMappingsByFilter({ facultyId });
    
    // Extraer IDs únicos de niveles académicos
    const levelIds = [...new Set(mappings.map(m => m.academicLevelId))];
    
    // Obtener los datos de cada nivel
    return await this.catalogRepo.getAcademicLevelsByIds(levelIds);
  }
}

module.exports = GetAcademicLevelsByFaculty;
