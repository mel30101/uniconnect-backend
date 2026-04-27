require('dotenv').config();
const express = require('express');
const passport = require('passport');
const cors = require('cors');
const DatabaseFactory = require('./src/config/databaseFactory');

const db = DatabaseFactory.getDatabase();

const FirestoreUserRepository = require('./src/infrastructure/database/FirestoreUserRepository');
const userRepo = new FirestoreUserRepository(db);

const configurePassport = require('./src/config/passport');
configurePassport(userRepo);

const createAuthRoutes = require('./src/infrastructure/http/routes/authRoutes');

const app = express();
app.disable('x-powered-by');
app.use(express.json());
app.use(cors());
app.use(passport.initialize());

app.use('/', createAuthRoutes());

if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => console.log(`🔐 Auth Service listo en puerto ${PORT}`));
}

module.exports = app;