require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { db } = require('./src/config/firestore');

// --- 1. REPOSITORIO ÚNICO ---
const FirestoreAcademicCatalogRepository = require('./src/infrastructure/database/FirestoreAcademicCatalogRepository');
const catalogRepo = new FirestoreAcademicCatalogRepository(db);

// --- 2. CASOS DE USO (Extraídos de tu monolito) ---
const GetAllFaculties = require('./src/application/use-cases/getAllFaculties');
const GetAcademicLevelsByFaculty = require('./src/application/use-cases/getAcademicLevelsByFaculty');
const GetFormationLevels = require('./src/application/use-cases/getFormationLevels');
const GetCareersByPath = require('./src/application/use-cases/getCareersByPath');
const GetAllCareers = require('./src/application/use-cases/getAllCareers');
const GetAllSubjects = require('./src/application/use-cases/getAllSubjects');
const GetCareerStructure = require('./src/application/use-cases/getCareerStructure');

const getAllFacultiesUC = new GetAllFaculties(catalogRepo);
const getAcademicLevelsByFacultyUC = new GetAcademicLevelsByFaculty(catalogRepo);
const getFormationLevelsUC = new GetFormationLevels(catalogRepo);
const getCareersByPathUC = new GetCareersByPath(catalogRepo);
const getAllCareersUC = new GetAllCareers(catalogRepo);
const getAllSubjectsUC = new GetAllSubjects(catalogRepo);
const getCareerStructureUC = new GetCareerStructure(catalogRepo);

// --- 3. CONTROLADOR ---
const AcademicController = require('./src/infrastructure/http/controllers/academicController');
const academicCtrl = new AcademicController({
  getAllFaculties: getAllFacultiesUC,
  getAcademicLevelsByFaculty: getAcademicLevelsByFacultyUC,
  getFormationLevels: getFormationLevelsUC,
  getCareersByPath: getCareersByPathUC,
  getAllCareers: getAllCareersUC,
  getAllSubjects: getAllSubjectsUC,
  getCareerStructure: getCareerStructureUC
});

// --- 4. RUTAS ---
const createAcademicRoutes = require('./src/infrastructure/http/routes/academicRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// El Gateway redirige /api/academic -> este microservicio
app.use('/', createAcademicRoutes(academicCtrl));

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
  console.log(`🎓 Academic Service (Catálogos) listo en puerto ${PORT}`);
});