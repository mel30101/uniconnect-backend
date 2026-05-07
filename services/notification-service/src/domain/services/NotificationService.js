class NotificationService {
  /**
   * @param {Array} strategies - Lista de estrategias inyectadas (Dependency Injection).
   */
  constructor(strategies = []) {
    this.strategies = strategies;
  }

  /**
   * Envía notificaciones a través de las estrategias activas.
   * @param {Object} payload - Datos del mensaje (title, body, token, etc.).
   * @param {Object} userPreferences - Preferencias del usuario (ej. { pushEnabled: true }).
   * @returns {Object} - Resultados de la ejecución de las estrategias.
   */
  async notifyAll(payload, userPreferences = {}) {
    const results = {
      success: [],
      errors: []
    };

    for (const strategy of this.strategies) {
      try {
        // Criterio 4: Si las preferencias desactivan el canal Push, no se ejecuta
        if (
          strategy.channel === 'push' &&
          userPreferences.pushEnabled === false
        ) {
          continue;
        }

        const res = await strategy.sendPush(
          payload.token,
          payload.title,
          payload.body,
          payload.data
        );
        results.success.push({
          strategy: strategy.constructor.name,
          data: res
        });
      } catch (error) {
        // Criterio 3: El fallo queda aislado y el ciclo continúa
        results.errors.push({
          strategy: strategy.constructor.name,
          error: error.message
        });
      }
    }

    return results;
  }
}

module.exports = NotificationService;