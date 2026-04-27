require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { db } = require('./src/config/firestore');

const FirestoreUserRepository = require('./src/infrastructure/database/FirestoreUserRepository');
const FirestoreAcademicProfileRepository = require('./src/infrastructure/database/FirestoreAcademicProfileRepository');
const FirestoreAcademicCatalogRepository = require('./src/infrastructure/database/FirestoreAcademicCatalogRepository');

const userRepo = new FirestoreUserRepository(db);
const academicProfileRepo = new FirestoreAcademicProfileRepository(db);
const catalogRepo = new FirestoreAcademicCatalogRepository(db);

const GetFullProfile = require('./src/application/use-cases/getFullProfile');
const SaveAcademicProfile = require('./src/application/use-cases/saveAcademicProfile');
const SearchStudents = require('./src/application/use-cases/searchStudents');

const getFullProfileUC = new GetFullProfile(academicProfileRepo, userRepo, catalogRepo);
const saveAcademicProfileUC = new SaveAcademicProfile(academicProfileRepo, userRepo, catalogRepo, getFullProfileUC);
const searchStudentsUC = new SearchStudents(academicProfileRepo, userRepo);

const ProfileController = require('./src/infrastructure/http/controllers/profileController');
const SearchController = require('./src/infrastructure/http/controllers/searchController');

const profileCtrl = new ProfileController({
  getFullProfile: getFullProfileUC,
  saveAcademicProfile: saveAcademicProfileUC
});

const searchCtrl = new SearchController({
  searchStudents: searchStudentsUC
});

const createProfileRoutes = require('./src/infrastructure/http/routes/profileRoutes');
const createSearchRoutes = require('./src/infrastructure/http/routes/searchRoutes');
const { globalErrorHandler } = require('./src/infrastructure/http/middlewares/errorMiddleware');

const app = express();

app.use(express.json());

app.use('/profile', createProfileRoutes(profileCtrl));
app.use('/search', createSearchRoutes(searchCtrl));

app.use(globalErrorHandler);

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`👤 User Service ejecutándose en puerto ${PORT}`);
});