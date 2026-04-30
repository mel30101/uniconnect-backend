const { asyncHandler } = require('../middlewares/errorMiddleware');

class GroupChatController {
  constructor({ sendGroupMessage, addGroupReaction }) {
    this.sendGroupMessage = sendGroupMessage;
    this.addGroupReactionUC = addGroupReaction;

    // Bind this para asegurar el contexto de ejecución
    this.sendMessage = this.sendMessage.bind(this);
    this.sendFileMessage = this.sendFileMessage.bind(this);
    this.addGroupReaction = this.addGroupReaction.bind(this);
  }

  async sendMessage(req, res) {
    try {
      const { groupId } = req.params;
      const { senderId, text } = req.body;

      if (!groupId || !senderId || !text) {
        return res.status(400).json({ error: 'Faltan parámetros requeridos (groupId, senderId, text)' });
      }

      const result = await this.sendGroupMessage.execute(groupId, senderId, { text, type: 'text' });
      res.status(201).json(result);
    } catch (error) {
      console.error('Error sending group message:', error);
      res.status(500).json({ error: 'Error al enviar mensaje grupal' });
    }
  }

  async sendFileMessage(req, res) {
    try {
      const { groupId } = req.params;
      const { senderId, text } = req.body;
      const file = req.file;

      if (!groupId || !senderId || !file) {
        return res.status(400).json({ error: 'Faltan parámetros (groupId, senderId, file)' });
      }

      const result = await this.sendGroupMessage.execute(groupId, senderId, { text }, file);
      res.status(201).json(result);
    } catch (error) {
      console.error('Error sending group file message:', error);
      res.status(500).json({ error: 'Error al enviar archivo en grupo' });
    }
  }

  async addGroupReaction(req, res) {
    try {
      const { groupId, messageId } = req.params;
      const { emoji, userId } = req.body;

      if (!groupId || !messageId || !emoji || !userId) {
        return res.status(400).json({ error: 'Faltan parámetros (groupId, messageId, emoji, userId)' });
      }

      const result = await this.addGroupReactionUC.execute(groupId, messageId, emoji, userId);
      res.status(200).json(result);
    } catch (error) {
      console.error('Error adding group reaction:', error);
      res.status(500).json({ error: 'Error al reaccionar al mensaje' });
    }
  }
}

module.exports = GroupChatController;