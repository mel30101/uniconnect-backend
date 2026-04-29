const IMensaje = require('../IMensaje');

/**
 * Clase base para los decoradores de mensajes.
 * Implementa IMensaje y delega las llamadas al objeto envuelto.
 */
class MensajeDecorator extends IMensaje {
  constructor(mensaje) {
    super();
    this.mensaje = mensaje;
  }

  getContenido() {
    return this.mensaje.getContenido();
  }

  getMetadata() {
    return this.mensaje.getMetadata();
  }

  render() {
    return this.mensaje.render();
  }
}

module.exports = MensajeDecorator;
