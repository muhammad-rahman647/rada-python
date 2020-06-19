const express = require('express');
const {
   attendence,
   check
} = require('../controllers/employeeController');

const router = express.Router();

router.post('/:id/attendence', check, attendence);

module.exports = router;