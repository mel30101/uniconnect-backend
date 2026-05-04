const FirestoreUserRepository = require('../../src/infrastructure/database/FirestoreUserRepository');

describe('FirestoreUserRepository - Unidad', () => {
  let repository;
  let mockDb;

  beforeEach(() => {
    mockDb = {
      collection: jest.fn().mockReturnThis(),
      doc: jest.fn().mockReturnThis(),
      get: jest.fn(),
      set: jest.fn(),
      where: jest.fn().mockReturnThis(),
    };

    repository = new FirestoreUserRepository(mockDb);
  });

  describe('findById', () => {
    it('debería retornar el usuario cuando este existe', async () => {
      const mockDoc = {
        exists: true,
        id: 'user_123',
        data: () => ({ name: 'Test User', email: 'test@ucaldas.edu.co' })
      };
      mockDb.get.mockResolvedValue(mockDoc);

      const result = await repository.findById('user_123');

      expect(mockDb.collection).toHaveBeenCalledWith('users');
      expect(mockDb.doc).toHaveBeenCalledWith('user_123');
      expect(mockDb.get).toHaveBeenCalled();
      expect(result).toEqual({ id: 'user_123', name: 'Test User', email: 'test@ucaldas.edu.co' });
    });

    it('debería retornar null cuando el documento no existe', async () => {
      const mockDoc = { exists: false };
      mockDb.get.mockResolvedValue(mockDoc);

      const result = await repository.findById('unknown_user');

      expect(result).toBeNull();
    });
  });

  describe('findByIds', () => {
    it('debería retornar un arreglo vacío si el arreglo de ids es nulo o vacío', async () => {
      expect(await repository.findByIds([])).toEqual([]);
      expect(await repository.findByIds(null)).toEqual([]);
    });

    it('debería retornar el estado de los documentos al consultar múltiples IDs', async () => {
      const mockDoc1 = { exists: true, id: '1', data: () => ({ name: 'User 1' }) };
      const mockDoc2 = { exists: false, id: '2' };

      mockDb.get
        .mockResolvedValueOnce(mockDoc1)
        .mockResolvedValueOnce(mockDoc2);

      const result = await repository.findByIds(['1', '2']);

      expect(result).toEqual([
        { id: '1', exists: true, name: 'User 1' },
        { id: '2', exists: false }
      ]);
    });
  });

  describe('save', () => {
    it('debería realizar un set con merge en el documento', async () => {
      const userData = { name: 'Updated Name' };

      await repository.save('user_123', userData);

      expect(mockDb.collection).toHaveBeenCalledWith('users');
      expect(mockDb.doc).toHaveBeenCalledWith('user_123');
      expect(mockDb.set).toHaveBeenCalledWith(userData, { merge: true });
    });
  });

  describe('findAll', () => {
    it('debería retornar todos los usuarios de la colección', async () => {
      const mockSnapshot = {
        docs: [
          { id: 'user_1', data: () => ({ name: 'User 1' }) },
          { id: 'user_2', data: () => ({ name: 'User 2' }) }
        ]
      };
      mockDb.get.mockResolvedValue(mockSnapshot);

      const result = await repository.findAll();

      expect(mockDb.collection).toHaveBeenCalledWith('users');
      expect(mockDb.get).toHaveBeenCalled();
      expect(result).toEqual([
        { id: 'user_1', name: 'User 1' },
        { id: 'user_2', name: 'User 2' }
      ]);
    });
  });

  describe('findByUids', () => {
    it('debería retornar un arreglo vacío si el arreglo de UIDs está vacío o es nulo', async () => {
      expect(await repository.findByUids([])).toEqual([]);
      expect(await repository.findByUids(null)).toEqual([]);
    });

    it('debería consultar usuarios usando la cláusula where', async () => {
      const mockSnapshot = {
        docs: [
          { id: 'user_1', data: () => ({ uid: 'google_123' }) }
        ]
      };
      mockDb.get.mockResolvedValue(mockSnapshot);

      const result = await repository.findByUids(['google_123']);

      expect(mockDb.collection).toHaveBeenCalledWith('users');
      expect(mockDb.where).toHaveBeenCalledWith('uid', 'in', ['google_123']);
      expect(mockDb.get).toHaveBeenCalled();
      expect(result).toEqual([
        { id: 'user_1', uid: 'google_123' }
      ]);
    });
  });
});