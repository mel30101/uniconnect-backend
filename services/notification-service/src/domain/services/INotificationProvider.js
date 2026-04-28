/**
 * @interface INotificationProvider
 */
class INotificationProvider {
  async sendPush(token, title, body, data) {
    throw new Error('Method not implemented');
  }

  async sendPushToMultiple(tokens, title, body, data) {
    throw new Error('Method not implemented');
  }
}

module.exports = INotificationProvider;
