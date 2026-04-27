// src/domain/decorators/MentionDecorator.js
class MentionDecorator {
  constructor(groupMemberRepo) {
    this.groupMemberRepo = groupMemberRepo;
  }

  async decorate(message, groupId) {
    if (!message.text) return message;

    // Buscar menciones en el texto: @nombre (incluyendo apellidos y espacios si están juntos, pero para
    // simplificar asumimos que el usuario escribió @Nombre, o usamos expresión regular simple)
    const mentionRegex = /@([A-ZÁÉÍÓÚÑa-záéíóúñ]+(?:\s[A-ZÁÉÍÓÚÑa-záéíóúñ]+)*)/g;
    const matches = [...message.text.matchAll(mentionRegex)];
    
    if (matches.length > 0) {
      // Si hay menciones, bajamos a Firestore para ver los miembros del grupo
      const allMembers = await this.groupMemberRepo.getGroupMembersWithNames(groupId);
      
      const mentionedUserIds = [];

      for (const match of matches) {
        const potentialName = match[1].toLowerCase().trim();

        // Buscar qué miembro(s) del grupo coincide su nombre con el username/nombre mencionado
        const foundMember = allMembers.find(member => 
          member.name && member.name.toLowerCase().includes(potentialName)
        );

        if (foundMember && !mentionedUserIds.includes(foundMember.id)) {
          mentionedUserIds.push(foundMember.id);
        }
      }

      if (mentionedUserIds.length > 0) {
        message.hasMention = true;
        message.mentionedUserIds = mentionedUserIds;
      }
    }

    return message;
  }
}

module.exports = MentionDecorator;
