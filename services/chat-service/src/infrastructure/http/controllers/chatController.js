const { asyncHandler } = require('../middlewares/errorMiddleware');

class ChatController {
  constructor(useCases) {
    this.getOrCreateChatUC = useCases.getOrCreateChat;
    this.sendMessageUC = useCases.sendMessage;
    this.sendFileMessageUC = useCases.sendFileMessage;
    this.getMessagesUC = useCases.getMessages;
    this.addReactionUC = useCases.addReaction;
  }

  createChat = asyncHandler(async (req, res) => {
    const { userA, userB } = req.body;
    if (!userA || !userB) {
      return res.status(400).json({ error: "faltan usuarios" });
    }
    const chatId = await this.getOrCreateChatUC.execute(userA, userB);
    res.json({ chatId });
  });

  sendMessage = asyncHandler(async (req, res) => {
    const { chatId } = req.params;
    const { senderId, text } = req.body;
    if (!senderId || !text) {
      return res.status(400).json({ error: "Datos incompletos" });
    }
    await this.sendMessageUC.execute(chatId, senderId, text);
    res.sendStatus(200);
  });

  sendFileMessage = asyncHandler(async (req, res) => {
    // console.log("Cuerpo recibido:", req.body);
    // console.log("Archivo recibido:", req.file);
    const { chatId } = req.params;
    const { senderId, text } = req.body;
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "Archivo no subido" });
    }
    const result = await this.sendFileMessageUC.execute(chatId, senderId, file, text);
    res.json(result);
  });

  getMessage = asyncHandler(async (req, res) => {
    const { chatId } = req.params;
    const messages = await this.getMessagesUC.execute(chatId);
    res.json({ messages });
  });

  addReaction = asyncHandler(async (req, res) => {
    const { chatId, messageId } = req.params;
    const { emoji, userId } = req.body;

    if (!emoji || !userId) {
      return res.status(400).json({ error: "Datos de reacción incompletos" });
    }

    const result = await this.addReactionUC.execute(chatId, messageId, emoji, userId);
    res.json(result);
  });
}

module.exports = ChatController;