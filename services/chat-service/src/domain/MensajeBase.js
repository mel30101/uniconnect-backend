const IMensaje = require('./IMensaje');

/**
 * Clase MensajeBase que representa un mensaje simple sin capacidades adicionales.
 */
class MensajeBase extends IMensaje {
  constructor(contenido, metadata = {}) {
    super();
    this.contenido = contenido;
    this.metadata = metadata;
  }

  getContenido() {
    return this.contenido;
  }

  getMetadata() {
    return this.metadata;
  }

  render() {
    return this.contenido;
  }
}

module.exports = MensajeBase;
