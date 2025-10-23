const bcrypt = require('bcryptjs');
const general_func = require('../functions/general_functions'); //retrieves general functions 
const fs = require('fs').promises;
const path = require('path');
const crypto = require('node:crypto');
var validator = require('validator');
const multer = require('multer');
const sharp = require('sharp');

//constants for the validation of the data
const PASSWORD_LENGTH_MIN = 8;
const PASSWORD_LENGTH_MAX = 64;

const NAME_LENGTH_MIN = 3;
const NAME_LENGTH_MAX = 50;

const MIN_EMAIL_LENGTH = 3;
const MAX_EMAIL_LENGTH = 100;

//latin rege for name validation
let regex = /\p{sc=Latin}/u;

//async function to retrieve the countries
async function get_countries() {
    let countries = await general_func.retrieve_query("SELECT COUNTRY, COUNTRY_ID FROM countries");
    return countries
}
//function for data validation, req has all the bindings, verify_type specifies validation type
async function validation_closure(req, verify_type) {
    let data_block = {
        //short circuit evaluation to avoid null values
        name: (req.body.name || "").trim(),
        surname: (req.body.surname || "").trim(),
        password: (req.body.password || "").trim(),
        email: (req.body.email || "").trim(),
        birthday: (req.body.bday || "").trim(),
        country: (req.body.countries || "").trim()
    }
    let error_block = [];
    let results = await general_func.retrieve_query(`SELECT EMAIL FROM users WHERE EMAIL = ?`, [data_block.email]);
    let ID = await general_func.retrieve_query(`SELECT ID FROM users WHERE EMAIL = ?`, [data_block.email]);
    if (verify_type == "login" || verify_type == "large_form" || verify_type == "large_form_update") {
        if (data_block.email === "" || !validator.isEmail(data_block.email) ||
            data_block.email.length > MAX_EMAIL_LENGTH || data_block.email.length < MIN_EMAIL_LENGTH) {
            error_block.push("email_inv");
        }
    }
    if (verify_type == "login" || verify_type == "large_form") {
        if (data_block.password === "" || data_block.password.length > PASSWORD_LENGTH_MAX
            || data_block.password.length < PASSWORD_LENGTH_MIN) {
            error_block.push("password");
        }
    }
    if (verify_type == "large_form") {
        data_block.password = await bcrypt.hash(req.body.password.trim(), 8);
    }
    if (verify_type == "large_form" || verify_type == "large_form_update") {
        if (results.length > 0 && req.session.ID !== ID[0]["ID"]) {
            error_block.push("email_ex");
        }
        if (data_block.name === "" || !regex.test(data_block.name)
            || data_block.name.length > NAME_LENGTH_MAX || data_block.name.length < NAME_LENGTH_MIN) {
            error_block.push("name");
        }
        if (data_block.surname === "" || !regex.test(data_block.surname) ||
            data_block.surname.length > NAME_LENGTH_MAX || data_block.surname.length < NAME_LENGTH_MIN) {
            error_block.push("surname");
        }
        let date = new Date(data_block.birthday);
        let today = new Date();
        if (data_block.birthday === "" || !validator.isDate(data_block.birthday) || date > today) {
            error_block.push("birthday");
        }
        if (data_block.country === "" || !validator.isNumeric(data_block.country)) {
            error_block.push("country");
        }
    }
    //returns the outcome
    return { "error_block": error_block, "data_block": data_block };
}
async function validate_password_reset(req) {
    let data_block = {
        //short circuit evaluation to avoid null values
        password: (req.body.password || "").trim(),
        password2: (req.body.password2 || "").trim(),
    }
    let error_block = [];
    if (data_block.password === "" || data_block.password.length > PASSWORD_LENGTH_MAX
        || data_block.password.length < PASSWORD_LENGTH_MIN) {
        error_block.push("password_1_inv");
    }
    if (data_block.password2 === "" || data_block.password2.length > PASSWORD_LENGTH_MAX
        || data_block.password2.length < PASSWORD_LENGTH_MIN) {
        error_block.push("password_2_inv");
    }
    data_block.password2 = await bcrypt.hash(req.body.password2.trim(), 8);
    let results = await general_func.retrieve_query(`SELECT PASSWORD FROM users WHERE ID = ?`, [req.session.ID]);
    if (!await bcrypt.compare(data_block.password, results[0].PASSWORD)) {
        error_block.push("no_match");
    }
    return { "error_block": error_block, "data_block": data_block };
}
//image upload
async function upload_image(req, res) {
    let file_error_block = [];
    general_func.upload(req, res, async (err) => {
        if (req.fileValidationError) {
            file_error_block.push(req.fileValidationError);
            req.session.errors = file_error_block;
            return res.status(400).redirect('/edit');
        }
        if (err instanceof multer.MulterError) {
            file_error_block.push("large");
            req.session.errors = file_error_block;
            return res.status(500).redirect('/edit');
        }
        if (err) {
            return res.status(500).send(err.message);
        }
        try {
            let ID = req.session.ID;
            let new_name = await general_func.retrieve_query("SELECT IMAGE_ID FROM users WHERE ID = ?", [ID]);
            let old_name = req.file.filename;
            //resize the image to 200x200 and save it with the new name
            await sharp(path.join(__dirname, '../images/active_profiles/', old_name)).resize(300, 300).toFile(path.join(__dirname, '../images/active_profiles/', new_name[0]["IMAGE_ID"]));
            //create a micro icon
            await sharp(path.join(__dirname, '../images/active_profiles/', old_name)).resize(80, 80).toFile(path.join(__dirname, '../images/active_profiles/micro_icons', new_name[0]["IMAGE_ID"]));
            //delete the old image
            await fs.unlink(path.join(__dirname, '../images/active_profiles/', old_name)) //
            //rename the image to the one in the database
            res.redirect('/edit');
        } catch (err) {
            file_error_block.push("INV_IMG");
            req.session.errors = file_error_block;
            return res.status(400).redirect('/edit');
        }
    });
}
//function to render the login page
const login = async (req, res) => {
    if (req.session.authorized) { res.redirect('/dashboard'); }
    else {
        let errors = req.session.errors;
        req.session.errors = null;
        res.render('profile_system/index', { title: "Login", errors: errors });
    }
}
//function to verify the login
const login_post = async (req, res, next) => {
    if (req.session.authorized) { next(); return; }
    try {
        let { error_block, data_block } = await validation_closure(req, "login");
        let results = await general_func.retrieve_query(`SELECT PASSWORD FROM users WHERE EMAIL = ?`, [data_block.email]);
        if (results.length === 0) {
            error_block.push("bad_login");
        }
        else if (results.length > 0) {
            if (await bcrypt.compare(data_block.password, results[0].PASSWORD)) {
                req.session.authorized = true;
                await req.session.save();
                res.redirect('/dashboard');
            }
            else {
                error_block.push("bad_login");
            }
        }
        if (error_block.length > 0) {
            req.session.errors = error_block;
            await req.session.save();
            res.redirect('/');
        }
        else {
            //sets and saves the id of the user
            let ID = await general_func.retrieve_query(`SELECT ID FROM users WHERE EMAIL = ?`, [data_block.email]);
            req.session.ID = ID[0]["ID"];
            await req.session.save();
        }
    } catch (err) {
        console.error(err);
    }
}
//function to render the register page
const register = async (req, res, next) => {
    //middleware substack
    let countries = await get_countries();
    if (req.session.authorized) { next(); return; };
    let errors = req.session.errors;
    req.session.errors = null;
    res.render('profile_system/register', { title: "Register", countries: countries, errors: errors });
}
const register_post = async (req, res, next) => {
    //middleware substack
    if (req.session.authorized) { next(); return; }
    try {
        //calls for the validation of data
        let { error_block, data_block } = await validation_closure(req, "large_form");
        if (error_block.length > 0) {
            req.session.errors = error_block;
            await req.session.save();
            res.redirect('/register');
        }
        else {
            //generate a unique profile image
            let img_name = await general_func.generate_unique_ID((IMAGE_ID) => general_func.retrieve_query(`SELECT ID FROM users WHERE IMAGE_ID = ?`, [IMAGE_ID]),
                () => crypto.randomBytes(64).toString('hex') + '.jpg');
            await general_func.insert_query(`INSERT INTO users (NAME, SURNAME, PASSWORD, EMAIL, BIRTHDAY, COUNTRY_ID, IMAGE_ID) VALUES(?,?,?,?,?,?,?)`,
                [data_block.name, data_block.surname, data_block.password, data_block.email, data_block.birthday, data_block.country, img_name]);
            await sharp(path.join(__dirname, '../images/profile.jpg')).resize(300, 300).toFile(path.join(__dirname, '../images/active_profiles/', img_name));
            await sharp(path.join(__dirname, '../images/profile.jpg')).resize(80, 80).toFile(path.join(__dirname, '../images/active_profiles/micro_icons', img_name));
            res.redirect('/');
        }
    } catch (err) {
        console.error(err);
    }
}
//function to edit profile
const edit = async (req, res) => {
    let countries = await get_countries()
    let results = await general_func.retrieve_query(`SELECT * FROM users WHERE users.ID = ?`, [req.session.ID]);
    results[0]["BIRTHDAY"] = general_func.formatDate(results[0]["BIRTHDAY"]); //format from MARIADB date to HTML5 calendar
    results[0]["IMAGE"] = path.join('../images/active_profiles', results[0]["IMAGE_ID"]);
    let errors = req.session.errors;
    req.session.errors = null;
    await req.session.save();
    res.render('profile_system/edit_profile', { title: "Edit profile", countries: countries, user_data: results[0], errors: errors });
}
const edit_post = async (req, res) => {
    try {
        //calls the validation for the data
        let { error_block, data_block } = await validation_closure(req, "large_form_update");
        if (error_block.length > 0) {
            let results = await general_func.retrieve_query(`SELECT * FROM users WHERE users.ID = ?`, [req.session.ID]);
            //format from MARIADB date to HTML5 calendar
            results[0]["BIRTHDAY"] = general_func.formatDate(results[0]["BIRTHDAY"]);
            req.session.errors = error_block;
            await req.session.save();
            res.redirect('/edit');
        }
        else {
            //Update the data inside the database
            await general_func.insert_query(`UPDATE users SET NAME = ?, SURNAME = ?, EMAIL = ?, BIRTHDAY = ?, COUNTRY_ID= ? WHERE users.ID = ?`,
                [data_block.name, data_block.surname, data_block.email, data_block.birthday, data_block.country, req.session.ID])
            //save the session variable
            await req.session.save();
            res.redirect('/dashboard');
        }
    }
    catch (err) {
        console.log(err);
    }
}
//function to render the edit password page
const edit_password_page = async (req, res) => {
    let errors = req.session.errors;
    req.session.errors = null;
    await req.session.save();
    res.render('profile_system/edit_password', { title: "Edit password", errors: errors });
}
//function to reset the password
const edit_password = async (req, res) => {
    try {
        let { error_block, data_block } = await validate_password_reset(req);
        if (error_block.length > 0) {
            req.session.errors = error_block;
            await req.session.save();
            res.redirect('/edit_password');
        }
        else {
            await general_func.insert_query(`UPDATE users SET PASSWORD = ? WHERE users.ID = ?`,
                [data_block.password2, req.session.ID]);
            req.session.errors = null;
            await req.session.save();
            res.redirect('/dashboard');
        }
    }
    catch (err) {
        console.log(err)
    }
}
//redirect to account deletion page
const remove_page = async (req, res) => {
    let errors = req.session.errors;
    req.session.errors = null;
    await req.session.save();
    res.render('profile_system/delete_page', { title: "Delete your account", errors: errors })
}
//function to the delete the data inside the database
const remove = async (req, res) => {
    try {
        let error_block = [];
        let data_block = {
            "email": (req.body.email || "").trim(),
        }
        let email_check = await general_func.retrieve_query(`SELECT EMAIL FROM users WHERE users.ID = ?`, [req.session.ID]);
        if (email_check[0]["EMAIL"] !== data_block.email) {
            error_block.push("email_inv");
        }
        if (error_block.length > 0) {
            req.session.errors = error_block;
            await req.session.save();
            res.redirect('/delete');
        }
        else {
            //delete all catalogs
            let catalogs = await general_func.retrieve_query(`SELECT CATALOG_ID FROM user_catalogs WHERE USER_ID = ?`, [req.session.ID]);
            for (let catalog of catalogs) {
                await general_func.insert_query(`DELETE FROM user_catalogs WHERE CATALOG_ID = ?`, [catalog.CATALOG_ID]);
                await general_func.insert_query(`DELETE FROM catalog_products WHERE CATALOG_ID = ?`, [catalog.CATALOG_ID]);
                await general_func.insert_query(`DELETE FROM catalogs WHERE ID = ?`, [catalog.CATALOG_ID]);
            }
            //delete all products
            let products = await general_func.retrieve_query(`SELECT PRODUCT_ID FROM user_products WHERE USER_ID = ?`, [req.session.ID]);
            for (let product of products) {
                let ambient_lights = await general_func.retrieve_query(`SELECT AL_ID FROM product_ambient_lights WHERE PRODUCT_ID = ?`, [product.PRODUCT_ID]);
                await general_func.insert_query(`DELETE FROM product_ambient_lights WHERE PRODUCT_ID = ?`, [product.PRODUCT_ID]);
                for (let al of ambient_lights) {
                    await general_func.insert_query(`DELETE FROM ambient_lights WHERE id = ?`, [al.AL_ID]);
                }
                let interest_points = await general_func.retrieve_query(`SELECT IP_ID FROM product_interest_points WHERE PRODUCT_ID = ?`, [product.PRODUCT_ID]);
                await general_func.insert_query(`DELETE FROM product_interest_points WHERE PRODUCT_ID = ?`, [product.PRODUCT_ID]);
                for (let ip of interest_points) {
                    await general_func.insert_query(`DELETE FROM interest_points WHERE id = ?`, [ip.IP_ID]);
                }
                let spotlights = await general_func.retrieve_query(`SELECT SPOTLIGHT_ID FROM product_spotlights WHERE PRODUCT_ID = ?`, [product.PRODUCT_ID]);
                await general_func.insert_query(`DELETE FROM product_spotlights WHERE PRODUCT_ID = ?`, [product.PRODUCT_ID]);
                for (let sp of spotlights) {
                    await general_func.insert_query(`DELETE FROM spotlights WHERE id = ?`, [sp.SPOTLIGHT_ID]);
                }
            }
            for (let product of products) {
                await general_func.insert_query(`DELETE FROM user_products WHERE PRODUCT_ID = ?`, [product.PRODUCT_ID]);
                await general_func.insert_query(`DELETE FROM products WHERE id = ?`, [product.PRODUCT_ID]);
            }
            //delete models 
            let models = await general_func.retrieve_query(`SELECT MODEL_ID FROM users_models WHERE USER_ID = ?`, [req.session.ID]);
            for (let model of models) {
                let GLB = await general_func.retrieve_query(`SELECT GLB_ID FROM models WHERE ID = ?`, [model.MODEL_ID]);
                await fs.unlink(path.join(__dirname, '../GLB_FILES', GLB[0].GLB_ID))
                await general_func.insert_query(`DELETE FROM users_models WHERE MODEL_ID = ?`, [model.MODEL_ID]);
                await general_func.insert_query(`DELETE FROM models WHERE ID = ?`, [model.MODEL_ID]);
            }

            //delete the profile image
            let ID = req.session.ID;
            let image_id = await general_func.retrieve_query("SELECT IMAGE_ID FROM users WHERE ID = ?", [ID]);
            await fs.unlink(path.join(__dirname, '../images/active_profiles/', image_id[0]["IMAGE_ID"]));
            await fs.unlink(path.join(__dirname, '../images/active_profiles/micro_icons', image_id[0]["IMAGE_ID"]));
            //delete the profile
            await general_func.retrieve_query(`DELETE FROM users WHERE users.ID = ?`, [req.session.ID]);
            //delete the session
            req.session.destroy();
            res.redirect('/');
        }
    }
    catch (err) {
        console.log(err);
    }
}
//logout
const logout = (req, res) => {
    req.session.destroy();
    res.redirect('/');
}
module.exports = { login, register, register_post, login_post, edit, edit_post, remove_page, remove, logout, upload_image, edit_password, edit_password_page };