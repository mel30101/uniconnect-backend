const GetFullProfile = require('../../src/application/use-cases/getFullProfile');

describe('GetFullProfile - Prueba Unitaria', () => {
  let useCase;
  let mockAcademicProfileRepo;
  let mockUserRepo;
  let mockCatalogRepo;

  beforeEach(() => {
    jest.clearAllMocks();

    mockAcademicProfileRepo = {
      findByStudentId: jest.fn(),
    };

    mockUserRepo = {
      findById: jest.fn(),
    };

    mockCatalogRepo = {
      getMappingById: jest.fn(),
      getFacultyById: jest.fn(),
      getAcademicLevelById: jest.fn(),
      getFormationLevelById: jest.fn(),
      getCareerById: jest.fn(),
      getSubjectsByIds: jest.fn(),
    };

    useCase = new GetFullProfile(
      mockAcademicProfileRepo,
      mockUserRepo,
      mockCatalogRepo
    );
  });

  it('debería retornar el perfil completo cuando el usuario y el perfil existen', async () => {
    const studentId = 'user_123';

    const mockProfile = {
      mappingId: 'map_1',
      facultyId: 'fac_1',
      academicLevelId: 'lvl_1',
      formationLevelId: 'form_1',
      careerId: 'car_1',
      subjects: ['subj_1']
    };

    const mockUser = {
      id: studentId,
      name: 'Estudiante Prueba'
    };

    const mockMapping = {
      facultyId: 'fac_mapped',
      academicLevelId: 'lvl_mapped',
      formationLevelId: 'form_mapped',
      careerId: 'car_mapped'
    };

    // Configurar respuestas de los mocks
    mockAcademicProfileRepo.findByStudentId.mockResolvedValue(mockProfile);
    mockUserRepo.findById.mockResolvedValue(mockUser);
    mockCatalogRepo.getMappingById.mockResolvedValue(mockMapping);
    
    // Configurar respuestas de catálogos
    mockCatalogRepo.getFacultyById.mockResolvedValue({ name: 'Ingeniería' });
    mockCatalogRepo.getAcademicLevelById.mockResolvedValue({ name: 'Pregrado' });
    mockCatalogRepo.getFormationLevelById.mockResolvedValue({ name: 'Profesional' });
    mockCatalogRepo.getCareerById.mockResolvedValue({ name: 'Ingeniería de Sistemas' });
    mockCatalogRepo.getSubjectsByIds.mockResolvedValue([{ exists: true, name: 'Estructuras de Datos' }]);

    const result = await useCase.execute(studentId);

    // Verificaciones de llamadas
    expect(mockAcademicProfileRepo.findByStudentId).toHaveBeenCalledWith(studentId);
    expect(mockUserRepo.findById).toHaveBeenCalledWith(studentId);
    expect(mockCatalogRepo.getMappingById).toHaveBeenCalledWith(mockProfile.mappingId);

    // Verificaciones del resultado
    expect(result.userName).toBe('Estudiante Prueba');
    expect(result.facultyName).toBe('Ingeniería');
    expect(result.careerName).toBe('Ingeniería de Sistemas');
    expect(result.subjectNames).toEqual(['Estructuras de Datos']);
  });

  it('debería lanzar un error PROFILE_NOT_FOUND si no existen ni el perfil ni el usuario', async () => {
    const studentId = 'unknown_user';

    mockAcademicProfileRepo.findByStudentId.mockResolvedValue(null);
    mockUserRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute(studentId)).rejects.toThrow('PROFILE_NOT_FOUND');
  });

  it('debería propagar el error si alguno de los repositorios falla', async () => {
    const studentId = 'user_123';
    const errorMessage = 'Error de conexión con la base de datos';

    mockAcademicProfileRepo.findByStudentId.mockRejectedValue(new Error(errorMessage));

    await expect(useCase.execute(studentId)).rejects.toThrow(errorMessage);
  });
});