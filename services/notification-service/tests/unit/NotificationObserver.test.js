const NotificationObserver = require('../../src/application/observers/NotificationObserver');

describe('NotificationObserver - Pruebas Unitarias', () => {
  let observer;
  let mockSendNotificationUseCase;

  beforeEach(() => {
    mockSendNotificationUseCase = {
      execute: jest.fn().mockResolvedValue({ notificationId: 'mock-id' }),
    };

    observer = new NotificationObserver(mockSendNotificationUseCase);
    jest.clearAllMocks();
  });

  describe('Notificaciones de Chat', () => {
    it('debe procesar correctamente una mención y llamar al caso de uso', async () => {
      await observer.onMention(
        'user-123',
        'Carlos',
        'Software 3',
        'Hola, revisa este archivo',
        'group-999'
      );

      expect(mockSendNotificationUseCase.execute).toHaveBeenCalledTimes(1);
      expect(mockSendNotificationUseCase.execute).toHaveBeenCalledWith({
        userId: 'user-123',
        title: 'Mención en Software 3',
        body: 'Carlos te ha mencionado: "Hola, revisa este archivo"',
        metadata: { groupId: 'group-999', type: 'mention' },
        type: 'chat',
      });
    });

    it('debe procesar correctamente un mensaje privado', async () => {
      await observer.onPrivateMessage(
        'receiver-123',
        'Ana',
        '¿Nos vemos hoy?',
        'chat-456'
      );

      expect(mockSendNotificationUseCase.execute).toHaveBeenCalledTimes(1);
      expect(mockSendNotificationUseCase.execute).toHaveBeenCalledWith({
        userId: 'receiver-123',
        title: 'Nuevo mensaje de Ana',
        body: '¿Nos vemos hoy?',
        metadata: { chatId: 'chat-456', type: 'private_message' },
        type: 'chat',
      });
    });
  });

  describe('Notificaciones de Grupo', () => {
    it('debe procesar correctamente una solicitud de unión a grupo', async () => {
      await observer.onGroupRequest(
        'admin-123',
        'Juan',
        'Grupo de Estudio',
        'group-777'
      );

      expect(mockSendNotificationUseCase.execute).toHaveBeenCalledTimes(1);
      expect(mockSendNotificationUseCase.execute).toHaveBeenCalledWith({
        userId: 'admin-123',
        title: 'Nueva solicitud de unión',
        body: 'Juan quiere unirse a tu grupo "Grupo de Estudio"',
        metadata: { groupId: 'group-777', type: 'group_request' },
        type: 'group',
      });
    });
  });

  describe('Notificaciones de Eventos', () => {
    it('debe procesar correctamente un nuevo evento', async () => {
      await observer.onNewEvent(
        'user-123',
        'Tecnología',
        'Conferencia de IA',
        'event-789'
      );

      expect(mockSendNotificationUseCase.execute).toHaveBeenCalledTimes(1);
      expect(mockSendNotificationUseCase.execute).toHaveBeenCalledWith({
        userId: 'user-123',
        title: 'Nuevo evento en Tecnología',
        body: 'Conferencia de IA',
        metadata: { eventId: 'event-789', type: 'new_event' },
        type: 'event',
      });
    });
  });
});