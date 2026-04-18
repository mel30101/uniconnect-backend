class Chat {
  constructor({ id, participants, lastMessage, updatedAt }) {
    this.id = id;
    this.participants = participants || [];
    this.lastMessage = lastMessage || '';
    this.updatedAt = updatedAt || new Date();
  }
}

module.exports = Chat;
