const axios = require('axios');

const TEST_PAYLOAD = {
  event: 'SOLICITUD_INGRESO',
  payload: {
    targetUserId: 'ADMIN_USER_ID', // Cambia esto por un ID real de tu DB
    userName: 'Usuario de Prueba',
    groupName: 'Grupo de Estudio Node.js',
    groupId: 'group123'
  }
};

async function testNotification() {
  try {
    console.log('Enviando solicitud de prueba al servicio de notificaciones...');
    const response = await axios.post('http://localhost:3004/notify', TEST_PAYLOAD);
    console.log('Respuesta del servicio:', response.data);
  } catch (error) {
    console.error('Error en la prueba:', error.response ? error.response.data : error.message);
  }
}

testNotification();
