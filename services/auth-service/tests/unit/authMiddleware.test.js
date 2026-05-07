const { verifyFirebaseToken } = require('../../src/infrastructure/http/middlewares/authMiddleware');
const admin = require('firebase-admin');

jest.mock('firebase-admin');

describe('Auth Middleware - Unidad', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {
      headers: {
        authorization: 'Bearer mock-token'
      }
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    mockNext = jest.fn();
  });

  it('debería retornar 401 si no hay token en el header', async () => {
    mockReq.headers.authorization = undefined;

    await verifyFirebaseToken(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'No token provided' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('debería retornar 401 si el token no tiene el formato correcto (sin Bearer)', async () => {
    mockReq.headers.authorization = 'InvalidTokenFormat';

    await verifyFirebaseToken(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'No token provided' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('debería llamar a next() si el token es válido y está autenticado en Firebase', async () => {
    const mockDecodedToken = { uid: 'google_test_123', email: 'test@ucaldas.edu.co' };
    
    admin.auth = jest.fn().mockReturnValue({
      verifyIdToken: jest.fn().mockResolvedValue(mockDecodedToken)
    });

    await verifyFirebaseToken(mockReq, mockRes, mockNext);

    expect(mockReq.user).toEqual(mockDecodedToken);
    expect(mockNext).toHaveBeenCalled();
  });

  it('debería retornar 401 si la verificación en Firebase falla', async () => {
    admin.auth = jest.fn().mockReturnValue({
      verifyIdToken: jest.fn().mockRejectedValue(new Error('Invalid token signature'))
    });

    await verifyFirebaseToken(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Invalid token' });
    expect(mockNext).not.toHaveBeenCalled();
  });
});