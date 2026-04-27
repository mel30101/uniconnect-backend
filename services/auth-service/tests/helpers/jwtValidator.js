/**
 * JWT Validator Helper
 * Utilidades para validar estructura y contenido de JWTs
 */

const jwt = require('jsonwebtoken');

class JWTValidator {
  /**
   * Valida que un string sea un JWT con formato válido
   * @param {string} token - Token a validar
   * @returns {boolean}
   */
  static isValidFormat(token) {
    if (typeof token !== 'string') return false;
    const parts = token.split('.');
    return parts.length === 3;
  }

  /**
   * Decodifica un JWT sin validar firma
   * @param {string} token - Token a decodificar
   * @returns {object|null}
   */
  static decode(token) {
    try {
      const decoded = jwt.decode(token, { complete: true });
      return decoded;
    } catch (error) {
      return null;
    }
  }

  /**
   * Extrae el payload de un JWT
   * @param {string} token - Token
   * @returns {object|null}
   */
  static getPayload(token) {
    const decoded = this.decode(token);
    return decoded ? decoded.payload : null;
  }

  /**
   * Verifica si un JWT está expirado
   * @param {string} token - Token a verificar
   * @returns {boolean}
   */
  static isExpired(token) {
    const payload = this.getPayload(token);
    if (!payload || !payload.exp) return true;
    return Date.now() >= payload.exp * 1000;
  }

  /**
   * Obtiene el UID del payload del JWT
   * @param {string} token - Token
   * @returns {string|null}
   */
  static extractUid(token) {
    const payload = this.getPayload(token);
    return payload ? payload.uid : null;
  }

  /**
   * Valida que el JWT contenga los campos requeridos
   * @param {string} token - Token
   * @param {array} requiredFields - Campos que deben estar en el payload
   * @returns {boolean}
   */
  static hasRequiredFields(token, requiredFields = ['uid']) {
    const payload = this.getPayload(token);
    if (!payload) return false;
    return requiredFields.every(field => field in payload);
  }
}

module.exports = JWTValidator;
