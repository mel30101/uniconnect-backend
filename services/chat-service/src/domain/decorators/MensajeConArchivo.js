const MensajeDecorator = require('./MensajeDecorator');

/**
 * Decorador que añade información de archivo a un mensaje.
 */
class MensajeConArchivo extends MensajeDecorator {
  constructor(mensaje, { url, mimeType, tamano, fileName }) {
    super(mensaje);
    this.url = url;
    this.mimeType = mimeType;
    this.tamano = tamano;
    this.fileName = fileName;
    
    // Lógica de detección heredada del antiguo FileDecorator
    const extension = fileName ? fileName.split('.').pop().toLowerCase() : '';
    this.extension = extension;
    this._detectType(extension);
  }

  _detectType(ext) {
    this.detectedType = 'documento';
    this.icon = '📄';

    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
      this.detectedType = 'imagen';
      this.icon = '🖼️';
    } else if (ext === 'pdf') {
      this.detectedType = 'pdf';
      this.icon = '📕';
    } else if (['doc', 'docx'].includes(ext)) {
      this.detectedType = 'documento_word';
      this.icon = '📘';
    } else if (['xls', 'xlsx', 'csv'].includes(ext)) {
      this.detectedType = 'documento_excel';
      this.icon = '📗';
    } else if (['ppt', 'pptx'].includes(ext)) {
      this.detectedType = 'documento_powerpoint';
      this.icon = '📙';
    } else if (['mp4', 'webm', 'mov'].includes(ext)) {
      this.detectedType = 'video';
      this.icon = '🎥';
    } else if (['zip', 'rar', 'tar', 'gz'].includes(ext)) {
      this.detectedType = 'archivo_comprimido';
      this.icon = '📦';
    }
  }

  getMetadata() {
    const metadata = super.getMetadata();
    return {
      ...metadata,
      archivo: {
        url: this.url,
        mimeType: this.mimeType,
        tamano: this.tamano,
        fileName: this.fileName,
        detectedType: this.detectedType,
        icon: this.icon,
        extension: this.extension
      }
    };
  }

  render() {
    const rendered = super.render();
    return `${rendered} ${this.icon} (Archivo: ${this.fileName || this.url})`;
  }
}

module.exports = MensajeConArchivo;
