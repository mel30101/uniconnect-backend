const express = require('express');

function createGroupRoutes(controller) {
  const router = express.Router();

  // Crear grupo
  router.post('/', controller.createGroup);

  // Verificar nombre único
  router.get('/check-name/:name', controller.checkGroupNameUnique);

  // Obtener grupos de un usuario
  router.get('/user/:userId', controller.getUserGroups);

  // Buscar grupos (search, filtros)
  router.get('/', controller.searchGroups);

  // Obtener grupo por ID
  router.get('/:id', controller.getGroupById);

  // Solicitudes de unión
  router.post('/:id/requests', controller.sendJoinRequest);
  router.get('/:id/requests', controller.getGroupRequests);
  router.put('/:id/requests/:requestId', controller.handleRequestAction);

  // Gestión de miembros
  router.post('/:id/members', controller.addMember);
  router.delete('/:id/members/:userId', controller.removeMember);
  router.delete('/:id/leave/:userId', controller.leaveGroup);

  // Transferir administración
  router.put('/:id/transfer-admin', controller.transferAdmin);
  
  router.post('/:id/requests', controller.sendJoinRequest);
  router.get('/:id/requests', controller.getGroupRequests);
  router.put('/:id/requests/:requestId', controller.handleRequestAction);
  
  router.delete('/:id/requests/:userId', controller.deleteUserRequests);

  // Gestión de miembros
  router.post('/:id/members', controller.addMember);
  router.delete('/:id/members/:userId', controller.removeMember);
  router.delete('/:id/leave/:userId', controller.leaveGroup);

  return router;
}

module.exports = createGroupRoutes;
