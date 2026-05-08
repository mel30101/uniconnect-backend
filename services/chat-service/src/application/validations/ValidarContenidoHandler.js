const BaseHandler = require('./BaseHandler');

/**
 * Filtra mensajes con contenido ofensivo o spam.
 */
class ValidarContenidoHandler extends BaseHandler {
  constructor() {
    super();
    this.palabrasProhibidas = ['spam', 'ofensa', 'grosería', 'maldición'];
  }

  async manejar(request) {
    const { text } = request;

    if (text) {
      const contenidoMinuscula = text.toLowerCase();
      const contieneOfensa = this.palabrasProhibidas.some(palabra => 
        contenidoMinuscula.includes(palabra)
      );

      if (contieneOfensa) {
        return this.retornarError(
          'El mensaje contiene palabras prohibidas o contenido ofensivo.',
          'OFFENSIVE_CONTENT'
        );
      }
    }

    return await super.manejar(request);
  }
}

module.exports = ValidarContenidoHandler;
