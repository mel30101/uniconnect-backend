class SendJoinRequest {
  constructor(groupRepo, groupMemberRepo, groupRequestRepo) {
    this.groupRepo = groupRepo;
    this.groupMemberRepo = groupMemberRepo;
    this.groupRequestRepo = groupRequestRepo;
  }

  async execute(groupId, { userId, userName }) {
    if (!userId || !userName) {
      throw new Error('MISSING_FIELDS');
    }

    // Verificar que el grupo existe
    const group = await this.groupRepo.findById(groupId);
    if (!group) {
      throw new Error('GROUP_NOT_FOUND');
    }

    // Verificar que no sea miembro
    const member = await this.groupMemberRepo.findByGroupAndUser(groupId, userId);
    if (member) {
      throw new Error('ALREADY_MEMBER');
    }

    // Verificar que no tenga solicitud pendiente
    const existingRequest = await this.groupRequestRepo.findByGroupAndUser(groupId, userId);
    if (existingRequest) {
      // Si la solicitud está pendiente, avisamos al usuario
      if (existingRequest.status === 'pending') {
        throw new Error('REQUEST_ALREADY_EXISTS');
      }
      
      // SI ESTÁ RECHAZADA O ACEPTADA (pero ya no es miembro), LA LIMPIAMOS
      // Usamos el método de borrado que definimos anteriormente
      await this.groupRequestRepo.deleteByUserAndGroup(groupId, userId);
    }

    const newRequest = { groupId, userId, userName };
    return await this.groupRequestRepo.create(newRequest);

  }

  async checkExistingRequest(groupId, userId) {
    const solicitudExiste = await this.groupRequestRepo.findByGroupAndUser(groupId, userId);
    if (solicitudExiste) {
      return res.status(400).json({
        success: false,
        error: 'REQUEST_ALREADY_EXISTS', // Esto es un String
        message: 'Ya tienes una solicitud pendiente para este grupo.'
      });
    }
  }
}

module.exports = SendJoinRequest;
