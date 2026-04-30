const EventController = require('../../src/infrastructure/http/controllers/eventController');

describe('EventController - Pruebas Unitarias', () => {
  let controller;
  let mockCreateEventUC;
  let req;
  let res;

  beforeEach(() => {
    mockCreateEventUC = {
      execute: jest.fn(),
    };

    controller = new EventController({
      createEvent: mockCreateEventUC,
      getEvents: jest.fn(),
      getCategories: jest.fn(),
      subscribeToCategory: jest.fn(),
      unsubscribeFromCategory: jest.fn(),
      getSubscribedCategories: jest.fn(),
    });

    req = {
      body: {},
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
    };

    jest.clearAllMocks();
  });

  it('debe retornar error 400 si faltan parámetros obligatorios (title, type)', async () => {
    req.body = {
      title: 'Taller de Software 3',
    };

    await controller.createEvent(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Faltan parámetros obligatorios (title, type)',
    });
    expect(mockCreateEventUC.execute).not.toHaveBeenCalled();
  });

  it('debe llamar al caso de uso createEvent correctamente', async () => {
    req.body = {
      title: 'Taller de Software 3',
      type: 'Académico',
      description: 'Revisión de proyectos',
      date: '2026-05-15T10:00:00Z',
    };

    const mockEvent = { id: 'evento-123', ...req.body };
    mockCreateEventUC.execute.mockResolvedValue(mockEvent);

    await controller.createEvent(req, res);

    expect(mockCreateEventUC.execute).toHaveBeenCalledWith(req.body);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(mockEvent);
  });
});