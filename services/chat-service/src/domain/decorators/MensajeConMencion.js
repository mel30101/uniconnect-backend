const MensajeDecorator = require('./MensajeDecorator');

/**
 * Decorador que añade menciones de usuarios a un mensaje y resalta el renderizado.
 */
class MensajeConMencion extends MensajeDecorator {
  constructor(mensaje, userIds) {
    super(mensaje);
    this.userIds = userIds || [];
  }

  getMetadata() {
    const metadata = super.getMetadata();
    return {
      ...metadata,
      menciones: this.userIds
    };
  }

  render() {
    let rendered = super.render();
    this.userIds.forEach(userId => {
      // Resaltar el ID del usuario mencionado
      const regex = new RegExp(`@${userId}`, 'g');
      rendered = rendered.replace(regex, `**@${userId}**`);
    });
    return rendered;
  }
}

module.exports = MensajeConMencion;
