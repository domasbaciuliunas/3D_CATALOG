const express = require('express');
const maincontroler = require('../controlers/maincontroler');
const catalogcontroler = require('../controlers/catalogcontroler');
const multer  = require('multer')
const router = express.Router();

//Login route
router.get('/', maincontroler.login);
router.post('/', maincontroler.login_post);
//Registration routes
router.get('/register', maincontroler.register);
router.post('/register', maincontroler.register_post);
//Load catalog
router.get('/catalog/created/:id', catalogcontroler.load_catalog);

module.exports = router;