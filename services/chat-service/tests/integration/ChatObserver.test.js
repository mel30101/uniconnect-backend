const Chat = require('../../src/domain/Chat');
const ChatSubject = require('../../src/application/observer/ChatSubject');
const NotificationObserver = require('../../../notification-service/src/application/observers/NotificationObserver');
const mockSendNotificationUseCase = {
  execute: jest.fn().mockResolvedValue(true)
};

describe('ChatObserver - Test de Integración', () => {
  let chat;
  let notificationObserver;

  beforeEach(() => {
    ChatSubject.observers = [];
    chat = new Chat({
      id: 'chat-123',
      participants: ['user-1', 'user-2']
    });
    notificationObserver = new NotificationObserver(mockSendNotificationUseCase);
    jest.clearAllMocks();
  });

  test('Criterio 5: Integración del Subject Chat con el observer principal', async () => {
    // 1. Vinculamos un método update que enruta al caso de uso deseado
    notificationObserver.update = async (event, data) => {
      if (event === 'private_message') {
        return await notificationObserver.onPrivateMessage(
          data.receiverId,
          data.senderName,
          data.messagePreview,
          data.chatId
        );
      }
    };

    // 2. Suscribimos el observer
    ChatSubject.attach(notificationObserver);

    // 3. Notificamos a través del subject
    await ChatSubject.notify('private_message', {
      receiverId: 'user-2',
      senderName: 'user-1',
      messagePreview: 'Hola, qué tal?',
      chatId: 'chat-123'
    });

    // 4. Verificamos que se integre correctamente disparando el caso de uso de notificación
    expect(mockSendNotificationUseCase.execute).toHaveBeenCalledTimes(1);
    expect(mockSendNotificationUseCase.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-2',
        title: 'Nuevo mensaje de user-1',
        body: 'Hola, qué tal?',
        metadata: {
          chatId: 'chat-123',
          type: 'private_message'
        },
        type: 'chat'
      })
    );
  });
});