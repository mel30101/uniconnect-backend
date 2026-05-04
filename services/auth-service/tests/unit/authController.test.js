const AuthController = require('../../src/infrastructure/http/controllers/authController');

describe('AuthController - Unidad', () => {
  let authController;
  let mockUserRepo;
  let mockReq;
  let mockRes;

  beforeEach(() => {
    mockUserRepo = {
      findById: jest.fn(),
    };

    authController = new AuthController(mockUserRepo);

    mockReq = {
      user: {
        uid: 'google_test_123',
      },
    };

    mockRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(), 
    };
  });

  it('debería retornar el usuario cuando se encuentra en el repositorio', async () => {
    const userMock = { uid: 'google_test_123', email: 'test@ucaldas.edu.co', name: 'Test User' };
    
    mockUserRepo.findById.mockResolvedValue(userMock);

    await authController.checkSession(mockReq, mockRes);

    expect(mockUserRepo.findById).toHaveBeenCalledWith('google_test_123');
    expect(mockRes.json).toHaveBeenCalledWith(userMock);
  });
});