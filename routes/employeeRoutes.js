const express = require('express');
const {
   attendence,
   check
} = require('../controllers/employeeController');
const {
   ensureAuthenticatedUser
} = require('../config/auth');

const router = express.Router();

router.get('/:id/attendence', ensureAuthenticatedUser, check, attendence);

module.exports = router;