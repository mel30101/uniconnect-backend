const MensajeBase = require('./MensajeBase');

class GroupMessage extends MensajeBase {
  constructor({ senderId, type = 'text', text = '', fileUrl = null, fileName = null }) {
    // Inicializamos la base con el texto y metadata inicial
    super(text, { senderId, type });
    
    this.senderId = senderId;
    this.type = type;
    this.text = text; // Mantenemos text por compatibilidad
    this.fileUrl = fileUrl;
    this.fileName = fileName;
  }

  // Sobrescribimos getMetadata para incluir campos específicos de GroupMessage
  getMetadata() {
    const baseMetadata = super.getMetadata();
    const metadata = {
      ...baseMetadata,
      senderId: this.senderId,
      type: this.type
    };
    if (this.fileUrl) metadata.fileUrl = this.fileUrl;
    if (this.fileName) metadata.fileName = this.fileName;
    return metadata;
  }

  // Permite obtener la representación pura del mensaje para guardarlo
  toJSON() {
    return {
      ...this.getMetadata(),
      content: this.getContenido(),
      renderedContent: this.render()
    };
  }
}

module.exports = GroupMessage;
