const express = require('express');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const { passport, isGoogleOAuthConfigured } = require('../config/passport');

const router = express.Router();

const getClientUrl = () => (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');

const redirectToLoginWithOauthError = (res) => res.redirect(`${getClientUrl()}/login?oauth=error`);

const googleLoginHandler = (req, res, next) => {
	if (!isGoogleOAuthConfigured) {
		return redirectToLoginWithOauthError(res);
	}

	return passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
};

const googleCallbackHandler = (req, res, next) => {
	if (!isGoogleOAuthConfigured) {
		return redirectToLoginWithOauthError(res);
	}

	return passport.authenticate('google', {
		session: false,
		failureRedirect: `${getClientUrl()}/login?oauth=error`,
	})(req, res, next);
};

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/google', googleLoginHandler);
router.get('/google/callback', googleCallbackHandler, authController.googleCallback);
router.get('/profile', authMiddleware, authController.profile);
router.put('/profile', authMiddleware, authController.updateProfile);
router.put('/change-password', authMiddleware, authController.changePassword);
router.post('/logout', authController.logout);

module.exports = router;
