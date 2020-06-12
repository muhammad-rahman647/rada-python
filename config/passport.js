const LocalStrategy = require('passport-local').Strategy;
const Admin = require('../models/admin');
const User = require('../models/user');

function SessionConstructor(userId, userGroup, details) {
   this.userId = userId;
   this.userGroup = userGroup;
   this.details = details;
}

module.exports = function (passport) {
   // local admin
   passport.use(
      'local-Admin',
      new LocalStrategy({
         usernameField: 'email',
         passwordField: 'password'
      }, function (email, password, done) {
         // Match user
         Admin.findOne({
            email: email,
         }).then((user) => {
            if (!user) {
               return done(null, false, {
                  message: 'That user is not registered'
               });
            }

            // Match password
            if (!user.comparePassword(password, user.password)) {
               return done(null, false, {
                  message: 'Password incorrect'
               });
            }

            return done(null, user);
         });
      })
   );

   // local-user
   passport.use(
      'local-user',
      new LocalStrategy({
         usernameField: 'email',
         passwordField: 'password'
      }, (email, password, done) => {
         // Match user
         User.findOne({
            email: email,
         }).then((user) => {
            console.log(user);
            if (!user) {
               return done(null, false, {
                  message: 'That user is not registered'
               });
            }

            // Match password
            if (!user.comparePassword(password, user.password)) {
               return done(null, false, {
                  message: 'Password incorrect'
               });
            }

            return done(null, user);
         });
      })
   );

   passport.serializeUser(function (userObject, done) {
      // userObject could be a Model1 or a Model2... or Model3, Model4, etc.
      let userGroup = 'Admin';
      let userPrototype = Object.getPrototypeOf(userObject);

      if (userPrototype === Admin.prototype) {
         userGroup = 'Admin';
      } else if (userPrototype === User.prototype) {
         userGroup = 'User';
      }

      let sessionConstructor = new SessionConstructor(
         userObject.id,
         userGroup,
         userObject
      );
      done(null, sessionConstructor);
   });

   passport.deserializeUser(function (sessionConstructor, done) {
      if (sessionConstructor.userGroup == 'Admin') {
         Admin.findOne({
               _id: sessionConstructor.userId,
            },
            '-localStrategy.password',
            function (err, user) {
               // When using string syntax, prefixing a path with - will flag that path as excluded.
               done(err, user);
            }
         );
      } else if (sessionConstructor.userGroup == 'User') {
         User.findOne({
               _id: sessionConstructor.userId,
            },
            '-localStrategy.password',
            function (err, user) {
               // When using string syntax, prefixing a path with - will flag that path as excluded.
               done(err, user);
            }
         );
      }
   });
};