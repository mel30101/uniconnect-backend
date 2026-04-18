const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const admin = require('firebase-admin');

const configurePassport = (userRepo) => {
  passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BASE_URL}/auth/google/callback`,
      proxy: true
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        if (!email.endsWith('@ucaldas.edu.co')) {
          return done(null, false, { message: 'Dominio no permitido' });
        }

        const userData = {
          uid: profile.id,
          name: profile.displayName,
          email: email,
          lastLogin: new Date()
        };

        // Usar el repositorio inyectado para persistir
        await userRepo.save(profile.id, userData);
        return done(null, userData);
      } catch (error) {
        return done(error, null);
      }
    }
  ));
};

module.exports = configurePassport;
