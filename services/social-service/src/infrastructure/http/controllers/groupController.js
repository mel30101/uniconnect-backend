const { asyncHandler } = require('../middlewares/errorMiddleware');

class GroupController {
  constructor(useCases) {
    this.createGroupUC = useCases.createGroup;
    this.getUserGroupsUC = useCases.getUserGroups;
    this.getGroupByIdUC = useCases.getGroupById;
    this.searchGroupsUC = useCases.searchGroups;
    this.checkGroupNameUniqueUC = useCases.checkGroupNameUnique;
    this.sendJoinRequestUC = useCases.sendJoinRequest;
    this.getGroupRequestsUC = useCases.getGroupRequests;
    this.handleRequestActionUC = useCases.handleRequestAction;
    this.removeMemberUC = useCases.removeMember;
    this.transferAdminUC = useCases.transferAdmin;
    this.addMemberUC = useCases.addMember;
    this.leaveGroupUC = useCases.leaveGroup;
    this.getAvailableStudentsUC = useCases.getAvailableStudents;
    this.deleteUserRequestsUC = useCases.deleteUserRequests;
    this.requestAdminTransferUC = useCases.requestAdminTransfer;
    this.handleAdminTransferResponseUC = useCases.handleAdminTransferResponse;
  }

  createGroup = asyncHandler(async (req, res, next) => {
    const result = await this.createGroupUC.execute(req.body);
    res.status(201).json(result);
  });

  getUserGroups = asyncHandler(async (req, res, next) => {
    const { userId } = req.params;
    const { role } = req.query;
    const groups = await this.getUserGroupsUC.execute(userId, role);
    res.json(groups);
  });

  getGroupById = asyncHandler(async (req, res, next) => {
    const { userId } = req.query;
    const group = await this.getGroupByIdUC.execute(req.params.id, userId);
    if (!group) {
        throw new Error('GROUP_NOT_FOUND');
    }
    res.json(group);
  });

  searchGroups = asyncHandler(async (req, res, next) => {
    const { subjectId, search, userSubjectIds, userId } = req.query;
    const groups = await this.searchGroupsUC.execute({ subjectId, search, userSubjectIds, userId });
    res.json(groups);
  });

  checkGroupNameUnique = asyncHandler(async (req, res, next) => {
    const isUnique = await this.checkGroupNameUniqueUC.execute(req.params.name);
    res.json({ isUnique });
  });

  sendJoinRequest = asyncHandler(async (req, res, next) => {
    const result = await this.sendJoinRequestUC.execute(req.params.id, req.body);
    res.status(200).json(result);
  });

  getGroupRequests = asyncHandler(async (req, res, next) => {
    const requests = await this.getGroupRequestsUC.execute(req.params.id);
    res.status(200).json(requests);
  });

  handleRequestAction = asyncHandler(async (req, res, next) => {
    const result = await this.handleRequestActionUC.execute(req.params.id, req.params.requestId, req.body.status);
    res.status(200).json(result);
  });

  removeMember = asyncHandler(async (req, res, next) => {
    const result = await this.removeMemberUC.execute(req.params.id, req.params.userId, req.query.adminId);
    res.json(result);
  });

  transferAdmin = asyncHandler(async (req, res, next) => {
    const { adminId, newAdminId } = req.body;
    await this.transferAdminUC.execute(req.params.id, adminId, newAdminId);
    res.status(200).json({ message: "Administración cedida con éxito." });
  });

  requestAdminTransfer = asyncHandler(async (req, res, next) => {
    const { adminId, candidateId } = req.body;
    const result = await this.requestAdminTransferUC.execute(req.params.id, adminId, candidateId);
    res.status(200).json(result);
  });

  handleAdminTransferResponse = asyncHandler(async (req, res, next) => {
    const { candidateId, action } = req.body;
    const result = await this.handleAdminTransferResponseUC.execute(req.params.id, candidateId, action);
    res.status(200).json(result);
  });

  addMember = asyncHandler(async (req, res, next) => {
    const result = await this.addMemberUC.execute(req.params.id, req.body);
    res.status(201).json(result);
  });

  leaveGroup = asyncHandler(async (req, res, next) => {
    const result = await this.leaveGroupUC.execute(req.params.id, req.params.userId);
    res.json(result);
  });

  deleteUserRequests = asyncHandler(async (req, res, next) => {
    const { id, userId } = req.params; // id es el groupId según tus rutas
    const result = await this.deleteUserRequestsUC.execute(id, userId);
    res.status(200).json(result);
  });

  getAvailableStudents = asyncHandler(async (req, res, next) => {
    const { groupId } = req.params;
    const students = await this.getAvailableStudentsUC.execute(groupId);
    res.status(200).json(students);
  }); 
  static getInstance(useCases) {
    if (!GroupController.instance) {
      GroupController.instance = new GroupController(useCases);
    } 
    return GroupController.instance;
  }
}

module.exports = GroupController;