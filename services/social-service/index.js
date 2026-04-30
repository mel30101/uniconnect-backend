require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const { db } = require('./src/config/firestore');

// Repositorios
const FirestoreGroupRepository = require('./src/infrastructure/database/FirestoreGroupRepository');
const FirestoreGroupMemberRepository = require('./src/infrastructure/database/FirestoreGroupMemberRepository');
const FirestoreGroupRequestRepository = require('./src/infrastructure/database/FirestoreGroupRequestRepository');
const FirestoreEventRepository = require('./src/infrastructure/database/FirestoreEventRepository');
const FirestoreCategoryRepository = require('./src/infrastructure/database/FirestoreCategoryRepository');
const FirestoreEventSubscriptionRepository = require('./src/infrastructure/database/FirestoreEventSubscriptionRepository');
const FirestoreUserRepository = require('./src/infrastructure/database/FirestoreUserRepository');
const FirestoreAcademicCatalogRepository = require('./src/infrastructure/database/FirestoreAcademicCatalogRepository');

const groupRepo = new FirestoreGroupRepository(db);
const groupMemberRepo = new FirestoreGroupMemberRepository(db);
const groupRequestRepo = new FirestoreGroupRequestRepository(db);
const eventRepo = new FirestoreEventRepository(db);
const categoryRepo = new FirestoreCategoryRepository(db);
const subscriptionRepo = new FirestoreEventSubscriptionRepository(db);
const userRepo = new FirestoreUserRepository(db);
const catalogRepo = new FirestoreAcademicCatalogRepository(db);

// --- INFRAESTRUCTURA OBSERVER ---
const studyGroupSubject = require('./src/application/observer/GrupoEstudioSubject');
const eventoUniversidadSubject = require('./src/application/observer/EventoUniversidadSubject');
const PersistenciaNotificacionObserver = require('./src/infrastructure/observers/PersistenciaNotificacionObserver');
const WebSocketNotificationObserver = require('./src/infrastructure/observers/WebSocketNotificationObserver');
const PushNotificationObserver = require('./src/infrastructure/observers/PushNotificationObserver');
const EventoUniversidadObserver = require('./src/infrastructure/observers/EventoUniversidadObserver');

// Setup Express y HTTP Server para Sockets
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // En producción restringir a los dominios permitidos
    methods: ["GET", "POST"]
  }
});

// Inicializar y Registrar Observers
const persistenceObserver = new PersistenciaNotificacionObserver(db);
const wsObserver = new WebSocketNotificationObserver(io);
const pushObserver = new PushNotificationObserver(process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3006');

studyGroupSubject.attach(persistenceObserver);
studyGroupSubject.attach(wsObserver);
studyGroupSubject.attach(pushObserver);

const eventoObserver = new EventoUniversidadObserver(io, db, subscriptionRepo, categoryRepo);
eventoUniversidadSubject.attach(eventoObserver);

console.log('✅ Sistema de Notificaciones (Observer) inicializado y registrado.');

// Configuración Socket.io para usuarios
io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId;
  if (userId) {
    socket.join(userId);
    console.log(`[Socket] Usuario ${userId} conectado y suscrito a su canal personal.`);
  }

  socket.on('disconnect', () => {
    console.log('[Socket] Cliente desconectado.');
  });
});

// Casos de Uso
const CreateGroup = require('./src/application/use-cases/group/createGroup');
const GetUserGroups = require('./src/application/use-cases/group/getUserGroups');
const GetGroupById = require('./src/application/use-cases/group/getGroupById');
const SearchGroups = require('./src/application/use-cases/group/searchGroups');
const CheckGroupNameUnique = require('./src/application/use-cases/group/checkGroupNameUnique');
const SendJoinRequest = require('./src/application/use-cases/group/sendJoinRequest');
const GetGroupRequests = require('./src/application/use-cases/group/getGroupRequests');
const HandleRequestAction = require('./src/application/use-cases/group/handleRequestAction');
const RemoveMember = require('./src/application/use-cases/group/removeMember');
const TransferAdmin = require('./src/application/use-cases/group/transferAdmin');
const AddMember = require('./src/application/use-cases/group/addMember');
const LeaveGroup = require('./src/application/use-cases/group/leaveGroup');
const GetAvailableStudents = require('./src/application/use-cases/group/getAvailableStudents');
const DeleteUserRequests = require('./src/application/use-cases/group/deleteUserRequests');
const RequestAdminTransfer = require('./src/application/use-cases/group/requestAdminTransfer');
const HandleAdminTransferResponse = require('./src/application/use-cases/group/handleAdminTransferResponse');
const GetEvents = require('./src/application/use-cases/event/GetEvents');
const CreateEvent = require('./src/application/use-cases/event/CreateEvent');
const GetCategories = require('./src/application/use-cases/event/GetCategories');
const SubscribeToCategory = require('./src/application/use-cases/event/SubscribeToCategory');
const UnsubscribeFromCategory = require('./src/application/use-cases/event/UnsubscribeFromCategory');
const GetSubscribedCategories = require('./src/application/use-cases/event/GetSubscribedCategories');

