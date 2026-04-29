const express = require('express');
const { upload } = require('../middlewares/uploadMiddleware');

function createGroupChatRoutes(controller) {
  const router = express.Router();

  // Enviar mensaje de texto al grupo
  router.post('/:groupId/messages', controller.sendMessage);

  // Enviar archivo al grupo (soporta adjuntos multimedia)
  router.post('/:groupId/files', upload.single('file'), controller.sendFileMessage);

  // Reaccionar a un mensaje del grupo
  router.post('/:groupId/messages/:messageId/reactions', controller.addGroupReaction);

  return router;
}

module.exports = createGroupChatRoutes;