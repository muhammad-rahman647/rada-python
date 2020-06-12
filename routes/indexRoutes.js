const express = require('express');
const {
   forwardAuthenticationIndex
} = require('../config/auth');

const router = express.Router();

router.get('/', forwardAuthenticationIndex, (req, res) => res.render('index', {
   pageTitle: 'Welcome Page',
   bg_color: 'bg-gradient-primary'
}));

router.get('/logOut', (req, res) => {
   req.logOut();
   res.redirect('/');
});

module.exports = router;