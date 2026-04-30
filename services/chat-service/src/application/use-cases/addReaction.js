class AddReaction {
    constructor(messageRepo, socketService) {
        this.messageRepo = messageRepo;
        this.socketService = socketService;
    }

    async execute(chatId, messageId, emoji, userId) {
        // 1. Obtener el mensaje actual
        const message = await this.messageRepo.getById(chatId, messageId);
        if (!message) throw new Error('MESSAGE_NOT_FOUND');

        // 2. Actualizar el mapa de reacciones
        // Estructura: { "👍": { count: 1, users: ["id1"] } }
        const reactions = message.reacciones || {};

        if (!reactions[emoji]) {
            reactions[emoji] = { count: 0, users: [] };
        }

        const userIndex = reactions[emoji].users.indexOf(userId);
        if (userIndex === -1) {
            // Añadir reacción
            reactions[emoji].count += 1;
            reactions[emoji].users.push(userId);
        } else {
            // Quitar reacción (toggle)
            reactions[emoji].count -= 1;
            reactions[emoji].users.splice(userIndex, 1);
            if (reactions[emoji].count <= 0) {
                delete reactions[emoji];
            }
        }

        // 3. Guardar en DB
        await this.messageRepo.update(chatId, messageId, { reacciones: reactions });

        // 4. Notificar vía Sockets
        if (this.socketService) {
            this.socketService.emitToChat(chatId, 'message_updated', {
                messageId,
                reacciones: reactions
            });
        }

        return reactions;
    }
}

module.exports = AddReaction;