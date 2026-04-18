class GetFullProfile {
  constructor(academicProfileRepo, userRepo, catalogRepo) {
    this.academicProfileRepo = academicProfileRepo;
    this.userRepo = userRepo;
    this.catalogRepo = catalogRepo;
  }

  async execute(studentId) {
    // Consultas en paralelo para mejor performance
    const [profileData, userData] = await Promise.all([
      this.academicProfileRepo.findByStudentId(studentId),
      this.userRepo.findById(studentId)
    ]);

    const profile = profileData || {};
    const user = userData || {};

    if (!userData && !profileData) {
      throw new Error('PROFILE_NOT_FOUND');
    }

    // Resolver jerarquía desde academic_mappings si existe mappingId
    let mappingData = {};
    if (profile.mappingId) {
      const mapping = await this.catalogRepo.getMappingById(profile.mappingId);
      if (mapping) {
        mappingData = mapping;
      }
    }

    // Usar mappingData si está disponible, fallback a profileData
    const facultyId = mappingData.facultyId || profile.facultyId;
    const academicLevelId = mappingData.academicLevelId || profile.academicLevelId;
    const formationLevelId = mappingData.formationLevelId || profile.formationLevelId;
    const careerId = mappingData.careerId || profile.careerId;

    // Consultas paralelas de catálogos
    const [faculty, academicLevel, formationLevel, career, subjectDocs] = await Promise.all([
      this.catalogRepo.getFacultyById(facultyId),
      this.catalogRepo.getAcademicLevelById(academicLevelId),
      this.catalogRepo.getFormationLevelById(formationLevelId),
      this.catalogRepo.getCareerById(careerId),
      profile.subjects ? this.catalogRepo.getSubjectsByIds(profile.subjects) : Promise.resolve([])
    ]);

    return {
      ...user,
      ...profile,
      facultyId,
      academicLevelId,
      formationLevelId,
      careerId,
      userName: user.name || 'Sin nombre',
      facultyName: faculty ? faculty.name : 'No especificada',
      academicLevelName: academicLevel ? academicLevel.name : 'No especificado',
      formationLevelName: formationLevel ? formationLevel.name : 'No especificado',
      careerName: career ? career.name : 'No encontrada',
      subjectNames: subjectDocs.map(d => d.exists !== false ? d.name : 'Materia desconocida')
    };
  }
}

module.exports = GetFullProfile;
