const express = require('express');
const maincontroler = require('../controlers/maincontroler');
const catalogcontroler = require('../controlers/catalogcontroler');
const router = express.Router();

//**PROFILE SYSTEM**

//Main dashboard
router.get('/dashboard', catalogcontroler.dashboard);
//Edit profile routes
router.get('/edit', maincontroler.edit);
router.post('/edit', maincontroler.edit_post);
//delete account route
router.post('/delete', maincontroler.remove);
router.get('/delete', maincontroler.remove_page);
//logout
router.get('/logout', maincontroler.logout);
//change profile picture
router.post('/upload_profile', maincontroler.upload_image);
//change password
router.get('/edit_password', maincontroler.edit_password_page);
router.post('/edit_password', maincontroler.edit_password);

//**CATALOG SYSTEM**

//Create a catalog 
router.get('/catalog/create', catalogcontroler.create_catalog);
router.post('/catalog/create', catalogcontroler.create_catalog_post);
//Create a product
router.get('/product/create', catalogcontroler.create_product);
router.post('/product/create', catalogcontroler.create_product_post)
//upload model
router.get('/model/upload_model', catalogcontroler.upload_model);
router.post('/model/upload_model', catalogcontroler.upload_model_post);
//Model dashboard
router.get('/model/dashboard/:page/:filter', catalogcontroler.model_dashboard);
//Product dashboard
router.get('/product/dashboard/:page/:filter', catalogcontroler.product_dashboard);
//Catalog dashboard
router.get('/catalog/dashboard/:page/:filter', catalogcontroler.catalog_dashboard);
//delete a catalog 
router.get('/catalog/delete/:id', catalogcontroler.delete_catalog);
//delete a product
router.get('/product/delete/:id', catalogcontroler.delete_product);
//delete a model
router.get('/model/delete/:id', catalogcontroler.delete_model);
module.exports = router;
