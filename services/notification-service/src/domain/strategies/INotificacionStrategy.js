/**
 * Interface for notification strategies.
 */
class INotificacionStrategy {
  /**
   * Sends a notification using a specific channel.
   * @param {Object} notification - The NotificacionDTO object.
   * @returns {Promise<{ canal: string, enviado: boolean, error?: string }>}
   */
  async enviar(notification) {
    throw new Error('Method enviar() must be implemented');
  }
}

module.exports = INotificacionStrategy;
