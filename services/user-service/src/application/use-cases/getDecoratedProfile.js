const PerfilBase = require('../../domain/decorators/PerfilBase');
const PerfilConEstadisticas = require('../../domain/decorators/PerfilConEstadisticas');
const PerfilConInsignias = require('../../domain/decorators/PerfilConInsignias');

class GetDecoratedProfile {
  constructor(getFullProfileUC, statsRepo) {
    this.getFullProfileUC = getFullProfileUC;
    this.statsRepo = statsRepo;
  }

  async execute(studentId, viewType) {
    // 1. Get base profile
    const profileData = await this.getFullProfileUC.execute(studentId);
    
    // 2. Wrap in base decorator
    let perfil = new PerfilBase(profileData);

    // 3. Apply decorators if 'vista=completa'
    if (viewType === 'completa') {
      const stats = await this.statsRepo.getStudentStats(studentId);
      perfil = new PerfilConEstadisticas(perfil, stats);
      perfil = new PerfilConInsignias(perfil);
    }

    return perfil.getProfileData();
  }
}

module.exports = GetDecoratedProfile;
