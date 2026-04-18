class DeleteUserRequests {
  constructor(groupRequestRepo) {
    this.groupRequestRepo = groupRequestRepo;
  }

  async execute(groupId, userId) {
    if (!groupId || !userId) {
      throw new Error('Faltan parámetros: groupId o userId');
    }
    
    const success = await this.groupRequestRepo.deleteByUserAndGroup(groupId, userId);
    return { success, message: 'Solicitudes antiguas eliminadas' };
  }
}

module.exports = DeleteUserRequests;