const GetDecoratedProfile = require('../../src/application/use-cases/getDecoratedProfile');

jest.mock('../../src/domain/decorators/PerfilBase', () => {
  return jest.fn().mockImplementation((data) => ({
    getProfileData: jest.fn().mockReturnValue(data)
  }));
});
jest.mock('../../src/domain/decorators/PerfilConEstadisticas', () => {
  return jest.fn().mockImplementation((perfil, stats) => ({
    getProfileData: jest.fn().mockReturnValue({
      ...perfil.getProfileData(),
      ...stats
    })
  }));
});
jest.mock('../../src/domain/decorators/PerfilConInsignias', () => {
  return jest.fn().mockImplementation((perfil) => ({
    getProfileData: jest.fn().mockReturnValue({
      ...perfil.getProfileData(),
      insignias: ['Insignia de prueba']
    })
  }));
});

describe('GetDecoratedProfile - Prueba Unitaria', () => {
  let useCase;
  let mockGetFullProfileUC;
  let mockStatsRepo;

  beforeEach(() => {
    jest.clearAllMocks();

    mockGetFullProfileUC = {
      execute: jest.fn(),
    };

    mockStatsRepo = {
      getStudentStats: jest.fn(),
    };

    useCase = new GetDecoratedProfile(
      mockGetFullProfileUC,
      mockStatsRepo
    );
  });

  it('debería retornar el perfil decorado con estadísticas cuando se pide vista completa', async () => {
    const studentId = 'user_123';
    const mockProfileData = { 
      id: studentId, 
      program: 'Ingeniería'
    };
    const mockStats = { solvedProblems: 45 };

    mockGetFullProfileUC.execute.mockResolvedValue(mockProfileData);
    mockStatsRepo.getStudentStats.mockResolvedValue(mockStats);

    const result = await useCase.execute(studentId, 'completa');

    expect(mockGetFullProfileUC.execute).toHaveBeenCalledWith(studentId);
    expect(mockStatsRepo.getStudentStats).toHaveBeenCalledWith(studentId);
    expect(result.solvedProblems).toBe(45);
  });

  it('debería retornar el perfil básico si la vista no es completa', async () => {
    const studentId = 'user_123';
    const mockProfileData = { 
      id: studentId, 
      program: 'Ingeniería'
    };

    mockGetFullProfileUC.execute.mockResolvedValue(mockProfileData);

    const result = await useCase.execute(studentId, 'basica');

    expect(mockGetFullProfileUC.execute).toHaveBeenCalledWith(studentId);
    expect(mockStatsRepo.getStudentStats).not.toHaveBeenCalled();
    expect(result.program).toBe('Ingeniería');
  });
});