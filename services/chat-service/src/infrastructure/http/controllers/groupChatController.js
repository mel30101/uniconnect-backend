class GroupChatController {
  constructor({ sendGroupMessage }) {
    this.sendGroupMessage = sendGroupMessage;

    // Bind this para asegurar el contexto de ejecución
    this.sendMessage = this.sendMessage.bind(this);
    this.sendFileMessage = this.sendFileMessage.bind(this);
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
      // IMPORTANTE: En formdata, los campos llegan en req.body
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
}

module.exports = GroupChatController;
