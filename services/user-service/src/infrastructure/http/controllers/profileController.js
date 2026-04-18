const { asyncHandler } = require('../middlewares/errorMiddleware');

class ProfileController {
  constructor(useCases) {
    this.getFullProfileUC = useCases.getFullProfile;
    this.saveAcademicProfileUC = useCases.saveAcademicProfile;
  }

  getProfile = asyncHandler(async (req, res) => {
    const profile = await this.getFullProfileUC.execute(req.params.studentId);
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
