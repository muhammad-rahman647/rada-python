module.exports = {
   ensureAuthenticated: function (req, res, next) {
      if (req.isAuthenticated() && req.session.passport.user.userGroup === 'Admin') {
         return next();
      } else if (req.isAuthenticated() && req.session.passport.user.userGroup === 'User') {
         res.redirect('/user/dashboard');
      } else {
         req.flash('error_msg', 'Please log in to view this resource');
         res.redirect('/admin/login');
      }
   },
   forwardAuthentication: function (req, res, next) {
      if (!req.isAuthenticated()) {
         return next();
      } else if (req.isAuthenticated() && req.session.passport.user.userGroup === 'User') {
         res.redirect('/user/dashboard');
      } else {
         res.redirect('/admin/dashboard');
      }
   },
   ensureAuthenticatedUser: function (req, res, next) {
      if (req.isAuthenticated() && req.session.passport.user.userGroup === 'User') {
         return next();
      } else if (req.isAuthenticated() && req.session.passport.user.userGroup === 'Admin') {
         res.redirect('/admin/dashboard');
      } else {
         req.flash('error_msg', 'Please log in to view this resource');
         res.redirect('/user/login');
      }
   },
   forwardAuthenticationUser: function (req, res, next) {
      if (!req.isAuthenticated()) {
         return next();
      } else if (req.isAuthenticated() && req.session.passport.user.userGroup === 'Admin') {
         res.redirect('/admin/dashboard');
      } else {
         res.redirect('/user/dashboard');
      }
   },
   forwardAuthenticationIndex: function (req, res, next) {
      if (!req.isAuthenticated()) {
         return next();
      } else if (req.isAuthenticated() && req.session.passport.user.userGroup === 'Admin') {
         res.redirect('/admin/dashboard');
      } else if (req.isAuthenticated() && req.session.passport.user.userGroup === 'User') {
         res.redirect('/user/dashboard');
      } else {
         res.redirect('/');
      }
   }
};