const BaseHandler = require('./BaseHandler');

/**
 * Verifica que el mensaje tenga contenido (texto) o un archivo.
 */
class ValidarCamposHandler extends BaseHandler {
  async manejar(request) {
    const { text, file } = request;

    const tieneTexto = text && text.trim().length > 0;
    const tieneArchivo = !!file;

    if (!tieneTexto && !tieneArchivo) {
      return this.retornarError(
        'El mensaje debe contener texto o un archivo adjunto.',
        'MISSING_CONTENT'
      );
    }

    return await super.manejar(request);
  }
}

module.exports = ValidarCamposHandler;
