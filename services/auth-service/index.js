require('dotenv').config();
const express = require('express');
const passport = require('passport');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const DatabaseFactory = require('./src/config/databaseFactory');
const db = DatabaseFactory.getDatabase();

//const { db } = require('./src/config/firestore');

const FirestoreUserRepository = require('./src/infrastructure/database/FirestoreUserRepository');
const userRepo = new FirestoreUserRepository(db);

const configurePassport = require('./src/config/passport');
configurePassport(userRepo);

const createAuthRoutes = require('./src/infrastructure/http/routes/authRoutes');

const app = express();

app.disable('x-powered-by');
app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: [
    process.env.DASHBOARD_URL,
    process.env.BASE_URL,
  ],
  credentials: true
}));

app.use(passport.initialize());

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'auth-service',
    timestamp: new Date().toISOString()
  });
});

app.use('/', createAuthRoutes());

if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => console.log(`🔐 Auth Service listo en puerto ${PORT}`));
}

module.exports = app;