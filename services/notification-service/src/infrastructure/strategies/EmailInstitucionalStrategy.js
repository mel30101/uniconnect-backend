const sgMail = require('@sendgrid/mail');
const mjml2html = require('mjml');
const fs = require('fs');
const path = require('path');
const INotificacionStrategy = require('../../domain/strategies/INotificacionStrategy');

/**
 * Strategy for sending professional emails using SendGrid and MJML templates.
 */
class EmailInstitucionalStrategy extends INotificacionStrategy {
  constructor() {
    super();
    this.canal = 'email';
    
    // Initialize SendGrid API Key
    if (process.env.SENDGRID_API_KEY) {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    }
  }

  /**
   * Renders the MJML template into HTML injecting dynamic data.
   * @private
   */
  async _renderTemplate(data) {
    try {
      const templatePath = path.join(__dirname, '../templates/NotificationTemplate.mjml');
      let mjmlString = fs.readFileSync(templatePath, 'utf8');

      // Inject data into placeholders
      // Note: For a more robust solution, we could use Handlebars/Mustache
      const renderedMjml = mjmlString
        .replace(/{{userName}}/g, data.userName || 'Estudiante')
        .replace(/{{title}}/g, data.title)
        .replace(/{{body}}/g, data.body);

      const htmlOutput = await (mjml2html.default || mjml2html)(renderedMjml);

      return htmlOutput.html;
    } catch (error) {
      console.error('[EmailStrategy] Error rendering MJML template:', error.message);
      throw new Error('TEMPLATE_RENDER_ERROR');
    }
  }

  async enviar(notification) {
    try {
      console.log(`[EmailStrategy] Preparing email for user ${notification.userId}`);

      if (!process.env.SENDGRID_API_KEY) {
        throw new Error('SENDGRID_API_KEY_NOT_CONFIGURED');
      }

      // 1. Determine destination email
      // We check if it comes in metadata, otherwise we fallback to a default pattern
      const recipientEmail = notification.metadata?.email || `${notification.userId}@unicaldas.edu.co`;

      // 2. Render the professional HTML template
      const htmlContent = await this._renderTemplate({
        userName: notification.metadata?.userName,
        title: notification.title,
        body: notification.body
      });

      // 3. Construct the message
      const msg = {
        to: recipientEmail,
        from: process.env.SENDGRID_FROM_EMAIL || 'no-reply@uniconnect.edu.co',
        subject: `UniConnect: ${notification.title}`,
        text: notification.body, // Added text fallback
        html: htmlContent,
      };

      // 4. Send using SendGrid SDK
      const response = await sgMail.send(msg);
      
      console.log(`[EmailStrategy] Email dispatched successfully via SendGrid to ${recipientEmail}`);

      return {
        canal: 'email',
        enviado: true,
        messageId: response[0]?.headers['x-message-id'] || 'sent'
      };

    } catch (error) {
      console.error('[EmailStrategy] Failed to dispatch email:', error.response?.body || error.message);
      
      return {
        canal: 'email',
        enviado: false,
        error: error.message || 'SENDGRID_DISPATCH_FAILURE'
      };
    }
  }
}

module.exports = EmailInstitucionalStrategy;
