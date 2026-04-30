const chatSubject = require('../../../src/application/observer/ChatSubject');

describe('ChatSubject - Pruebas Unitarias', () => {
  let mockObserver;

  beforeEach(() => {
    chatSubject.observers = [];

    mockObserver = {
      update: jest.fn(),
    };
  });

  it('debe adjuntar un observador correctamente', () => {
    chatSubject.attach(mockObserver);

    expect(chatSubject.observers.length).toBe(1);
    expect(chatSubject.observers).toContain(mockObserver);
  });

  it('no debe duplicar un observador si ya está adjunto', () => {
    chatSubject.attach(mockObserver);
    chatSubject.attach(mockObserver); 

    expect(chatSubject.observers.length).toBe(1);
  });

  it('debe remover (detach) un observador correctamente', () => {
    chatSubject.attach(mockObserver);
    chatSubject.detach(mockObserver);

    expect(chatSubject.observers.length).toBe(0);
  });

  it('debe notificar a los observadores', () => {
    chatSubject.attach(mockObserver);

    const event = 'NUEVO_MENSAJE';
    const data = { groupId: 'group-1', message: 'Hola' };

    chatSubject.notify(event, data);

    expect(mockObserver.update).toHaveBeenCalledTimes(1);
    expect(mockObserver.update).toHaveBeenCalledWith(event, data);
  });

  it('no debe fallar al notificar si no hay observadores', () => {
    const event = 'NUEVO_MENSAJE';
    const data = { groupId: 'group-1', message: 'Hola' };

    expect(() => chatSubject.notify(event, data)).not.toThrow();
    expect(mockObserver.update).not.toHaveBeenCalled();
  });
});