const createGroupUC = new CreateGroup(groupRepo, groupMemberRepo);
const getUserGroupsUC = new GetUserGroups(groupMemberRepo, groupRepo, catalogRepo, userRepo);
const getGroupByIdUC = new GetGroupById(groupRepo, groupMemberRepo, groupRequestRepo, catalogRepo, userRepo);
const searchGroupsUC = new SearchGroups(groupRepo, groupMemberRepo, groupRequestRepo, catalogRepo, userRepo);
const checkGroupNameUniqueUC = new CheckGroupNameUnique(groupRepo);
const sendJoinRequestUC = new SendJoinRequest(groupRepo, groupMemberRepo, groupRequestRepo, studyGroupSubject);
const getGroupRequestsUC = new GetGroupRequests(groupRequestRepo);
const handleRequestActionUC = new HandleRequestAction(groupMemberRepo, groupRequestRepo, groupRepo, studyGroupSubject);
const removeMemberUC = new RemoveMember(groupMemberRepo);
const transferAdminUC = new TransferAdmin(groupRepo, groupMemberRepo, db, studyGroupSubject);
const addMemberUC = new AddMember(groupMemberRepo);
const leaveGroupUC = new LeaveGroup(groupMemberRepo, groupRepo);
const getAvailableStudentsUC = new GetAvailableStudents(groupMemberRepo, userRepo);
const deleteUserRequestsUC = new DeleteUserRequests(groupRequestRepo);
const requestAdminTransferUC = new RequestAdminTransfer(groupRepo, groupMemberRepo, userRepo, db, studyGroupSubject);
const handleAdminTransferResponseUC = new HandleAdminTransferResponse(groupRepo, groupMemberRepo, userRepo, db, studyGroupSubject);
const getEventsUC = new GetEvents(eventRepo, categoryRepo);
const createEventUC = new CreateEvent(eventRepo, eventoUniversidadSubject);
const getCategoriesUC = new GetCategories(categoryRepo);
const subscribeToCategoryUC = new SubscribeToCategory(subscriptionRepo);
const unsubscribeFromCategoryUC = new UnsubscribeFromCategory(subscriptionRepo);
const getSubscribedCategoriesUC = new GetSubscribedCategories(subscriptionRepo);

// Controladores
const GroupController = require('./src/infrastructure/http/controllers/groupController');
const EventController = require('./src/infrastructure/http/controllers/eventController');

const groupCtrl = new GroupController({
  createGroup: createGroupUC,
  getUserGroups: getUserGroupsUC,
  getGroupById: getGroupByIdUC,
  searchGroups: searchGroupsUC,
  checkGroupNameUnique: checkGroupNameUniqueUC,
  sendJoinRequest: sendJoinRequestUC,
  getGroupRequests: getGroupRequestsUC,
  handleRequestAction: handleRequestActionUC,
  removeMember: removeMemberUC,
  transferAdmin: transferAdminUC,
  addMember: addMemberUC,
  leaveGroup: leaveGroupUC,
  getAvailableStudents: getAvailableStudentsUC,
  deleteUserRequests: deleteUserRequestsUC,
  requestAdminTransfer: requestAdminTransferUC,
  handleAdminTransferResponse: handleAdminTransferResponseUC
});

const eventCtrl = new EventController({
  getEvents: getEventsUC,
  createEvent: createEventUC,
  getCategories: getCategoriesUC,
  subscribeToCategory: subscribeToCategoryUC,
  unsubscribeFromCategory: unsubscribeFromCategoryUC,
  getSubscribedCategories: getSubscribedCategoriesUC
});

const createGroupRoutes = require('./src/infrastructure/http/routes/groupRoutes');
const createEventRoutes = require('./src/infrastructure/http/routes/eventRoutes');

app.use(express.json());

app.use('/groups', createGroupRoutes(groupCtrl));
app.use('/events', createEventRoutes(eventCtrl));

const { globalErrorHandler } = require('./src/infrastructure/http/middlewares/errorMiddleware');
app.use(globalErrorHandler);

const PORT = process.env.PORT || 3003;
server.listen(PORT, () => {
  console.log(`👥 Social Service (Grupos y Eventos) listo en puerto ${PORT}`);
});