const express = require('express');

function createAcademicRoutes(controller) {
  const router = express.Router();

  // Hierarchy routes (montadas en /api/hierarchy)
  router.get('/faculties', controller.getAllFaculties);
  router.get('/academic-levels/:facultyId', controller.getAcademicLevelsByFaculty);
  router.get('/formation-levels/:facultyId/:academicLevelId', controller.getFormationLevels);
  router.get('/careers-by-path/:facultyId/:academicLevelId/:formationLevelId', controller.getCareersByPath);

  // Career routes (montadas en /api/careers)
  router.get('/careers', controller.getAllCareers);

  // Subject routes (montadas en /api/subjects)
  router.get('/subjects', controller.getAllSubjects);

  // Career structure routes (montadas en /api/career-structure)
  router.get('/career-structure/:careerId', controller.getCareerStructure);

  return router;
}

module.exports = createAcademicRoutes;
