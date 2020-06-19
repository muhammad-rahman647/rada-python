const express = require('express');

const deviceController = require('../controllers/deviceController');
const {
   uploadOne
} = require('../controllers/imageController');

const router = express.Router();

router.post('/', uploadOne, deviceController.receiveRequest);

module.exports = router;