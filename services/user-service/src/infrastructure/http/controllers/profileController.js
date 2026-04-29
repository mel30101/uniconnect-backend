const { asyncHandler } = require('../middlewares/errorMiddleware');

class ProfileController {
  constructor(useCases) {
    this.getFullProfileUC = useCases.getFullProfile;
    this.saveAcademicProfileUC = useCases.saveAcademicProfile;
    this.getDecoratedProfileUC = useCases.getDecoratedProfile;
  }

  getProfile = asyncHandler(async (req, res) => {
    // Retorna unicamente el perfil base (sin costo computacional extra)
    const profile = await this.getDecoratedProfileUC.execute(req.params.studentId, 'base');
    res.status(200).json(profile);
  });

  getDecoratedProfile = asyncHandler(async (req, res) => {
    const vista = req.query.vista;
    const profile = await this.getDecoratedProfileUC.execute(req.params.studentId, vista);
    res.status(200).json(profile);
  });

  upsertProfile = asyncHandler(async (req, res) => {
    const { studentId, subjects, careerId } = req.body;
    if (!studentId || !subjects || !careerId) {
      return res.status(400).json({ error: "Datos incompletos (studentId, subjects y careerId son requeridos)" });
    }
    const result = await this.saveAcademicProfileUC.execute(req.body);
    res.status(200).json(result);
  });
}

module.exports = ProfileController;
