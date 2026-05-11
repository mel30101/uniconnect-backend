const ValidarCamposHandler = require('../validations/ValidarCamposHandler');
const ValidarTamanoHandler = require('../validations/ValidarTamanoHandler');
const ValidarPermisosHandler = require('../validations/ValidarPermisosHandler');
const ValidarContenidoHandler = require('../validations/ValidarContenidoHandler');
const ValidarMencionesHandler = require('../validations/ValidarMencionesHandler');

/**
 * Factoría para la creación y ensamblaje de cadenas de validación.
 */
class ValidationChainFactory {
  /**
   * Crea la cadena de validación para mensajes de grupo.
   * Orden de eficiencia: Sincrónico -> Repositorio -> Procesamiento -> Complejo.
   * @param {Object} groupMemberRepo Repositorio de miembros de grupo.
   * @returns {Object} El primer eslabón de la cadena (ValidarCamposHandler).
   */
  static createGroupMessageChain(groupMemberRepo) {
    const campos = new ValidarCamposHandler();
    const tamano = new ValidarTamanoHandler(2000); // Límite configurable
    const permisos = new ValidarPermisosHandler(groupMemberRepo);
    const contenido = new ValidarContenidoHandler();
    const menciones = new ValidarMencionesHandler(groupMemberRepo);

    // Encadenamiento
    // NOTA DE EXTENSIBILIDAD: Para agregar un 'ValidarAdjuntoHandler', simplemente 
    // se instanciaría y se insertaría en la cadena usando setSiguiente, 
    // por ejemplo: campos.setSiguiente(adjuntos).setSiguiente(tamano)...
    // No requiere modificar ninguno de los handlers existentes.
    campos
      .setSiguiente(tamano)
      .setSiguiente(permisos)
      .setSiguiente(contenido)
      .setSiguiente(menciones);

    return campos;
  }
}

module.exports = ValidationChainFactory;
