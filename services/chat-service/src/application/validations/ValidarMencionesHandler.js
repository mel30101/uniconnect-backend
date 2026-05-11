const BaseHandler = require('./BaseHandler');

/**
 * Detecta menciones en el texto y valida que los usuarios mencionados pertenezcan al grupo.
 */
class ValidarMencionesHandler extends BaseHandler {
  constructor(groupMemberRepo) {
    super();
    this.groupMemberRepo = groupMemberRepo;
  }

  async manejar(request) {
    const { text, groupId } = request;

    if (!text) {
      request.mentions = [];
      return await super.manejar(request);
    }

    const mentionRegex = /@(\w+)/g;
    const mentionRegex = /@([A-ZÁÉÍÓÚÑa-záéíóúñ]+(?:\s[A-ZÁÉÍÓÚÑa-záéíóúñ]+)*)/g;
    const matches = [...text.matchAll(mentionRegex)];

    if (matches.length === 0) {
      request.mentions = [];
      return await super.manejar(request);
    }

    try {
      const allMembers = await this.groupMemberRepo.getGroupMembersWithNames(groupId);
      const mentionedUserIds = [];
      let renderedText = text;

      for (const match of matches) {
        const potentialName = match[1].toLowerCase().trim();
        const foundMember = allMembers.find(member => 
          member.name && member.name.toLowerCase().includes(potentialName)
        );

        if (foundMember) {
          if (!mentionedUserIds.includes(foundMember.id)) {
            mentionedUserIds.push(foundMember.id);
          }
          // US-CH01: Estandarización del Marcado de Menciones
          renderedText = renderedText.replace(match[0], `<span class="mention">@${foundMember.name}</span>`);
        if (foundMember && !mentionedUserIds.includes(foundMember.id)) {
          mentionedUserIds.push(foundMember.id);
        }
      }

      // Inyectamos las menciones detectadas en el request para que el Use Case las aproveche
      request.mentions = mentionedUserIds;
      request.renderedText = renderedText;

    } catch (error) {
      console.error('[ValidarMencionesHandler] Error detectando menciones:', error);
      // No cortamos la cadena por error en menciones, pero registramos el fallo
      request.mentions = [];
      request.renderedText = text;
    }

    return await super.manejar(request);
  }
}

module.exports = ValidarMencionesHandler;
