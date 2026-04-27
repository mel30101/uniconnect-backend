const GroupMessage = require('../../domain/GroupMessage');
const MentionDecorator = require('../../domain/decorators/MentionDecorator');
const FileDecorator = require('../../domain/decorators/FileDecorator');

class SendGroupMessage {
  constructor(groupMessageRepo, groupMemberRepo, cloudinaryService = null) {
    this.groupMessageRepo = groupMessageRepo;
    // Instanciamos los decoradores
    this.mentionDecorator = new MentionDecorator(groupMemberRepo);
    this.fileDecorator = new FileDecorator();
    this.cloudinaryService = cloudinaryService;
  }

  async execute(groupId, senderId, messageData, file = null) {
    // 1. Si hay archivo, subirlo a Cloudinary primero
    let fileUrl = messageData.fileUrl || null;
    let fileName = messageData.fileName || null;
    let type = messageData.type || 'text';

    if (file && this.cloudinaryService) {
      try {
        const uploadResult = await this.cloudinaryService.uploadFile(file);
        fileUrl = uploadResult.fileUrl || uploadResult.secure_url;
        fileName = file.originalname;
        type = 'file';
      } catch (error) {
        console.error('Error uploading file to Cloudinary:', error);
        throw new Error('No se pudo subir el archivo para el chat grupal');
      }
    }

    // 2. Crear instancia base del mensaje de grupo
    let message = new GroupMessage({
      senderId,
      type,
      text: messageData.text || '',
      fileUrl,
      fileName
    });

    // 3. Aplicar Decoradores (Pipeline)
    message = await this.mentionDecorator.decorate(message, groupId);
    message = await this.fileDecorator.decorate(message);

    // 4. Guardar en Base de Datos (en grupos/{groupId}/messages)
    const messageId = await this.groupMessageRepo.create(groupId, message.toJSON());
    
    return {
      messageId,
      ...message.toJSON()
    };
  }
}

module.exports = SendGroupMessage;
