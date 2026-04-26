require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { db } = require('./src/config/firestore');

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
const GetEvents = require('./src/application/use-cases/event/getEvents');
const GetCategories = require('./src/application/use-cases/event/GetCategories');
const SubscribeToCategory = require('./src/application/use-cases/event/SubscribeToCategory');
const UnsubscribeFromCategory = require('./src/application/use-cases/event/UnsubscribeFromCategory');
const GetSubscribedCategories = require('./src/application/use-cases/event/GetSubscribedCategories');

const createGroupUC = new CreateGroup(groupRepo, groupMemberRepo);
const getUserGroupsUC = new GetUserGroups(groupMemberRepo, groupRepo, catalogRepo, userRepo);
const getGroupByIdUC = new GetGroupById(groupRepo, groupMemberRepo, catalogRepo, userRepo);
const searchGroupsUC = new SearchGroups(groupRepo, groupMemberRepo, catalogRepo, userRepo);
const checkGroupNameUniqueUC = new CheckGroupNameUnique(groupRepo);
const sendJoinRequestUC = new SendJoinRequest(groupRepo, groupMemberRepo, groupRequestRepo);
const getGroupRequestsUC = new GetGroupRequests(groupRequestRepo);
const handleRequestActionUC = new HandleRequestAction(groupMemberRepo, groupRequestRepo);
const removeMemberUC = new RemoveMember(groupMemberRepo);
const transferAdminUC = new TransferAdmin(groupRepo, groupMemberRepo, db);
const addMemberUC = new AddMember(groupMemberRepo);
const leaveGroupUC = new LeaveGroup(groupMemberRepo);
const getAvailableStudentsUC = new GetAvailableStudents(groupMemberRepo, userRepo);
const deleteUserRequestsUC = new DeleteUserRequests(groupRequestRepo);
const getEventsUC = new GetEvents(eventRepo, categoryRepo);
const getCategoriesUC = new GetCategories(categoryRepo);
const subscribeToCategoryUC = new SubscribeToCategory(subscriptionRepo);
const unsubscribeFromCategoryUC = new UnsubscribeFromCategory(subscriptionRepo);
const getSubscribedCategoriesUC = new GetSubscribedCategories(subscriptionRepo);

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
  deleteUserRequests: deleteUserRequestsUC
});

const eventCtrl = new EventController({
  getEvents: getEventsUC,
  getCategories: getCategoriesUC,
  subscribeToCategory: subscribeToCategoryUC,
  unsubscribeFromCategory: unsubscribeFromCategoryUC,
  getSubscribedCategories: getSubscribedCategoriesUC
});

const createGroupRoutes = require('./src/infrastructure/http/routes/groupRoutes');
const createEventRoutes = require('./src/infrastructure/http/routes/eventRoutes');

const app = express();
app.use(express.json());

app.use('/groups', createGroupRoutes(groupCtrl));
app.use('/events', createEventRoutes(eventCtrl));

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`👥 Social Service (Grupos y Eventos) listo en puerto ${PORT}`);
});