const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const User = require('../models/User');

const isGoogleOAuthConfigured = Boolean(
  process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_CALLBACK_URL
);

if (isGoogleOAuthConfigured) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const googleId = profile.id;
          const email = profile.emails?.[0]?.value?.trim().toLowerCase();
          const avatar = profile.photos?.[0]?.value || null;
          const name =
            profile.displayName?.trim() ||
            [profile.name?.givenName, profile.name?.familyName].filter(Boolean).join(' ').trim() ||
            email?.split('@')[0] ||
            'Google User';

          if (!email) {
            return done(new Error('Google account email was not provided.'), null);
          }

          let user = await User.findOne({ googleId });

          if (!user) {
            user = await User.findOne({ email });
          }

          if (user) {
            let needsUpdate = false;

            if (!user.googleId) {
              user.googleId = googleId;
              needsUpdate = true;
            }

            if (!user.avatar && avatar) {
              user.avatar = avatar;
              needsUpdate = true;
            }

            if (!user.name && name) {
              user.name = name;
              needsUpdate = true;
            }

            if (user.authProvider !== 'google') {
              user.authProvider = 'google';
              needsUpdate = true;
            }

            if (needsUpdate) {
              await user.save();
            }

            return done(null, user);
          }

          user = await User.create({
            name,
            email,
            googleId,
            avatar,
            authProvider: 'google',
            password: null,
          });

          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );
}

module.exports = { passport, isGoogleOAuthConfigured };