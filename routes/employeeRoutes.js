const express = require('express');
const {
   attendence,
   check,
   getByDate,
   getCurrentDateAttendence
} = require('../controllers/employeeController');
const {
   ensureAuthenticatedUser
} = require('../config/auth');

const router = express.Router();

router.get('/:id/attendence', ensureAuthenticatedUser, check, attendence);

router.get('/attendenceByDate', ensureAuthenticatedUser, getByDate);

router.get('/currentDate', ensureAuthenticatedUser, getCurrentDateAttendence);

module.exports = router;