const admin = require('firebase-admin');

class SaveAcademicProfile {
  constructor(academicProfileRepo, userRepo, catalogRepo, getFullProfileUseCase) {
    this.academicProfileRepo = academicProfileRepo;
    this.userRepo = userRepo;
    this.catalogRepo = catalogRepo;
    this.getFullProfileUseCase = getFullProfileUseCase;
  }

  async execute(data) {
    const {
      studentId,
      // Información personal
      biography,
      showEmail,
      phone,
      age,
      studyPreference,
      // Información académica
      facultyId,
      academicLevelId,
      formationLevelId,
      careerId,
      subjects,
    } = data;

    console.log("DATOS RECIBIDOS PARA GUARDAR:", data);

    // Buscar mappingId desde academic_mappings
    const mappings = await this.catalogRepo.getMappingsByFilter({
      facultyId,
      academicLevelId,
      formationLevelId,
      careerId
    });

    let mappingId = "";
    if (mappings.length > 0) {
      mappingId = mappings[0].id;
    } else {
      console.warn("No matching academic mapping found for:", { facultyId, academicLevelId, formationLevelId, careerId });
    }

    // 1. Guardar información personal en la colección 'users'
    const personalInfo = {
      biography: biography || "",
      showEmail: showEmail ?? true,
      phone: phone || "",
      age: age || "",
      studyPreference: studyPreference || "",
      updatedAt: new Date(),
      institutionalEmail: admin.firestore.FieldValue.delete(),
    };
    await this.userRepo.save(studentId, personalInfo);

    // 2. Guardar información académica en 'academic_profiles'
    const academicInfo = {
      studentId,
      mappingId,
      subjects: subjects || [],
      updatedAt: new Date(),
      institutionalEmail: admin.firestore.FieldValue.delete(),
      isMonitor: admin.firestore.FieldValue.delete(),
      // Eliminar campos antiguos explícitamente
      facultyId: admin.firestore.FieldValue.delete(),
      academicLevelId: admin.firestore.FieldValue.delete(),
      formationLevelId: admin.firestore.FieldValue.delete(),
      careerId: admin.firestore.FieldValue.delete(),
    };

    console.log("OBJETO academicInfo A GUARDAR EN FIRESTORE:", academicInfo);

    await this.academicProfileRepo.save(studentId, academicInfo);

    // Retornar el perfil completo
    const result = await this.getFullProfileUseCase.execute(studentId);
    console.log("PERFIL COMPLETO RETORNADO TRAS GUARDAR:", result);
    return result;
  }
}

module.exports = SaveAcademicProfile;
