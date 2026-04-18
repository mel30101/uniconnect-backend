class SearchStudents {
  constructor(academicProfileRepo, userRepo) {
    this.academicProfileRepo = academicProfileRepo;
    this.userRepo = userRepo;
  }

  async execute({ name, subjectId, excludeId }) {
    // Filtrar perfiles académicos por materia
    let subjectIdsArray = [];
    if (subjectId) {
      subjectIdsArray = subjectId.split(',');
    }

    const profiles = await this.academicProfileRepo.findBySubjectFilter(
      subjectIdsArray.length > 0 ? subjectIdsArray : null
    );

    if (profiles.length === 0) return [];

    let filteredProfiles = profiles;

    // Intersección manual si se buscan múltiples materias
    if (subjectId && subjectId.includes(',')) {
      filteredProfiles = filteredProfiles.filter(p =>
        subjectIdsArray.every(id => p.subjects.includes(id))
      );
    }

    const studentIds = filteredProfiles.map(p => p.studentId);
    if (studentIds.length === 0) return [];

    // Traer datos de usuarios (limitado a 10)
    const users = await this.userRepo.findByUids(studentIds.slice(0, 10));

    let results = users.map(userData => {
      const userProfile = filteredProfiles.find(p => p.studentId === userData.uid);
      return {
        id: userData.id,
        ...userData,
        materiasIds: userProfile ? userProfile.subjects : []
      };
    });

    // Filtros finales en memoria
    if (excludeId) results = results.filter(u => u.id !== excludeId);
    if (name) {
      const searchName = name.toLowerCase();
      results = results.filter(u => u.name?.toLowerCase().includes(searchName));
    }

    return results;
  }
}

module.exports = SearchStudents;
