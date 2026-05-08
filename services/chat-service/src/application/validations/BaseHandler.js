/**
 * Interfaz/Clase Base para el Patrón Chain of Responsibility.
 * Esta clase define el contrato de la interfaz IValidadorMensajeHandler solicitada en los requerimientos.
 */
class BaseHandler {
  constructor() {
    this.siguiente = null;
  }

  /**
   * Establece el siguiente eslabón en la cadena.
   * @param {BaseHandler} handler 
   * @returns {BaseHandler} El handler establecido para permitir encadenamiento fluido.
   */
  setSiguiente(handler) {
    this.siguiente = handler;
    return handler;
  }

  /**
   * Método principal de procesamiento.
   * @param {Object} request Objeto con la información a validar.
   * @returns {Promise<Object>} Resultado de la validación { esValido, error, codigo }.
   */
  async manejar(request) {
    if (this.siguiente) {
      return await this.siguiente.manejar(request);
    }
    return { esValido: true, error: null, codigo: 'OK' };
  }

  /**
   * Utilidad para retornar un fallo y cortar la cadena.
   */
  retornarError(error, codigo = 'VALIDATION_ERROR') {
    return {
      esValido: false,
      error,
      codigo
    };
  }
}

module.exports = BaseHandler;
