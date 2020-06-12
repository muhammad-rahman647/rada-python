const express = require('express');
const passport = require('passport');
// const User = require('../models/user');
const {
   ensureAuthenticatedUser,
   forwardAuthenticationUser
} = require('../config/auth');

const viewController = require('../controllers/viewController');

const router = express.Router();

router.get('/login', forwardAuthenticationUser, viewController.getUserLogin);

router.get('/forgot-password', forwardAuthenticationUser, viewController.getUserForget);

router.get('/reset-password', forwardAuthenticationUser, viewController.getUserReset);

router.get('/dashboard', ensureAuthenticatedUser, viewController.getUserDashboard);

router.post('/login', (req, res, next) => {
   passport.authenticate('local-user', {
      successRedirect: '/user/dashboard',
      failureRedirect: '/user/login',
      failureFlash: true,
   })(req, res, next);
});

// router.get('/signup', ensureAuthenticated, async (req, res) => {
//    const newUser = new User({
//       email: 'admin@admin.com',
//       password: 'admin123',
//       companyName: 'Sample company',
//       _admin: req.user._id
//    });

//    await newUser.save();

//    if (newUser) {
//       res.status(201).json({
//          message: 'created'
//       });
//    }
// })

module.exports = router;