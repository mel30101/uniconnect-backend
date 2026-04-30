const GroupMessage = require('../../domain/GroupMessage');
const MensajeConArchivo = require('../../domain/decorators/MensajeConArchivo');
const MensajeConMencion = require('../../domain/decorators/MensajeConMencion');

class SendGroupMessage {
  constructor(groupMessageRepo, groupMemberRepo, cloudinaryService = null) {
    this.groupMessageRepo = groupMessageRepo;
    this.groupMemberRepo = groupMemberRepo;
    this.cloudinaryService = cloudinaryService;
  }

  async execute(groupId, senderId, messageData, file = null) {
    // 1. Si hay archivo, subirlo a Cloudinary primero
    let fileUrl = messageData.fileUrl || null;
    let fileName = messageData.fileName || null;
    let type = messageData.type || 'text';
    let mimeType = null;
    let tamano = 0;

    if (file && this.cloudinaryService) {
      try {
        const uploadResult = await this.cloudinaryService.uploadFile(file);
        fileUrl = uploadResult.fileUrl || uploadResult.secure_url;
        fileName = file.originalname;
        type = 'file';
        mimeType = file.mimetype;
        tamano = file.size;
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

    // 3. Aplicar Decoradores (Modularmente)
    
    // 3a. Decorador de Archivo (si aplica)
    if (type === 'file' && fileUrl) {
      message = new MensajeConArchivo(message, {
        url: fileUrl,
        mimeType: mimeType || 'application/octet-stream',
        tamano: tamano || 0,
        fileName: fileName
      });
    }

    // 3b. Decorador de Mención (Detección y Aplicación)
    const mentions = await this._detectMentions(message.getContenido(), groupId);
    if (mentions.length > 0) {
      message = new MensajeConMencion(message, mentions);
    }

    // 4. Guardar en Base de Datos
    const messageId = await this.groupMessageRepo.create(groupId, message.toJSON());
    
    return {
      messageId,
      ...message.toJSON()
    };
  }

  async _detectMentions(text, groupId) {
    if (!text) return [];
    const mentionRegex = /@([A-ZÁÉÍÓÚÑa-záéíóúñ]+(?:\s[A-ZÁÉÍÓÚÑa-záéíóúñ]+)*)/g;
    const matches = [...text.matchAll(mentionRegex)];
    
    if (matches.length === 0) return [];

    const allMembers = await this.groupMemberRepo.getGroupMembersWithNames(groupId);
    const mentionedUserIds = [];

    for (const match of matches) {
      const potentialName = match[1].toLowerCase().trim();
      const foundMember = allMembers.find(member => 
        member.name && member.name.toLowerCase().includes(potentialName)
      );

      if (foundMember && !mentionedUserIds.includes(foundMember.id)) {
        mentionedUserIds.push(foundMember.id);
      }
    }

    return mentionedUserIds;
  }
}

module.exports = SendGroupMessage;
