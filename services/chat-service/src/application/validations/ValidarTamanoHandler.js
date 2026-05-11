const BaseHandler = require('./BaseHandler');

/**
 * Valida que el mensaje no exceda el tamaño máximo de caracteres permitido.
 */
class ValidarTamanoHandler extends BaseHandler {
  /**
   * @param {number} maxSize Límite máximo de caracteres (por defecto 1000).
   */
  constructor(maxSize = 1000) {
    super();
    this.maxSize = maxSize;
  }

  async manejar(request) {
    const { text } = request;

    if (text && text.length > this.maxSize) {
      return this.retornarError(
        'El mensaje excede el límite de caracteres permitido',
        'MESSAGE_TOO_LONG'
      );
    }

    // Si el texto es válido o si no hay texto (solo archivo), continuamos
    return await super.manejar(request);
  }
}

module.exports = ValidarTamanoHandler;
