const general_func = require('../functions/general_functions'); //retrieves general functions 
const multer = require('multer');
const fs = require('fs').promises;
const path = require('path');

//Constants for validation
const NAME_LENGTH_MIN = 3;
const NAME_LENGTH_MAX = 50;

//function to create a catalog
const create_catalog = (req, res) => {
    res.render('catalog_system/create', { title: 'Create Catalog' });
}
//redirects to creat product page
const create_product = async (req, res) => {
    let errors = req.session.errors;
    req.session.errors = null;
    let models = await general_func.retrieve_query(`SELECT NAME, GLB_ID FROM models INNER JOIN users_models ON
         models.ID = users_models.MODEL_ID WHERE users_models.USER_ID = ?`, [req.session.ID]);
    await req.session.save();
    res.render('catalog_system/create_product', { title: 'Create Product', errors: errors, models: models });
}
//function to upload a model
const upload_model = async (req, res) => {
    let errors = req.session.errors;
    req.session.errors = null;
    await req.session.save();
    res.render('catalog_system/upload_model', { title: 'Upload Model', errors: errors });
}
//function to handle the dashboard
const model_dashboard = (req, res) => {
    res.render('catalog_system/model_dashboard', { title: "Models" });
}
//function to handle the model upload
const upload_model_post = async (req, res) => {
    let error_block = [];
    general_func.glb_upload(req, res, async function (err) {
        let text = (req.body.name || "").trim()
        if (text.length < NAME_LENGTH_MIN || text.length > NAME_LENGTH_MAX) {
            error_block.push("name");
        }
        if (err instanceof multer.MulterError) {
            if (err.code == "LIMIT_FILE_SIZE") {
                error_block.push("file_size");
            }
        }
        else if (!req.file) {
            error_block.push("empty_file");
        }
        if (error_block.length > 0) {
            await fs.unlink(path.join(__dirname, '../GLB_FILES', req.file.filename))
            req.session.errors = null;
            req.session.errors = error_block;
            res.redirect('/model/upload_model');
            await req.session.save();
        }
        else {
            try {
                let GLB_ID = req.file.filename;
                await general_func.insert_query(`INSERT INTO models (NAME, GLB_ID) VALUES(?,?)`, [text, GLB_ID]);
                let GLB = await general_func.retrieve_query(`SELECT ID FROM models WHERE GLB_ID = ?`, [GLB_ID]);
                await general_func.insert_query(`INSERT INTO users_models (USER_ID, MODEL_ID) VALUES(?,?)`, [req.session.ID, GLB[0].ID]);
            }
            catch (err) {
                console.log(err);
            }
            res.redirect('/model/dashboard');
        }
    });
};

module.exports = { create_catalog, create_product, upload_model, upload_model_post, model_dashboard };