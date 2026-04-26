require('dotenv').config();
const express = require('express');
const passport = require('passport');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { db } = require('./src/config/firestore');

const FirestoreUserRepository = require('./src/infrastructure/database/FirestoreUserRepository');
const userRepo = new FirestoreUserRepository(db);

const configurePassport = require('./src/config/passport');
configurePassport(userRepo);

const createAuthRoutes = require('./src/infrastructure/http/routes/authRoutes');

const app = express();

app.use(cors({
  origin: [
    process.env.DASHBOARD_URL,
    process.env.BASE_URL,
  ],
  credentials: true
}));

app.use(cookieParser());

app.use(passport.initialize());

app.use('/', createAuthRoutes());

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🔐 Auth Service listo en puerto ${PORT}`));