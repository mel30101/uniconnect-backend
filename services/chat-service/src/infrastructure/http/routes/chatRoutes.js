const express = require('express');
const { upload } = require('../middlewares/uploadMiddleware');

function createChatRoutes(controller) {
  const router = express.Router();

  router.post('/', controller.createChat);
  router.post('/:chatId/messages', controller.sendMessage);
  router.get('/:chatId/messages', controller.getMessage);
  router.post('/:chatId/files', upload.single('file'), controller.sendFileMessage);

  return router;
}

module.exports = createChatRoutes;
