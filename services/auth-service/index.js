require('dotenv').config();
const express = require('express');
const passport = require('passport');
const cors = require('cors');
const { db } = require('./src/config/firestore');

// Repositorio necesario para que Passport busque/cree el usuario
const FirestoreUserRepository = require('./src/infrastructure/database/FirestoreUserRepository');
const userRepo = new FirestoreUserRepository(db);

// Configuración de Passport
const configurePassport = require('./src/config/passport');
configurePassport(userRepo);

const createAuthRoutes = require('./src/infrastructure/http/routes/authRoutes');

const app = express();
app.use(cors());
app.use(passport.initialize());

// Montamos las rutas. 
// Recuerda: el Gateway mapea "/auth" -> este servicio.
app.use('/', createAuthRoutes()); 

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🔐 Auth Service listo en puerto ${PORT}`));