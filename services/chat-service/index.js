// services/chat-service/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { db } = require('./src/config/firestore');

// --- 1. INFRAESTRUCTURA EXTERNA (Cloudinary) ---
const CloudinaryService = require('./src/infrastructure/external/CloudinaryService');
const cloudinaryService = new CloudinaryService({
  cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  apiKey: process.env.CLOUDINARY_API_KEY,
  apiSecret: process.env.CLOUDINARY_API_SECRET
});

// --- 2. REPOSITORIOS ---
const FirestoreChatRepository = require('./src/infrastructure/database/FirestoreChatRepository');
const FirestoreMessageRepository = require('./src/infrastructure/database/FirestoreMessageRepository');

const chatRepo = new FirestoreChatRepository(db);
const messageRepo = new FirestoreMessageRepository(db);

// --- 3. CASOS DE USO (Inyección en cascada) ---
const GetOrCreateChat = require('./src/application/use-cases/getOrCreateChat');
const SendMessage = require('./src/application/use-cases/sendMessage');
const SendFileMessage = require('./src/application/use-cases/sendFileMessage');
const GetMessages = require('./src/application/use-cases/getMessages');

const getOrCreateChatUC = new GetOrCreateChat(chatRepo);
const sendMessageUC = new SendMessage(messageRepo, chatRepo);
// IMPORTANTE: sendFileMessage recibe el servicio de Cloudinary y el UC de mensajes
const sendFileMessageUC = new SendFileMessage(cloudinaryService, sendMessageUC);
const getMessagesUC = new GetMessages(messageRepo);

// --- 4. CONTROLADOR ---
const ChatController = require('./src/infrastructure/http/controllers/chatController');
const chatCtrl = new ChatController({
  getOrCreateChat: getOrCreateChatUC,
  sendMessage: sendMessageUC,
  sendFileMessage: sendFileMessageUC,
  getMessages: getMessagesUC
});

// --- 5. RUTAS Y MIDDLEWARES ---
const createChatRoutes = require('./src/infrastructure/http/routes/chatRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// Proteger todas las rutas de chat con el token de Firebase
app.use('/', createChatRoutes(chatCtrl));

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => {
  console.log(`💬 Chat Service listo en puerto ${PORT} (Cloudinary activo)`);
});