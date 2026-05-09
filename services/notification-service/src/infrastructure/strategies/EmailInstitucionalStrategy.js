const INotificacionStrategy = require('../../domain/strategies/INotificacionStrategy');

class EmailInstitucionalStrategy extends INotificacionStrategy {
  constructor() {
    super();
  }

  async enviar(notification) {
    try {
      const subject = notification.metadata.subject || notification.title;
      
      console.log(`[EmailStrategy] SIMULATING SMTP SEND...`);
      console.log(`[EmailStrategy] To: User ID ${notification.userId}`);
      console.log(`[EmailStrategy] Subject: ${subject}`);
      console.log(`[EmailStrategy] Body: ${notification.body}`);
      console.log(`[EmailStrategy] Config: Institutional Relay (unicaldas.edu.co)`);

      return {
        canal: 'email',
        enviado: true
      };
    } catch (error) {
      console.error('[EmailStrategy] Error:', error.message);
      return {
        canal: 'email',
        enviado: false,
        error: error.message
      };
    }
  }
}

module.exports = EmailInstitucionalStrategy;
