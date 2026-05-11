const ChatSubject = require('../../../src/application/observer/ChatSubject');

describe('ChatSubject.js - Pruebas del patrón Observer', () => {
  let observer1;
  let observer2;

  beforeEach(() => {
    ChatSubject.observers = []; 
    observer1 = { update: jest.fn() };
    observer2 = { update: jest.fn() };
  });

  test('Criterio 1: Dado un Subject con 2 observers suscritos, cuando se llama notify(), entonces ambos observers reciben el evento', () => {
    ChatSubject.attach(observer1);
    ChatSubject.attach(observer2);

    ChatSubject.notify('mensaje_enviado', { contenido: 'Hola mundo' });

    expect(observer1.update).toHaveBeenCalledTimes(1);
    expect(observer1.update).toHaveBeenCalledWith('mensaje_enviado', { contenido: 'Hola mundo' });
    expect(observer2.update).toHaveBeenCalledTimes(1);
    expect(observer2.update).toHaveBeenCalledWith('mensaje_enviado', { contenido: 'Hola mundo' });
  });

  test('Criterio 2: Dado un observer que se desuscribe, cuando el subject notifica, entonces ese observer ya no recibe el evento', () => {
    ChatSubject.attach(observer1);
    ChatSubject.attach(observer2);

    ChatSubject.detach(observer1);
    ChatSubject.notify('mensaje_enviado', { contenido: 'Hola mundo' });

    expect(observer1.update).not.toHaveBeenCalled();
    expect(observer2.update).toHaveBeenCalledTimes(1);
  });

  test('Criterio 3: Dado que un observer lanza excepción, cuando el subject notifica, entonces los demás observers siguen recibiendo el evento (aislamiento de errores)', () => {
    observer1.update.mockImplementation(() => {
      throw new Error('Error simulado en observer');
    });

    ChatSubject.attach(observer1);
    ChatSubject.attach(observer2);

    ChatSubject.notify('mensaje_enviado', { contenido: 'Hola mundo' });

    expect(observer1.update).toHaveBeenCalledTimes(1);
    expect(observer2.update).toHaveBeenCalledTimes(1); 
  });

  test('Criterio 4: Las pruebas usan mocks/stubs para los observers', () => {
    const mockObserver = { update: jest.fn() };
    ChatSubject.attach(mockObserver);
    
    ChatSubject.notify('evento_prueba', { data: 'test' });
    
    expect(mockObserver.update).toHaveBeenCalledTimes(1);
    expect(mockObserver.update).toHaveBeenCalledWith('evento_prueba', { data: 'test' });
  });
});