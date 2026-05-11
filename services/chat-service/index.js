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

// --- HELPERS ---
const formatMessageDTO = (msg) => {
  // Manejamos casos donde msg puede venir del Use Case o directamente de la DB
  const id = msg.id || msg.messageId || `temp_${Date.now()}`;
  const createdAt = msg.createdAt;
  
  // Si createdAt es un Timestamp de Firebase, lo convertimos a ISO
  const timestamp = (createdAt && typeof createdAt.toDate === 'function') 
    ? createdAt.toDate().toISOString() 
    : (createdAt instanceof Date ? createdAt.toISOString() : new Date().toISOString());

  return {
    message_id: id,
    timestamp,
    sender: { id: msg.senderId },
    content: msg.text || msg.content,
    renderedContent: msg.renderedContent,
    metadata: msg.metadata || msg
  };
};

const formatErrorDTO = (error) => ({
  error: true,
  codigo: error.codigo || 'INTERNAL_ERROR',
  mensaje: error.message || 'Ha ocurrido un error inesperado',
  detalles: error.detalles || (error.codigo === 'MESSAGE_TOO_LONG' ? 'Máximo 2000 caracteres' : null),
  timestamp: new Date().toISOString()
});

io.on('connection', async (socket) => {
  const { userId, study_group_id } = socket.handshake.query;

  console.log(`[Socket] Nuevo intento de conexión. Usuario: ${userId}, Grupo Inicial: ${study_group_id}`);

  if (!userId) {
    console.error('[Socket] Falta userId en la conexión');
    return socket.disconnect();
  }

  // Guardar userId en el socket
  socket.userId = userId;

  // 1. PRESENCIA SEGMENTADA POR GRUPOS (US-W06 C5)
  activeUsers.set(userId, socket.id);
  socket.join(`user_${userId}`);
  
  // Notificar solo a los grupos del usuario
  try {
    const groupIds = await groupMemberRepo.getGroupsByUserId(userId);
    groupIds.forEach(gid => {
      io.to(gid).emit('USER_STATUS_CHANGED', { userId, status: 'online' });
    });
    console.log(`[Socket] Presencia segmentada: Notificado online a ${groupIds.length} grupos.`);
  } catch (err) {
    console.error("[Socket] Error notificando presencia segmentada:", err);
    // Fallback global solo si falla lo anterior (opcional)
    io.emit('USER_STATUS_CHANGED', { userId, status: 'online' });
  }

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

  // --- MENCIONES DINÁMICAS (C4) ---
  socket.on('get_mention_suggestions', async ({ groupId, query }, callback) => {
    try {
      let members = await groupMemberRepo.getGroupMembersWithNames(groupId);
      
      // Filtrar por query si existe
      if (query) {
        const q = query.toLowerCase();
        members = members.filter(m => 
          (m.name && m.name.toLowerCase().includes(q)) || 
          (m.id && m.id.toLowerCase().includes(q))
        );
      } else {
        // Si no hay query, limitamos a los primeros 15 por optimización
        members = members.slice(0, 15);
      }

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

  // Endpoint de "Snapshot" de Cabecera de Chat (Tarea 4)
  socket.on('get_chat_header_info', async ({ chatId, userId }, callback) => {
    try {
      const chat = await chatRepo.findById(chatId);
      if (!chat || !chat.participants) {
        return callback({ success: false, error: 'Chat no encontrado' });
      }

      // Encontrar al otro participante
      const otherId = chat.participants.find(p => p !== userId);
      if (!otherId) {
        return callback({ success: false, error: 'Participante no encontrado' });
      }

      // Consultar info del usuario (Aquí asumimos que tenemos acceso a db para info básica)
      const userDoc = await db.collection('users').doc(otherId).get();
      const userData = userDoc.exists ? userDoc.data() : { name: 'Compañero' };

      if (callback) callback({
        success: true,
        data: {
          name: userData.name || userData.displayName || 'Compañero',
          photoUrl: userData.photoUrl || userData.avatar || null,
          status: activeUsers.has(otherId) ? 'online' : 'offline'
        }
      });
    } catch (err) {
      console.error("[Socket] Error en get_chat_header_info:", err);
      if (callback) callback({ success: false, error: 'Error interno' });
    }
  });

  socket.on('send_private_message', async (rawPayload, callback) => {
    let payload = rawPayload;
    if (typeof rawPayload === 'string') {
      try { payload = JSON.parse(rawPayload); } catch (e) {}
    }

    const { chatId, senderId, receiverId, text, file } = payload || {};
    
    if (!chatId || !senderId || (!text && !file)) {
      if (callback) callback({ success: false, error: 'Campos requeridos faltantes para chat privado' });
      return;
    }

    try {
      const messageData = file ? { type: 'file', fileUrl: file.url, fileName: file.name, text } : { type: 'text', text };
      const result = await sendMessageUC.execute(chatId, senderId, messageData);
      
      const responseData = formatMessageDTO(result);

      // 1. Emitir a la sala privada (si están dentro)
      socketService.emitToChat(`room_private_${chatId}`, 'receive_private_message', responseData);
      
      // 2. ECO A SALA PERSONAL (Multi-dispositivo)
      socketService.emitToChat(`user_${senderId}`, 'receive_private_message', responseData);

      // 3. ENTREGA AL DESTINATARIO (Directo a su habitación personal)
      if (receiverId) {
        socketService.emitToChat(`user_${receiverId}`, 'receive_private_message', responseData);
      }

      if (callback) callback({ success: true, data: responseData });
    } catch (error) {
      console.error('[Socket Debug] ❌ ERROR en flujo send_private_message:', error);
      
      const errorDTO = formatErrorDTO(error);
      socket.emit('error_message', errorDTO);

      if (callback) callback({ success: false, ...errorDTO });
    }
  });

  socket.on('get_private_history', async ({ chatId, limit = 20, lastMessageId }, callback) => {
    if (!chatId) {
      if (callback) callback({ success: false, error: 'chatId es requerido' });
      return;
    }
    try {
      const messages = await messageRepo.findWithPagination(chatId, limit, lastMessageId);
      const formattedMessages = messages.map(formatMessageDTO);
      const newLastId = formattedMessages.length > 0 ? formattedMessages[0].message_id : null;
      
      // Lógica hasMore: Si el número de mensajes es igual al límite, hay más
      const hasMore = messages.length === limit;

      if (callback) callback({ 
        messages: formattedMessages, 
        lastMessageId: newLastId,
        hasMore 
      });
    } catch (error) {
      console.error("[Socket Debug] ❌ Error obteniendo historial privado:", error);
      if (callback) callback({ success: false, error: 'Error al obtener historial' });
    }
  });

  socket.on('get_messages_since', async ({ chatId, timestamp }, callback) => {
    if (!chatId || !timestamp) {
      if (callback) callback([]);
      return;
    }
    try {
      const messages = await messageRepo.getMessagesSince(chatId, timestamp);
      const formattedMessages = messages.map(formatMessageDTO);
      if (callback) callback(formattedMessages);
    } catch (error) {
      console.error("[Socket Debug] ❌ Error obteniendo mensajes desde timestamp:", error);
      if (callback) callback([]);
    }
  });

  // --- HISTORIAL GRUPAL ---
  socket.on('get_group_history', async ({ groupId, limit = 20, lastMessageId }, callback) => {
    if (!groupId) {
      if (callback) callback({ success: false, error: 'groupId es requerido' });
      return;
    }
    try {
      const messages = await groupMessageRepo.findWithPagination(groupId, limit, lastMessageId);
      const formattedMessages = messages.map(formatMessageDTO);
      const newLastId = formattedMessages.length > 0 ? formattedMessages[0].message_id : null;
      const hasMore = messages.length === limit;

      if (callback) callback({ 
        messages: formattedMessages, 
        lastMessageId: newLastId,
        hasMore 
      });
    } catch (error) {
      console.error("[Socket Debug] ❌ Error historial grupal:", error);
      if (callback) callback({ success: false, error: 'Error al obtener historial' });
    }
  });

  socket.on('get_group_messages_since', async ({ groupId, timestamp }, callback) => {
    if (!groupId || !timestamp) {
      if (callback) callback([]);
      return;
    }
    try {
      const messages = await groupMessageRepo.getMessagesSince(groupId, timestamp);
      const formattedMessages = messages.map(formatMessageDTO);
      if (callback) callback(formattedMessages);
    } catch (error) {
      console.error("[Socket Debug] ❌ Error delta sync grupal:", error);
      if (callback) callback([]);
    }
  });

  // --- ESCUCHAR MENSAJES (GRUPAL) ---
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

      const responseData = formatMessageDTO(result);

      // Notificación delegada al Use Case para la sala del grupo
      // pero hacemos eco a la sala personal para sincronización multi-dispositivo
      socketService.emitToChat(`user_${sender_id}`, 'receive_message', responseData);

      if (callback) {
        console.log(`[Socket Debug] 4. Enviando callback de éxito al cliente`);
        callback({ success: true, data: responseData });
      }

      console.log(`[Socket Debug] 5. Flujo completado (Notificación delegada al Use Case)`);

    } catch (error) {
      console.error('[Socket Debug] ❌ ERROR en flujo send_message:', error);
      const errorDTO = formatErrorDTO(error);
      socket.emit('error_message', errorDTO);
      if (callback) callback({ success: false, ...errorDTO });
    }
  });

  socket.on('disconnect', async () => {
    console.log(`[Socket] Usuario ${userId} desconectado`);
    // Limpiar presencia y emitir estado offline segmentado
    if (activeUsers.get(userId) === socket.id) {
      activeUsers.delete(userId);
      
      try {
        const groupIds = await groupMemberRepo.getGroupsByUserId(userId);
        groupIds.forEach(gid => {
          io.to(gid).emit('USER_STATUS_CHANGED', { userId, status: 'offline' });
        });
        console.log(`[Socket] Presencia segmentada: Notificado offline a ${groupIds.length} grupos.`);
      } catch (err) {
        console.error("[Socket] Error notificando offline segmentado:", err);
        io.emit('USER_STATUS_CHANGED', { userId, status: 'offline' });
      }
    }
  });
});

const PORT = process.env.PORT || 3004;
server.listen(PORT, () => {
  console.log(`💬 Chat Service listo en puerto ${PORT} (Observer Pattern & Socket.io activo)`);
});