/**
 * Interfaz IMensaje que define los métodos base para los mensajes y sus decoradores.
 */
class IMensaje {
  /**
   * Obtiene el contenido textual del mensaje.
   * @returns {string}
   */
  getContenido() {
    throw new Error("Método 'getContenido()' debe ser implementado.");
  }

  /**
   * Obtiene la metadata del mensaje (archivos, menciones, reacciones, etc).
   * @returns {Object}
   */
  getMetadata() {
    throw new Error("Método 'getMetadata()' debe ser implementado.");
  }

  /**
   * Renderiza el mensaje para su visualización.
   * @returns {string}
   */
  render() {
    throw new Error("Método 'render()' debe ser implementado.");
  }
}

module.exports = IMensaje;
