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
const AddReaction = require('./src/application/use-cases/addReaction');
const AddGroupReaction = require('./src/application/use-cases/addGroupReaction');

// --- SOCKET HELPER ---
const socketService = {
  emitToChat: (chatId, event, data) => io.to(chatId).emit(event, data),
  emitToGroup: (groupId, event, data) => io.to(groupId).emit(event, data),
};

const getOrCreateChatUC = new GetOrCreateChat(chatRepo);
const sendMessageUC = new SendMessage(messageRepo, chatRepo);
const sendFileMessageUC = new SendFileMessage(cloudinaryService, sendMessageUC);
const getMessagesUC = new GetMessages(messageRepo);
const sendGroupMessageUC = new SendGroupMessage(groupMessageRepo, groupMemberRepo, cloudinaryService);
const addReactionUC = new AddReaction(messageRepo, socketService);
const addGroupReactionUC = new AddGroupReaction(groupMessageRepo, socketService);

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
  getMessages: getMessagesUC,
  addReaction: addReactionUC
});

const groupChatCtrl = new GroupChatController({
  sendGroupMessage: sendGroupMessageUC,
  addGroupReaction: addGroupReactionUC
});

// Setup Express
const app = express();
app.use(cors());
app.use(express.json());

// Ruta de salud para Fly.io
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'chat-service',
    timestamp: new Date().toISOString()
  });
});

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

// --- PRESENCE TRACKER ---
const activeUsers = new Map();

io.on('connection', async (socket) => {
  const { userId, study_group_id } = socket.handshake.query;

  console.log(`[Socket] Nuevo intento de conexión. Usuario: ${userId}, Grupo Inicial: ${study_group_id}`);

  if (!userId) {
    console.error('[Socket] Falta userId en la conexión');
    return socket.disconnect();
  }

  // Guardar userId en el socket
  socket.userId = userId;

  // 1. PRESENCIA Y SALA PERSONAL (US-W06 C5)
  activeUsers.set(userId, socket.id);
  socket.join(`user_${userId}`);
  io.emit('USER_STATUS_CHANGED', { userId, status: 'online' });
  console.log(`[Socket] Presencia: Usuario ${userId} online`);

  // Evento para consultar el estado de un usuario específico
  socket.on('check_user_status', ({ userId: targetUserId }, callback) => {
    const isOnline = activeUsers.has(targetUserId);
    if (callback) callback({ userId: targetUserId, status: isOnline ? 'online' : 'offline' });
  });

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

  // --- MENCIONES (Móvil C4) ---
  socket.on('get_mention_suggestions', async ({ groupId }, callback) => {
    try {
      const members = await groupMemberRepo.getGroupMembersWithNames(groupId);
      // members ya contiene id, username, photoUrl, etc.
      if (callback) callback({ success: true, data: members });
    } catch (error) {
      console.error("[Socket] Error obteniendo miembros para menciones:", error);
      if (callback) callback({ success: false, error: 'Error obteniendo miembros' });
    }
  });

  // --- CHAT PRIVADO (US-W06 C2) ---
  socket.on('join_private_chat', ({ chatId }) => {
    const roomName = `room_private_${chatId}`;
    socket.join(roomName);
    console.log(`[Socket] Usuario ${socket.userId} unido al chat privado: ${roomName}`);
  });

  socket.on('send_private_message', async (rawPayload, callback) => {
    let payload = rawPayload;
    if (typeof rawPayload === 'string') {
      try { payload = JSON.parse(rawPayload); } catch (e) {}
    }

    const { chatId, senderId, text, file } = payload || {};
    
    if (!chatId || !senderId || (!text && !file)) {
      if (callback) callback({ success: false, error: 'Campos requeridos faltantes para chat privado' });
      return;
    }

    try {
      const messageData = file ? { type: 'file', fileUrl: file.url, fileName: file.name, text } : { type: 'text', text };
      const result = await sendMessageUC.execute(chatId, senderId, messageData);
      
      const responseData = {
        message_id: result.id || `temp_${Date.now()}`,
        timestamp: new Date().toISOString(),
        sender: { id: senderId },
        content: result.text,
        renderedContent: result.renderedContent,
        metadata: result
      };

      // Emitir a la sala privada
      socketService.emitToChat(`room_private_${chatId}`, 'receive_private_message', responseData);

      if (callback) callback({ success: true, data: responseData });
    } catch (error) {
      console.error('[Socket Debug] ❌ ERROR en flujo send_private_message:', error);
      if (callback) callback({ success: false, error: error.message });
    }
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

      console.log(`[Socket Debug] 5. Flujo completado (Notificación delegada al Use Case)`);

    } catch (error) {
      console.error('[Socket Debug] ❌ ERROR en flujo send_message:', error);
      if (callback) callback({ success: false, error: error.message });
    }
  });

  socket.on('disconnect', () => {
    console.log(`[Socket] Usuario ${userId} desconectado`);
    // Limpiar presencia y emitir estado offline
    if (activeUsers.get(userId) === socket.id) {
      activeUsers.delete(userId);
      io.emit('USER_STATUS_CHANGED', { userId, status: 'offline' });
      console.log(`[Socket] Presencia: Usuario ${userId} offline`);
    }
  });
});

const PORT = process.env.PORT || 3004;
server.listen(PORT, () => {
  console.log(`💬 Chat Service listo en puerto ${PORT} (Observer Pattern & Socket.io activo)`);
});