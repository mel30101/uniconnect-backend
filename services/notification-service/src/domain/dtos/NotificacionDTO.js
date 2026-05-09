/**
 * Universal DTO for notifications across all channels.
 */
class NotificacionDTO {
  constructor({ userId, title, body, metadata = {}, type, eventType = 'GENERAL' }) {
    this.userId = userId;
    this.title = title;
    this.body = body;
    this.metadata = metadata; // Can contain { subject, deeplink, etc. }
    this.type = type; // 'chat', 'group', 'event'
    this.eventType = eventType; // 'MESSAGE', 'GRADE', 'ALERT', etc.
    this.createdAt = new Date();
  }
}

module.exports = NotificacionDTO;
