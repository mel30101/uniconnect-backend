class AddGroupReaction {
    constructor(groupMessageRepo, socketService) {
        this.groupMessageRepo = groupMessageRepo;
        this.socketService = socketService;
    }

    async execute(groupId, messageId, emoji, userId) {
        // 1. Obtener mensaje del grupo
        const message = await this.groupMessageRepo.getById(groupId, messageId);
        if (!message) throw new Error('GROUP_MESSAGE_NOT_FOUND');

        // 2. Lógica de Toggle
        const reactions = message.reacciones || {};

        if (!reactions[emoji]) {
            reactions[emoji] = { count: 0, users: [] };
        }

        const userIndex = reactions[emoji].users.indexOf(userId);
        if (userIndex === -1) {
            reactions[emoji].count += 1;
            reactions[emoji].users.push(userId);
        } else {
            reactions[emoji].count -= 1;
            reactions[emoji].users.splice(userIndex, 1);
            if (reactions[emoji].count <= 0) {
                delete reactions[emoji];
            }
        }

        // 3. Guardar
        await this.groupMessageRepo.update(groupId, messageId, { reacciones: reactions });

        // 4. Notificar a la sala del grupo
        if (this.socketService) {
            this.socketService.emitToGroup(groupId, 'message_updated', {
                messageId,
                reacciones: reactions
            });
        }

        return reactions;
    }
}

module.exports = AddGroupReaction;