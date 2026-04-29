const PerfilDecorator = require('./PerfilDecorator');

class PerfilConEstadisticas extends PerfilDecorator {
  constructor(perfil, stats) {
    super(perfil);
    this.stats = stats;
  }

  getProfileData() {
    const baseData = super.getProfileData();
    return {
      ...baseData,
      estadisticas: {
        gruposCreados: this.stats.gruposCreados || 0,
        gruposParticipa: this.stats.gruposParticipa || 0,
        mensajesEnviados: this.stats.mensajesEnviados || 0
      }
    };
  }
}

module.exports = PerfilConEstadisticas;
