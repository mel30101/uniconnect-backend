class GroupMessage {
  constructor({ senderId, type = 'text', text = '', fileUrl = null, fileName = null }) {
    this.senderId = senderId;
    this.type = type;
    this.text = text;
    this.fileUrl = fileUrl;
    this.fileName = fileName;
    this.hasMention = false;
    this.mentionedUserIds = [];
    this.visual_metadata = null;
  }

  // Permite obtener la representación pura del mensaje para guardarlo
  toJSON() {
    const data = {
      senderId: this.senderId,
      type: this.type,
      text: this.text,
      hasMention: this.hasMention,
      mentionedUserIds: this.mentionedUserIds,
    };
    if (this.fileUrl) data.fileUrl = this.fileUrl;
    if (this.fileName) data.fileName = this.fileName;
    if (this.visual_metadata) data.visual_metadata = this.visual_metadata;
    
    return data;
  }
}

module.exports = GroupMessage;
