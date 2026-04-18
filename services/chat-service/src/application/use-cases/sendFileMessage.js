class SendFileMessage {
  constructor(cloudinaryService, sendMessageUseCase) {
    this.cloudinaryService = cloudinaryService;
    this.sendMessageUseCase = sendMessageUseCase;
  }

  async execute(chatId, senderId, file) {
    if (!file) {
      throw new Error('FILE_NOT_UPLOADED');
    }

    // Subir archivo a Cloudinary
    const uploadedFile = await this.cloudinaryService.uploadFile(file);

    // Enviar mensaje de tipo archivo
    await this.sendMessageUseCase.execute(chatId, senderId, {
      type: 'file',
      fileUrl: uploadedFile.fileUrl,
      fileName: uploadedFile.fileName,
      text: `Envió un archivo: ${uploadedFile.fileName}`
    });

    return {
      fileUrl: uploadedFile.fileUrl,
      fileName: uploadedFile.fileName
    };
  }
}

module.exports = SendFileMessage;
