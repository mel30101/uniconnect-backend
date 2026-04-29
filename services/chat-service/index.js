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

// Observer Pattern
const chatSubject = require('./src/application/observer/ChatSubject');
const { ChatEvents } = require('./src/domain/observer/ISubject');
const GroupChatObserver = require('./src/infrastructure/observers/GroupChatObserver');

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

// --- SOCKET.IO SETUP ---
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Registrar Observadores (Tarea 3)
const groupChatObserver = new GroupChatObserver(io);
chatSubject.attach(groupChatObserver);

io.on('connection', async (socket) => {
  const { userId, study_group_id } = socket.handshake.query;

  console.log(`[Socket] Nuevo intento de conexión. Usuario: ${userId}, Grupo Inicial: ${study_group_id}`);

  if (!userId) {
    console.error('[Socket] Falta userId en la conexión');
    return socket.disconnect();
  }

  // Guardar userId en el socket
  socket.userId = userId;

  // Si viene con un grupo en el handshake, lo unimos
  if (study_group_id) {
    try {
      const isMember = await groupMemberRepo.isMember(study_group_id, userId);
      if (isMember) {
        socket.join(study_group_id);
        console.log(`[Socket] Usuario ${userId} unido a la sala (handshake): ${study_group_id}`);
      }
    } catch (err) {
      console.error("[Socket] Error uniendo a sala inicial:", err);
    }
  }

  // Listener para unirse a grupos dinámicamente (Requerido para el frontend)
  socket.on('join_group', async ({ groupId, userId: eventUserId }) => {
    const uid = eventUserId || socket.userId;
    console.log(`[Socket] Solicitud join_group: Usuario ${uid} -> Grupo ${groupId}`);

    try {
      const isMember = await groupMemberRepo.isMember(groupId, uid);
      if (isMember) {
        socket.join(groupId);
        console.log(`[Socket] Usuario ${uid} unido con éxito a la sala: ${groupId}`);
      } else {
        console.warn(`[Socket] Acceso denegado: ${uid} no es miembro de ${groupId}`);
      }
    } catch (error) {
      console.error("[Socket] Error en join_group:", error);
    }
  });

  socket.on('leave_group', ({ groupId }) => {
    socket.leave(groupId);
    console.log(`[Socket] Usuario ${socket.userId} salió de la sala: ${groupId}`);
  });

  // --- ESCUCHAR MENSAJES ---
  socket.on('send_message', async (rawPayload, callback) => {
    let payload = rawPayload;

    // Si el payload llega como string, lo parseamos
    if (typeof rawPayload === 'string') {
      try {
        payload = JSON.parse(rawPayload);
      } catch (e) {
        console.error("[Socket Debug] Error parseando payload string:", e);
      }
    }

    const { sender_id, group_id, content } = payload || {};
    console.log(`[Socket Debug] 1. Payload procesado: sender=${sender_id}, group=${group_id}`);

    if (!sender_id || !group_id || !content) {
      console.log(`[Socket Debug] Error: Campos faltantes en payload`);
      if (callback) callback({ success: false, error: 'Campos requeridos faltantes' });
      return;
    }

    try {
      console.log(`[Socket Debug] 2. Llamando a sendGroupMessageUC.execute...`);

      const result = await sendGroupMessageUC.execute(group_id, sender_id, { text: content });

      console.log(`[Socket Debug] 3. Persistencia exitosa, ID: ${result.messageId}`);

      const responseData = {
        message_id: result.messageId,
        timestamp: new Date().toISOString(),
        sender: { id: result.senderId },
        content: result.content,
        renderedContent: result.renderedContent,
        metadata: result
      };

      if (callback) {
        console.log(`[Socket Debug] 4. Enviando callback de éxito al cliente`);
        callback({ success: true, data: responseData });
      }

      console.log(`[Socket Debug] 5. Notificando a observadores (Observer Pattern)`);
      chatSubject.notify(ChatEvents.NUEVO_MENSAJE, {
        groupId: group_id,
        message: responseData
      });

    } catch (error) {
      console.error('[Socket Debug] ❌ ERROR en flujo send_message:', error);
      if (callback) callback({ success: false, error: error.message });
    }
  });

  socket.on('disconnect', () => {
    console.log(`[Socket] Usuario ${userId} desconectado`);
  });
});

const PORT = process.env.PORT || 3004;
server.listen(PORT, () => {
  console.log(`💬 Chat Service listo en puerto ${PORT} (Observer Pattern & Socket.io activo)`);
});