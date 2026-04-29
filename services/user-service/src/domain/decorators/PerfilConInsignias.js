const PerfilDecorator = require('./PerfilDecorator');

class PerfilConInsignias extends PerfilDecorator {
  constructor(perfil) {
    super(perfil);
  }

  getProfileData() {
    const baseData = super.getProfileData();
    const stats = baseData.estadisticas || { gruposCreados: 0, gruposParticipa: 0, mensajesEnviados: 0 };
    
    const insignias = [];
    
    if (stats.mensajesEnviados > 10) {
      insignias.push("Comunicador Frecuente");
    }
    if (stats.mensajesEnviados >= 50) {
      insignias.push("Gran Hablador");
    }
    if (stats.gruposCreados >= 1) {
      insignias.push("Líder de Estudio");
    }
    if (stats.gruposParticipa >= 3) {
      insignias.push("Colaborador Activo");
    }

    return {
      ...baseData,
      insignias
    };
  }
}

module.exports = PerfilConInsignias;
