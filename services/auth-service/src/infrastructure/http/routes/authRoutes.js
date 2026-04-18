const express = require('express');
const passport = require('passport');

function createAuthRoutes() {
  const router = express.Router();

  // Iniciar sesión con Google
  router.get('/google', (req, res, next) => {
    const tempExpoUrl = req.query.redirect;
    passport.authenticate('google', {
      scope: ['profile', 'email'],
      state: tempExpoUrl,
      prompt: 'select_account'
    })(req, res, next);
  });

  // Callback de Google
  router.get('/google/callback', (req, res, next) => {
    passport.authenticate('google', { session: false }, (err, user, info) => {
      const expoUrl = req.query.state;
      if (err || !user) {
        return res.redirect(`${expoUrl}?error=domain_not_allowed`);
      }
      res.redirect(`${expoUrl}?name=${encodeURIComponent(user.name)}&email=${user.email}&uid=${user.uid}`);
    })(req, res, next);
  });

  return router;
}

module.exports = createAuthRoutes;
