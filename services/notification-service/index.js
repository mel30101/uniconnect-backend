const admin = require('firebase-admin');
const dotenv = require('dotenv');
const http = require('http');
const express = require('express');

dotenv.config();

// Infrastructure
const FirestoreNotificationRepository = require('./src/infrastructure/repositories/FirestoreNotificationRepository');

// Application
const SendNotification = require('./src/application/use-cases/SendNotification');
const NotificationObserver = require('./src/application/observers/NotificationObserver');

// Initialize Firebase Admin
if (!admin.apps.length) {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY_BASE64
    ? Buffer.from(process.env.FIREBASE_PRIVATE_KEY_BASE64, 'base64').toString('utf8')
    : (process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined);

  const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  };

  if (serviceAccount.projectId && serviceAccount.privateKey && serviceAccount.clientEmail) {
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  } else {
    admin.initializeApp({ credential: admin.credential.applicationDefault() });
  }
}

const db = admin.firestore();

// Dependency Injection (solo persistencia, sin FCM)
const notificationRepo = new FirestoreNotificationRepository(db);
const sendNotificationUseCase = new SendNotification(notificationRepo);
const notificationObserver = new NotificationObserver(sendNotificationUseCase);

// HTTP Server
const app = express();
const server = http.createServer(app);
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    service: 'notification-service' 
  });
});

const PORT = process.env.NOTIFICATION_PORT || 3006;

// ─── POST /notify ─────────────────────────────────────────────
// Recibe eventos de otros microservicios y persiste la notificación
app.post('/notify', async (req, res) => {
  const { event, payload } = req.body;
  try {
    let result;
    switch (event) {
      case 'SOLICITUD_INGRESO':
        result = await notificationObserver.onGroupRequest(
          payload.targetUserId, payload.userName, payload.groupName, payload.groupId
        );
        break;
      case 'SOLICITUD_ACEPTADA':
        result = await notificationObserver.onGroupRequestHandled(
          payload.userId, true, payload.groupName, payload.groupId
        );
        break;
      case 'SOLICITUD_RECHAZADA':
        result = await notificationObserver.onGroupRequestHandled(
          payload.userId, false, payload.groupName, payload.groupId
        );
        break;
      case 'TRANSFER_ADMIN':
        result = await notificationObserver.onAdminTransfer(
          payload.userId, payload.groupName, payload.groupId
        );
        break;
      case 'TRANSFER_ADMIN_SOLICITADA':
        result = await notificationObserver.onAdminTransferRequested(
          payload.userId, payload.userName, payload.groupName, payload.groupId
        );
        break;
      case 'TRANSFER_ADMIN_ACEPTADA':
        result = await notificationObserver.onAdminTransferAccepted(
          payload.userId, payload.userName, payload.groupName, payload.groupId
        );
        break;
      case 'MENCION':
        result = await notificationObserver.onMention(
          payload.userId, payload.senderName, payload.groupName, payload.message, payload.groupId
        );
        break;
      case 'NUEVO_EVENTO':
        result = await notificationObserver.onNewEvent(
          payload.userId, payload.categoryName, payload.eventTitle, payload.eventId
        );
        break;
      default:
        return res.status(400).json({ error: `Unknown event type: ${event}` });
    }
    res.json({ success: true, result });
  } catch (error) {
    console.error('[NotificationService] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ─── GET /notifications/:userId ───────────────────────────────
// Devuelve el historial de notificaciones del usuario (para mobile y web)
app.get('/notifications/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit) || 20;
    const notifications = await notificationRepo.findByUserId(userId, limit);
    res.json({ success: true, data: notifications });
  } catch (error) {
    console.error('[NotificationService] Error getting notifications:', error);
    res.status(500).json({ error: error.message });
  }
});

// ─── PATCH /notifications/:id/read ────────────────────────────
// Marca una notificación como leída
app.patch('/notifications/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    await notificationRepo.markAsRead(id);
    res.json({ success: true });
  } catch (error) {
    console.error('[NotificationService] Error marking as read:', error);
    res.status(500).json({ error: error.message });
  }
});

// ─── PATCH /notifications/user/:userId/read-all ───────────────
// Marca todas las notificaciones de un usuario como leídas
app.patch('/notifications/user/:userId/read-all', async (req, res) => {
  try {
    const { userId } = req.params;
    await notificationRepo.markAllAsRead(userId);
    res.json({ success: true });
  } catch (error) {
    console.error('[NotificationService] Error marking all as read:', error);
    res.status(500).json({ error: error.message });
  }
});

server.listen(PORT, () => {
  console.log(`🔔 Notification Service (Dashboard) running on port ${PORT}`);
});

module.exports = { notificationObserver };
