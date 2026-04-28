class Notification {
  constructor({ id, userId, title, body, metadata = {}, type, status = 'unread', createdAt = new Date() }) {
    this.id = id;
    this.userId = userId;
    this.title = title;
    this.body = body;
    this.metadata = metadata; // { chatId, groupId, eventId, etc. }
    this.type = type; // 'chat', 'group', 'event'
    this.status = status; // 'read', 'unread'
    this.createdAt = createdAt;
  }

  static fromFirestore(id, data) {
    return new Notification({
      id,
      ...data,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt)
    });
  }

  toFirestore() {
    return {
      userId: this.userId,
      title: this.title,
      body: this.body,
      metadata: this.metadata,
      type: this.type,
      status: this.status,
      createdAt: this.createdAt
    };
  }
}

module.exports = Notification;
