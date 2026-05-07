const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { authMiddleware } = require('../middlewares/authMiddleware');

function createAuthRoutes() {
  const router = express.Router();

  // Iniciar flujo OAuth
  router.get('/google', (req, res, next) => {
    const redirectTarget = req.query.redirect;
    passport.authenticate('google', {
      scope: ['profile', 'email'],
      state: redirectTarget,
      prompt: 'select_account'
    })(req, res, next);
  });

  // Callback de Google
  router.get('/google/callback', (req, res, next) => {
    passport.authenticate('google', { session: false }, (err, user, info) => {
      const state = req.query.state; // 'web' o expoUrl

      if (err || !user) {
        if (state === 'web') {
          return res.redirect(`${process.env.DASHBOARD_URL}/?error=domain_not_allowed`);
        }
        return res.redirect(`${state}?error=domain_not_allowed`);
      }

      // Generamos el JWT firmado tanto para Web como para Móvil.
      // La validación estricta de @ucaldas.edu.co ya fue aplicada por el strategy de Passport.
      const token = jwt.sign(
        { uid: user.uid, name: user.name, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      if (state === 'web') {
        res.cookie('uniconnect_token', token, {
          httpOnly: true,
          sameSite: 'none',
          secure: true,
          maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.redirect(`${process.env.DASHBOARD_URL}/?name=${encodeURIComponent(user.name)}&email=${encodeURIComponent(user.email)}&uid=${encodeURIComponent(user.uid)}`);
      }

      // Origen Móvil (state es la url de Expo ej: exp://...)
      // NOTA: Este token será capturado por el frontend móvil para ser almacenado de manera segura en SecureStore (US-M01)
      res.redirect(`${state}?token=${token}&name=${encodeURIComponent(user.name)}&email=${encodeURIComponent(user.email)}&uid=${encodeURIComponent(user.uid)}`);
    })(req, res, next);
  });

  router.get('/me', authMiddleware, (req, res) => {
    res.json({
      uid: req.user.uid,
      name: req.user.name,
      email: req.user.email
    });
  });

  router.post('/logout', (req, res) => {
    res.clearCookie('uniconnect_token', { httpOnly: true, sameSite: 'none', secure: true });
    res.json({ message: 'Sesión cerrada' });
  });

  return router;
}

module.exports = createAuthRoutes;
