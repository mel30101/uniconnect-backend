const BaseHandler = require('./BaseHandler');

/**
 * Valida si el remitente tiene permisos para escribir en el grupo.
 */
class ValidarPermisosHandler extends BaseHandler {
  constructor(groupMemberRepo) {
    super();
    this.groupMemberRepo = groupMemberRepo;
  }

  async manejar(request) {
    const { groupId, senderId } = request;

    if (!groupId || !senderId) {
      return this.retornarError('Faltan identificadores de grupo o remitente.', 'MISSING_IDS');
    }

    try {
      const isMember = await this.groupMemberRepo.isMember(groupId, senderId);
      if (!isMember) {
        return this.retornarError(
          'No tienes permiso para enviar mensajes en este grupo.',
          'FORBIDDEN_MEMBER'
        );
      }
    } catch (error) {
      console.error('[ValidarPermisosHandler] Error verificando membresía:', error);
      return this.retornarError('Error al verificar permisos del usuario.', 'INTERNAL_ERROR');
    }

    return await super.manejar(request);
  }
}

module.exports = ValidarPermisosHandler;
