const MensajeDecorator = require('./MensajeDecorator');

/**
 * Decorador que añade un mapa de reacciones a un mensaje.
 */
class MensajeConReaccion extends MensajeDecorator {
  constructor(mensaje) {
    super(mensaje);
    /** @type {Map<string, {count: number, users: string[]}>} */
    this.reacciones = new Map();
  }

  /**
   * Añade una reacción al mensaje.
   * @param {string} emoji 
   * @param {string} userId 
   */
  addReaccion(emoji, userId) {
    if (!this.reacciones.has(emoji)) {
      this.reacciones.set(emoji, { count: 0, users: [] });
    }
    const data = this.reacciones.get(emoji);
    if (!data.users.includes(userId)) {
      data.users.push(userId);
      data.count = data.users.length;
    }
  }

  getMetadata() {
    const metadata = super.getMetadata();
    // Convertir el Map a un objeto plano para la metadata
    const reaccionesObj = {};
    this.reacciones.forEach((value, key) => {
      reaccionesObj[key] = value;
    });
    
    return {
      ...metadata,
      reacciones: reaccionesObj
    };
  }
}

module.exports = MensajeConReaccion;
