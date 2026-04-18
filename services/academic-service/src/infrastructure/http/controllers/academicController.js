const { asyncHandler } = require('../middlewares/errorMiddleware');

class AcademicController {
  constructor(useCases) {
    this.getAllFacultiesUC = useCases.getAllFaculties;
    this.getAcademicLevelsByFacultyUC = useCases.getAcademicLevelsByFaculty;
    this.getFormationLevelsUC = useCases.getFormationLevels;
    this.getCareersByPathUC = useCases.getCareersByPath;
    this.getAllCareersUC = useCases.getAllCareers;
    this.getAllSubjectsUC = useCases.getAllSubjects;
    this.getCareerStructureUC = useCases.getCareerStructure;
  }

  getAllFaculties = asyncHandler(async (req, res, next) => {
    const faculties = await this.getAllFacultiesUC.execute();
    res.json(faculties);
  });

  getAcademicLevelsByFaculty = asyncHandler(async (req, res, next) => {
    const levels = await this.getAcademicLevelsByFacultyUC.execute(req.params.facultyId);
    res.json(levels);
  });

  getFormationLevels = asyncHandler(async (req, res, next) => {
    const levels = await this.getFormationLevelsUC.execute(req.params.facultyId, req.params.academicLevelId);
    res.json(levels);
  });

  getCareersByPath = asyncHandler(async (req, res, next) => {
    const careers = await this.getCareersByPathUC.execute(
      req.params.facultyId,
      req.params.academicLevelId,
      req.params.formationLevelId
    );
    res.json(careers);
  });

  getAllCareers = asyncHandler(async (req, res, next) => {
    const careers = await this.getAllCareersUC.execute();
    if (careers.length === 0) {
      // Usar middleware lanzando error para mantener la estandarización
      throw new Error("No se encontraron carreras");
    }
    res.status(200).json(careers);
  });

  getAllSubjects = asyncHandler(async (req, res, next) => {
    const subjects = await this.getAllSubjectsUC.execute();
    res.json(subjects);
  });

  getCareerStructure = asyncHandler(async (req, res, next) => {
    const structure = await this.getCareerStructureUC.execute(req.params.careerId);
    res.status(200).json(structure);
  });
}

module.exports = AcademicController;
