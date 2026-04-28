const Notification = require('../../domain/entities/Notification');

/**
 * Persists a notification in Firestore for the user's dashboard/history.
 * No push (FCM) logic - only persistence.
 */
class SendNotification {
  constructor(notificationRepo) {
    this.notificationRepo = notificationRepo;
  }

  async execute({ userId, title, body, metadata, type }) {
    console.log(`[Notification] Saving for user ${userId}: ${title}`);

    const notification = new Notification({
      userId,
      title,
      body,
      metadata,
      type,
      status: 'unread',
      createdAt: new Date()
    });

    const notificationId = await this.notificationRepo.save(notification);
    console.log(`[Notification] Saved with id ${notificationId}`);
    return { notificationId };
  }
}

module.exports = SendNotification;
