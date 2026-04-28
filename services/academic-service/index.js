require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { db } = require('./src/config/firestore');

const FirestoreAcademicCatalogRepository = require('./src/infrastructure/database/FirestoreAcademicCatalogRepository');
const catalogRepo = new FirestoreAcademicCatalogRepository(db);

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

const createAcademicRoutes = require('./src/infrastructure/http/routes/academicRoutes');

const app = express();
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'academic-service',
    timestamp: new Date().toISOString()
  });
});

app.use('/', createAcademicRoutes(academicCtrl));

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
  console.log(`🎓 Academic Service (Catálogos) listo en puerto ${PORT}`);
});