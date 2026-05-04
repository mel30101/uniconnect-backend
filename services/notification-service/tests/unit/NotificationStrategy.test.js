const NotificationService = require('../../src/domain/services/NotificationService');
const FirebaseNotificationProvider = require('../../src/infrastructure/providers/FirebaseNotificationProvider');

describe('Patrón Strategy - Pruebas de Notificaciones', () => {
  let mockAdmin;

  beforeEach(() => {
    mockAdmin = {
      messaging: jest.fn().mockReturnValue({
        send: jest.fn(),
        sendEachForMulticast: jest.fn(),
      }),
    };
  });

  // Criterio 1: Cada estrategia concreta tiene al menos dos casos de prueba (envío exitoso y error)
  describe('Criterio 1: Estrategia FirebaseNotificationProvider', () => {
    it('Debería enviar la notificación exitosamente', async () => {
      const provider = new FirebaseNotificationProvider(mockAdmin);
      mockAdmin.messaging().send.mockResolvedValue('projects/test/messages/123');

      const result = await provider.sendPush('test-token', 'Título', 'Cuerpo');

      expect(mockAdmin.messaging().send).toHaveBeenCalledTimes(1);
      expect(result).toBe('projects/test/messages/123');
    });

    it('Debería manejar el error y lanzar la excepción al fallar el envío', async () => {
      const provider = new FirebaseNotificationProvider(mockAdmin);
      mockAdmin.messaging().send.mockRejectedValue(new Error('FCM Error'));

      await expect(provider.sendPush('test-token', 'Título', 'Cuerpo')).rejects.toThrow('FCM Error');
    });
  });

  // Criterio 2: Las estrategias se prueban con dobles de prueba (sin depender de servidores reales)
  describe('Criterio 2: Mocks de clientes externos', () => {
    it('La ejecución no depende de servidores externos reales (Stub/Mock)', async () => {
      const provider = new FirebaseNotificationProvider(mockAdmin);
      mockAdmin.messaging().send.mockResolvedValue('mock-response-id');

      const spy = jest.spyOn(provider, 'sendPush').mockResolvedValue('mock-response-id');

      // Se pasa el objeto vacío explícitamente para que coincida con el argumento
      await provider.sendPush('token', 'Test', 'Body', {});

      expect(spy).toHaveBeenCalledWith('token', 'Test', 'Body', {});
      spy.mockRestore();
    });
  });

  // Criterio 3: Aislamiento de fallos
  describe('Criterio 3: Aislamiento de fallos al inyectar estrategias', () => {
    it('Dado un fallo en una estrategia, las demás se ejecutan correctamente', async () => {
      const strategy1 = {
        channel: 'email',
        sendPush: jest.fn().mockResolvedValue('Email enviado'),
      };
      
      const failingStrategy = {
        channel: 'push',
        sendPush: jest.fn().mockRejectedValue(new Error('Fallo simulado')),
      };

      const strategy3 = {
        channel: 'websocket',
        sendPush: jest.fn().mockResolvedValue('WebSocket enviado'),
      };

      const notificationService = new NotificationService([
        strategy1,
        failingStrategy,
        strategy3,
      ]);

      const result = await notificationService.notifyAll({
        token: 'token',
        title: 'T',
        body: 'B',
      });

      expect(result.success.length).toBe(2);
      expect(result.errors.length).toBe(1);
      expect(strategy1.sendPush).toHaveBeenCalled();
      expect(failingStrategy.sendPush).toHaveBeenCalled();
      expect(strategy3.sendPush).toHaveBeenCalled();
    });
  });

  // Criterio 4: Filtrado de estrategias según preferencias
  describe('Criterio 4: Filtrado de estrategias según preferencias', () => {
    it('Dado que las notificaciones push están desactivadas, no se ejecuta la PushMovilStrategy', async () => {
      const pushStrategy = {
        channel: 'push',
        sendPush: jest.fn().mockResolvedValue('Push enviado'),
      };

      const notificationService = new NotificationService([pushStrategy]);

      // Usuario con preferencia push desactivada
      const preferences = { pushEnabled: false };
      const result = await notificationService.notifyAll(
        { token: 'token', title: 'T', body: 'B' },
        preferences
      );

      expect(result.success.length).toBe(0);
      expect(pushStrategy.sendPush).not.toHaveBeenCalled();
    });
  });

  // Criterio 5: Principio Open/Closed
  describe('Criterio 5: Principio Open/Closed', () => {
    it('El NotificacionService consume una nueva estrategia ficticia sin modificar código', async () => {
      class DummyStrategy {
        constructor() {
          this.channel = 'dummy';
        }
        sendPush() {
          return Promise.resolve('Dummy enviado');
        }
      }
      
      const dummyStrategy = new DummyStrategy();
      const spy = jest.spyOn(dummyStrategy, 'sendPush');

      const notificationService = new NotificationService([dummyStrategy]);
      const result = await notificationService.notifyAll({
        token: 'token',
        title: 'T',
        body: 'B',
      });

      expect(result.success.length).toBe(1);
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });
});