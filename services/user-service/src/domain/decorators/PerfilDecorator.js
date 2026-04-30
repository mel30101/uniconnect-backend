class PerfilDecorator {
  constructor(perfil) {
    this.perfil = perfil;
  }

  getProfileData() {
    return this.perfil.getProfileData();
  }
}

module.exports = PerfilDecorator;
