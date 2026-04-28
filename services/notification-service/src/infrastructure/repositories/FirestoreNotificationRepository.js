class FirestoreNotificationRepository {
  constructor(db) {
    this.db = db;
  }

  async save(notification) {
    const data = notification.toFirestore();
    const docRef = this.db.collection('notifications').doc();
    await docRef.set(data);
    return docRef.id;
  }

  async findByUserId(userId, limit = 20) {
    const snapshot = await this.db.collection('notifications')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async markAsRead(notificationId) {
    await this.db.collection('notifications').doc(notificationId).update({
      status: 'read'
    });
  }

  async markAllAsRead(userId) {
    const snapshot = await this.db.collection('notifications')
      .where('userId', '==', userId)
      .where('status', '==', 'unread')
      .get();

    if (snapshot.empty) return;

    const batch = this.db.batch();
    snapshot.docs.forEach(doc => {
      batch.update(doc.ref, { status: 'read' });
    });
    await batch.commit();
  }

  async countUnread(userId) {
    const snapshot = await this.db.collection('notifications')
      .where('userId', '==', userId)
      .where('status', '==', 'unread')
      .get();
    return snapshot.size;
  }
}

module.exports = FirestoreNotificationRepository;
