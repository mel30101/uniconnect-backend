class GetCareerStructure {
  constructor(catalogRepo) {
    this.catalogRepo = catalogRepo;
  }

  async execute(careerId) {
    // 1. Obtener secciones de la carrera
    const sections = await this.catalogRepo.getSectionsByCareerId(careerId);

    if (sections.length === 0) {
      throw new Error('STRUCTURE_NOT_FOUND');
    }

    // 2. Obtener TODAS las materias
    const allSubjects = await this.catalogRepo.getAllSubjects();

    // 3. Organizar materias dentro de sus secciones
    const structure = sections.map(section => {
      const sectionSubjects = allSubjects.filter(sub =>
        String(sub.sectionId || '').trim() === String(section.id).trim()
      );

      return {
        sectionId: section.id,
        sectionName: section.name,
        subjects: sectionSubjects
      };
    });

    return structure;
  }
}

module.exports = GetCareerStructure;
