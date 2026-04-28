require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { db } = require('./src/config/firestore');

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

// --- 5. RUTAS Y MIDDLEWARES ---
const createChatRoutes = require('./src/infrastructure/http/routes/chatRoutes');
const createGroupChatRoutes = require('./src/infrastructure/http/routes/groupChatRoutes');

const app = express();
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'chat-service',
    timestamp: new Date().toISOString()
  });
});

app.use('/', createChatRoutes(chatCtrl));
app.use('/groups', createGroupChatRoutes(groupChatCtrl));

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => {
  console.log(`💬 Chat Service listo en puerto ${PORT} (Cloudinary activo)`);
});