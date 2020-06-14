const express = require('express');
const passport = require('passport');
const Admin = require('../models/admin');
const {
   ensureAuthenticated,
   forwardAuthentication
} = require('../config/auth');
const {
   getAdminForget,
   getAdminLogin,
} = require('../controllers/viewController');

const {
   getAddUser,
   getAdminDashboard,
   getAdminAllUsers
} = require('../controllers/adminController');
const {
   createUser
} = require('../controllers/userController');

const {
   validation
} = require('../controllers/validationController');

const {
   createUserValidation
} = require('../utils/validation');

const router = express.Router();

router.get('/login', forwardAuthentication, getAdminLogin);

router.get('/forgot-password', forwardAuthentication, getAdminForget);

router.get('/dashboard', ensureAuthenticated, getAdminDashboard);

router.get('/users', ensureAuthenticated, getAdminAllUsers);

router.get('/add-users', ensureAuthenticated, getAddUser)

router.post('/login', (req, res, next) => {
   passport.authenticate('local-Admin', {
      successRedirect: '/admin/dashboard',
      failureRedirect: '/admin/login',
      failureFlash: true,
   })(req, res, next);
});

router.post('/add-users', ensureAuthenticated, validation(createUserValidation, 'admin/add-user'), createUser);

router.get('/signup', async (req, res) => {
   const newAdmin = new Admin({
      email: 'admin@admin.com',
      password: 'admin123'
   });

   await newAdmin.save();

   if (newAdmin) {
      res.status(201).json({
         message: 'created'
      });
   }
});


module.exports = router;