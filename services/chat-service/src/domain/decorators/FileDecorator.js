// src/domain/decorators/FileDecorator.js
class FileDecorator {
  async decorate(message) {
    if (message.type === 'file' && message.fileUrl) {
      const extensionMatch = message.fileName ? message.fileName.split('.').pop().toLowerCase() : '';
      let detectedType = 'documento';
      let icon = '📄';

      if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extensionMatch)) {
        detectedType = 'imagen';
        icon = '🖼️';
      } else if (['pdf'].includes(extensionMatch)) {
        detectedType = 'pdf';
        icon = '📕';
      } else if (['mp4', 'webm', 'ogg'].includes(extensionMatch)) {
        detectedType = 'video';
        icon = '🎥';
      } else if (['zip', 'rar', 'tar', 'gz'].includes(extensionMatch)) {
        detectedType = 'archivo_comprimido';
        icon = '🗜️';
      }

      message.visual_metadata = {
        detectedType,
        icon,
        extension: extensionMatch || 'unknown'
      };
    }
    
    return message;
  }
}

module.exports = FileDecorator;
