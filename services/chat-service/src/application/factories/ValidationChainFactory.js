const ValidarCamposHandler = require('../validations/ValidarCamposHandler');
const ValidarTamanoHandler = require('../validations/ValidarTamanoHandler');
const ValidarPermisosHandler = require('../validations/ValidarPermisosHandler');
const ValidarContenidoHandler = require('../validations/ValidarContenidoHandler');
const ValidarMencionesHandler = require('../validations/ValidarMencionesHandler');
const ValidarPermisosPrivadoHandler = require('../validations/ValidarPermisosPrivadoHandler');
const ValidarMencionesPrivadoHandler = require('../validations/ValidarMencionesPrivadoHandler');

/**
 * Factoría para la creación y ensamblaje de cadenas de validación.
 */
class ValidationChainFactory {
  /**
   * Crea la cadena de validación para mensajes de grupo.
   */
  static createGroupMessageChain(groupMemberRepo) {
    const campos = new ValidarCamposHandler();
    const tamano = new ValidarTamanoHandler(2000); 
    const permisos = new ValidarPermisosHandler(groupMemberRepo);
    const contenido = new ValidarContenidoHandler();
    const menciones = new ValidarMencionesHandler(groupMemberRepo);

    campos
      .setSiguiente(tamano)
      .setSiguiente(permisos)
      .setSiguiente(contenido)
      .setSiguiente(menciones);

    return campos;
  }

  /**
   * Crea la cadena de validación para mensajes privados (US-W06 C3).
   */
  static createPrivateMessageChain(chatRepo) {
    const campos = new ValidarCamposHandler();
    const tamano = new ValidarTamanoHandler(2000); 
    const permisos = new ValidarPermisosPrivadoHandler(chatRepo);
    const contenido = new ValidarContenidoHandler();
    const menciones = new ValidarMencionesPrivadoHandler(chatRepo);

    campos
      .setSiguiente(tamano)
      .setSiguiente(permisos)
      .setSiguiente(contenido)
      .setSiguiente(menciones);

    return campos;
  }
}

module.exports = ValidationChainFactory;
