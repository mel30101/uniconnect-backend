require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const { db } = require('./src/config/firestore');

// Infrastructure
const CloudinaryService = require('./src/infrastructure/external/CloudinaryService');
const cloudinaryService = new CloudinaryService({
  cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  apiKey: process.env.CLOUDINARY_API_KEY,
  apiSecret: process.env.CLOUDINARY_API_SECRET
});

const FirestoreChatRepository = require('./src/infrastructure/database/FirestoreChatRepository');
const FirestoreMessageRepository = require('./src/infrastructure/database/FirestoreMessageRepository');
const FirestoreGroupMessageRepository = require('./src/infrastructure/database/FirestoreGroupMessageRepository');
const FirestoreGroupMemberRepository = require('./src/infrastructure/database/FirestoreGroupMemberRepository');

const chatRepo = new FirestoreChatRepository(db);
const messageRepo = new FirestoreMessageRepository(db);
const groupMessageRepo = new FirestoreGroupMessageRepository(db);
const groupMemberRepo = new FirestoreGroupMemberRepository(db);

// Use Cases
const GetOrCreateChat = require('./src/application/use-cases/getOrCreateChat');
const SendMessage = require('./src/application/use-cases/sendMessage');
const SendFileMessage = require('./src/application/use-cases/sendFileMessage');
const GetMessages = require('./src/application/use-cases/getMessages');
const SendGroupMessage = require('./src/application/use-cases/sendGroupMessage');

const getOrCreateChatUC = new GetOrCreateChat(chatRepo);
const sendMessageUC = new SendMessage(messageRepo, chatRepo);
const sendFileMessageUC = new SendFileMessage(cloudinaryService, sendMessageUC);
const getMessagesUC = new GetMessages(messageRepo);
const sendGroupMessageUC = new SendGroupMessage(groupMessageRepo, groupMemberRepo, cloudinaryService);

// Controllers
const ChatController = require('./src/infrastructure/http/controllers/chatController');
const GroupChatController = require('./src/infrastructure/http/controllers/groupChatController');

const chatCtrl = new ChatController({
  getOrCreateChat: getOrCreateChatUC,
  sendMessage: sendMessageUC,
  sendFileMessage: sendFileMessageUC,
  getMessages: getMessagesUC
});

const groupChatCtrl = new GroupChatController({
  sendGroupMessage: sendGroupMessageUC
});

// Setup Express
const app = express();
app.use(cors());
app.use(express.json());

// Routes
const createChatRoutes = require('./src/infrastructure/http/routes/chatRoutes');
const createGroupChatRoutes = require('./src/infrastructure/http/routes/groupChatRoutes');

app.use('/', createChatRoutes(chatCtrl));
app.use('/groups', createGroupChatRoutes(groupChatCtrl));

// --- TAREA 1: AISLAMIENTO POR SALAS (Socket.io) ---
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on('connection', async (socket) => {
  const { userId, study_group_id } = socket.handshake.query;

  console.log(`[Socket] Intento de conexión: Usuario ${userId} para grupo ${study_group_id}`);

  if (!userId || !study_group_id) {
    console.error('[Socket] Falta userId o study_group_id');
    return socket.disconnect();
  }

  try {
    // 1. Validar ingreso al Room (Criterio de Aceptación 1)
    const isMember = await groupMemberRepo.isMember(study_group_id, userId);
    
    if (!isMember) {
      console.warn(`[Socket] Acceso denegado: Usuario ${userId} no pertenece al grupo ${study_group_id}`);
      return socket.disconnect();
    }

    // 2. Unir a la sala específica (Criterio de Aceptación 2)
    socket.join(study_group_id);
    console.log(`[Socket] Usuario ${userId} unido a la sala: ${study_group_id}`);

    // 3. Manejar la desconexión (Criterio de Aceptación 3)
    socket.on('disconnect', () => {
      console.log(`[Socket] Usuario ${userId} desconectado de la sala ${study_group_id}`);
    });

  } catch (error) {
    console.error('[Socket] Error en la conexión:', error);
    socket.disconnect();
  }
});

const PORT = process.env.PORT || 3004;
server.listen(PORT, () => {
  console.log(`💬 Chat Service listo en puerto ${PORT} (Socket.io & Cloudinary activo)`);
});