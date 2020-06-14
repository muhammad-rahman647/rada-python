const express = require('express');
const passport = require('passport');
// const User = require('../models/user');
const {
   ensureAuthenticatedUser,
   forwardAuthenticationUser
} = require('../config/auth');

const viewController = require('../controllers/viewController');
const {
   getUserDashboard,
   getAddEmployeeUser,
   createEmployee,
   forgotPassword,
   getUserReset,
   resetPassword,
   uploadOne,
   verifyImages,
   verifyName,
   getUserAllEmployees
} = require('../controllers/userController');

const {
   validation1
} = require('../controllers/validationController');

const {
   resetPasswordValidation
} = require('../utils/validation');

const router = express.Router();

router.get('/login', forwardAuthenticationUser, viewController.getUserLogin);

router.post('/login', (req, res, next) => {
   passport.authenticate('local-user', {
      successRedirect: '/user/dashboard',
      failureRedirect: '/user/login',
      failureFlash: true,
   })(req, res, next);
});

router.get('/dashboard', ensureAuthenticatedUser, getUserDashboard);

router.get('/add-Employee', ensureAuthenticatedUser, getAddEmployeeUser);

router.get('/employees', ensureAuthenticatedUser, getUserAllEmployees);

router.get('/forgotPassword', forwardAuthenticationUser, viewController.getUserForget);

router.get('/resetPassword/:token', forwardAuthenticationUser, getUserReset);

router.post('/addEmployee', ensureAuthenticatedUser, uploadOne, verifyName, verifyImages, createEmployee);

router.post('/forgotPassword', forwardAuthenticationUser, forgotPassword);

router.post('/newPassword', forwardAuthenticationUser, validation1(resetPasswordValidation, 'user/reset-password'), resetPassword);

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