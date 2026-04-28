const INotificationProvider = require('../../domain/services/INotificationProvider');

class FirebaseNotificationProvider extends INotificationProvider {
  constructor(admin) {
    super();
    this.admin = admin;
  }

  async sendPush(token, title, body, data = {}) {
    const message = {
      notification: {
        title,
        body,
      },
      data: this._stringifyData(data),
      token: token,
    };

    try {
      const response = await this.admin.messaging().send(message);
      console.log('Successfully sent message:', response);
      return response;
    } catch (error) {
      console.error('Error sending push notification:', error);
      if (error.code === 'messaging/registration-token-not-registered') {
        // Here we could emit an event to remove this invalid token
        console.warn(`Token ${token} is no longer valid.`);
      }
      throw error;
    }
  }

  async sendPushToMultiple(tokens, title, body, data = {}) {
    if (!tokens || tokens.length === 0) return;

    const message = {
      notification: {
        title,
        body,
      },
      data: this._stringifyData(data),
      tokens: tokens,
    };

    try {
      const response = await this.admin.messaging().sendEachForMulticast(message);
      console.log(`${response.successCount} messages were sent successfully`);
      
      if (response.failureCount > 0) {
        const failedTokens = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push(tokens[idx]);
            console.error(`Failed to send to token ${tokens[idx]}:`, resp.error);
          }
        });
        // Logic to handle failed tokens (remove from DB) could be triggered here
      }
      
      return response;
    } catch (error) {
      console.error('Error sending multicast notification:', error);
      throw error;
    }
  }

  /**
   * FCM data payload values must be strings
   */
  _stringifyData(data) {
    const stringified = {};
    for (const key in data) {
      if (typeof data[key] !== 'string') {
        stringified[key] = JSON.stringify(data[key]);
      } else {
        stringified[key] = data[key];
      }
    }
    return stringified;
  }
}

module.exports = FirebaseNotificationProvider;
