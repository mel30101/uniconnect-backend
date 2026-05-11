const GroupMessage = require('../../domain/GroupMessage');
const MensajeConArchivo = require('../../domain/decorators/MensajeConArchivo');
const MensajeConMencion = require('../../domain/decorators/MensajeConMencion');
const ValidationChainFactory = require('../factories/ValidationChainFactory');
const chatSubject = require('../observer/ChatSubject');
const { ChatEvents } = require('../../domain/observer/ISubject');

class SendGroupMessage {
  constructor(groupMessageRepo, groupMemberRepo, cloudinaryService = null) {
    this.groupMessageRepo = groupMessageRepo;
    this.groupMemberRepo = groupMemberRepo;
    this.cloudinaryService = cloudinaryService;
    
    // Inicializamos la cadena de validación
    this.validationChain = ValidationChainFactory.createGroupMessageChain(this.groupMemberRepo);
  }

  async execute(groupId, senderId, messageData, file = null) {
    // 1. Ejecutar Cadena de Responsabilidad (Validación y Detección de Menciones)
    // Criterio 5: Validar antes de gastar memoria o recursos externos
    const validationRequest = { 
      groupId, 
      senderId, 
      text: messageData.text, 
      file 
    };
    
    const validationResult = await this.validationChain.manejar(validationRequest);
    
    if (!validationResult.esValido) {
      const error = new Error(validationResult.error);
      error.codigo = validationResult.codigo;
      throw error;
    }

    // 2. Si hay archivo y pasó la validación, subirlo a Cloudinary
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

    // 3. Crear instancia base del mensaje de grupo
    let message = new GroupMessage({
      senderId,
      type,
      text: messageData.text || '',
      fileUrl,
      fileName
    });

    // 4. Aplicar Decoradores (Modularmente)
    
    // 4a. Decorador de Archivo (si aplica)
    if (type === 'file' && fileUrl) {
      message = new MensajeConArchivo(message, {
        url: fileUrl,
        mimeType: mimeType || 'application/octet-stream',
        tamano: tamano || 0,
        fileName: fileName
      });
    }

    // 4b. Decorador de Mención (Utilizando datos inyectados por la cadena)
    // Criterio 4: Evitar re-procesamiento de menciones
    const mentions = validationRequest.mentions || [];
    if (mentions.length > 0) {
      message = new MensajeConMencion(message, mentions);
    }

    // 5. Guardar en Base de Datos
    const messageJson = message.toJSON();
    
    // US-CH01: El backend es la única fuente de verdad para el marcado de menciones
    if (validationRequest.renderedText) {
      messageJson.renderedContent = validationRequest.renderedText;
    }
    
    // US-CH01: El backend es la única fuente de verdad para el marcado de menciones
    if (validationRequest.renderedText) {
      messageJson.renderedContent = validationRequest.renderedText;
    }

    const messageId = await this.groupMessageRepo.create(groupId, messageJson);
    
    const result = {
      messageId,
      ...messageJson
    };

    const messageId = await this.groupMessageRepo.create(groupId, messageJson);
    
    const result = {
      messageId,
      ...messageJson
    };

    // 6. Notificar a los Observadores (ChatSubject)
    // Criterio: Cerrar el flujo notificando a los interesados tras la persistencia
    chatSubject.notify(ChatEvents.NUEVO_MENSAJE, {
      groupId,
      message: {
        message_id: messageId,
        timestamp: new Date().toISOString(),
        sender: { id: senderId },
        content: result.content,
        renderedContent: result.renderedContent,
        metadata: result
      }
    });

    return result;
  }
}

module.exports = SendGroupMessage;
