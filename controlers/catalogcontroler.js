const general_func = require('../functions/general_functions'); //retrieves general functions 
const multer = require('multer');
const fs = require('fs').promises;
const path = require('path');
const sanitizeHtml = require('sanitize-html');

//Constants for validation
const NAME_LENGTH_MIN = 3;
const NAME_LENGTH_MAX = 50;

const DESCRIPTION_LENGTH_MAX = 1000;
const DESCRIPTION_LENGTH_MIN = 3;

const TITLE_LENGTH_MIN = 1;
const TITLE_LENGTH_MAX = 50;

const MAX_TWEAKPANES = 15;

//Pagination constants

const MODELS_PAGE_ITEMS = 9;
const PRODUCT_PAGE_ITEMS = 9;
const CATALOG_PAGE_ITEMS = 9;

const DASHBOARD_LIMIT = 20;

//image constants

const MIN_CATALOG_IMG = 1;
const MAX_CATALOG_IMG = 9;

const MIN_MODEL_IMG = 1;
const MAX_MODEL_IMG = 8;

const MIN_PRODUCT_IMG = 1;
const MAX_PRODUCT_IMG = 6;

//closure function for validation
async function validation_closure(req) {
    let data_block = {
        name: (req.body.name || "").trim(),
        description: (req.body.description || "").trim(),
        model: (req.body.models || "").trim(),
        background: (req.body.background || "").trim(),
        scale: (req.body.scale_form || "").trim(),
        arrow_color: (req.body.arrow_color || "").trim(),
        ip_color: (req.body.ip_color || "").trim(),
        menu_color: (req.body.menu_color || "").trim(),
        original_scale: (req.body.original_scale || "").trim(),
        title_color: (req.body.title_color || "").trim()
    }
    let error_block = [];
    if (data_block.name === "" || data_block.name.length > TITLE_LENGTH_MAX || data_block.name.length < TITLE_LENGTH_MIN) {
        error_block.push("name");
    }

    if (data_block.description === "" || data_block.description.length > DESCRIPTION_LENGTH_MAX ||
        data_block.description.length < DESCRIPTION_LENGTH_MIN) {
        error_block.push("description");
    }
    if (data_block.model === "") {
        error_block.push("model");
    }
    if (isNaN(Number(data_block.background)) || data_block.background === "") {
        error_block.push("background");
    }
    if (isNaN(Number(data_block.scale)) || Number(data_block.scale) > 20 || Number(data_block.scale) < 1) {
        error_block.push("scale");
    }
    else {
        data_block.scale = Math.round((Number(data_block.scale) + Number.EPSILON) * 1000) / 1000;
    }
    if (isNaN(Number(data_block.original_scale))) {
        error_block.push("original_scale");
    }
    if (req.body.price) {
        data_block.price = req.body.price;
        if (isNaN(Number(data_block.price)) || Number(data_block.price) < 0) {
            error_block.push("price");
        }
    }
    //count the tweakpanes
    let ambient = Array.isArray(req.body.ambient) ? req.body.ambient.length : 1;
    let interest_point = Array.isArray(req.body.interest_point) ? req.body.interest_point.length : 1;
    let spotlight = Array.isArray(req.body.spotlight) ? req.body.spotlight.length : 1;

    let calculation = ambient + interest_point + spotlight;
    if (calculation > MAX_TWEAKPANES) {
        error_block.push("tweakpanes");
    }

    //returns the outcome
    return { "error_block": error_block, "data_block": data_block };
}

let validation_closure_2 = async function (req) {
    let data_block = {
        catalog_name: (req.body.catalog_name || "").trim(),
        product_input: req.body.product_input || '[]',
        title: (req.body.title || "").trim()
    }
    let error_block = [];
    if (data_block.catalog_name === "" || data_block.catalog_name.length > NAME_LENGTH_MAX || data_block.catalog_name.length < NAME_LENGTH_MIN) {
        error_block.push("name");
    };

    //validate product input
    data_block.product_input = JSON.parse(data_block.product_input);
    if (!Array.isArray(data_block.product_input)) {
        error_block.push("products");
    } else {
        if (data_block.product_input.length === 0 || data_block.product_input.length > MAX_TWEAKPANES) {
            error_block.push("products");
        } else {
            for (let product_id of data_block.product_input) {
                if (isNaN(Number(product_id))) {
                    error_block.push("products");
                    break;
                }
            }
        }
    }
    data_block.title = JSON.parse(data_block.title);
    data_block.title.antraste = (data_block.title.antraste || "").trim();
    if (data_block.title.antraste === "" || data_block.title.antraste.length > NAME_LENGTH_MAX || data_block.title.antraste.length < NAME_LENGTH_MIN) {
        error_block.push("title");
    }
    data_block.title.r = Math.round((Number(data_block.title.r) + Number.EPSILON) * 1000) / 1000;
    data_block.title.g = Math.round((Number(data_block.title.g) + Number.EPSILON) * 1000) / 1000;
    data_block.title.b = Math.round((Number(data_block.title.b) + Number.EPSILON) * 1000) / 1000;

    return { "error_block": error_block, "data_block": data_block };
}

//function to create a catalog
const create_catalog = async (req, res) => {
    //retrieves the products, models, cubemaps, ambient lights and interest points from the database
    let products = await general_func.retrieve_query(`SELECT products.id, products.ip_color, products.arrows, products.menu, products.model_id, products.cubemap_id, products.name, products.description, products.price, products.item_scale, products.original_scale FROM products INNER JOIN 
        user_products ON user_products.PRODUCT_ID = products.ID WHERE user_products.USER_ID = ?`, [req.session.ID]);
    let models = {};
    let cubemaps = {};
    let ambient_lights = {};
    let interest_points = {};
    let spotlights = {};
    let products_keyed = {};
    for (let product of products) {
        models[product.id] = await general_func.retrieve_query(`SELECT GLB_ID FROM models WHERE ID = ?`, [product.model_id]);
        cubemaps[product.id] = await general_func.retrieve_query('SELECT cubemap_folder FROM cubemaps WHERE id = ?', [product.cubemap_id]);
        ambient_lights[product.id] = await general_func.retrieve_query(`SELECT ambient_lights.intensity, ambient_lights.RGB FROM ambient_lights INNER JOIN product_ambient_lights ON
         product_ambient_lights.AL_ID = ambient_lights.id WHERE product_ambient_lights.PRODUCT_ID = ?`, [product.id]);
        interest_points[product.id] = await general_func.retrieve_query(`SELECT interest_points.XYZ, interest_points.camera_XYZ, interest_points.text, interest_points.header FROM interest_points INNER JOIN product_interest_points ON
         product_interest_points.IP_ID = interest_points.id WHERE product_interest_points.PRODUCT_ID = ?`, [product.id]);
        spotlights[product.id] = await general_func.retrieve_query(`SELECT spotlights.intensity, spotlights.distance, spotlights.RGB, spotlights.XYZ, spotlights.penumbra, spotlights.angle FROM spotlights INNER JOIN product_spotlights ON
         product_spotlights.SPOTLIGHT_ID = spotlights.id WHERE product_spotlights.PRODUCT_ID = ?`, [product.id]);
        products_keyed[product.id] = product;
    }
    let errors = req.session.errors;
    req.session.errors = null;
    res.render('catalog_system/create_catalog', { title: 'Create Catalog', products: products, models: models, cubemaps: cubemaps, ambient_lights: ambient_lights, interest_points: interest_points, spotlights: spotlights, keyed_products: products_keyed, errors: errors });
}
//function to save the catalog to the database
const create_catalog_post = async (req, res) => {
    try {
        let { error_block, data_block } = await validation_closure_2(req);
        if (error_block.length > 0) {
            req.session.errors = error_block;
            await req.session.save();
            res.redirect('/catalog/create');
        }
        else {
            let illustration_id = Math.floor(Math.random() * (MAX_CATALOG_IMG - MIN_CATALOG_IMG) + MIN_CATALOG_IMG)

            let r = Math.round((Number(data_block.title.r) + Number.EPSILON) * 1000) / 1000;
            let g = Math.round((Number(data_block.title.g) + Number.EPSILON) * 1000) / 1000;
            let b = Math.round((Number(data_block.title.b) + Number.EPSILON) * 1000) / 1000;

            let RGB = r.toString() + ", " + g.toString() + ", " + b.toString();

            let dark;
            if (data_block.title.juodos_raides == 'true') { dark = "black"; }
            else { dark = "white"; }

            let id = await general_func.insert_query_get_ID(`INSERT INTO catalogs (CATALOG_NAME, RGB, HEADER, DARK_LETTERS, ILLUSTRATION) VALUES(?,?,?,?,?)`, [data_block.catalog_name, RGB, data_block.title.antraste, dark, illustration_id]);
            await general_func.insert_query(`INSERT INTO user_catalogs (USER_ID, CATALOG_ID) VALUES(?,?)`, [req.session.ID, id]);
            for (let product_id of data_block.product_input) {
                await general_func.insert_query(`INSERT INTO catalog_products (CATALOG_ID, PRODUCT_ID) VALUES(?,?)`, [id, Number(product_id)]);
            }

            res.redirect('/catalog/dashboard/0/none');
        }
    }
    catch (err) {
        console.log(err);
    }
}
const edit_catalog = async (req, res) => {
    let id_check = await general_func.retrieve_query(`SELECT catalogs.id FROM catalogs INNER JOIN user_catalogs ON 
        catalogs.id = user_catalogs.CATALOG_ID WHERE user_catalogs.USER_ID = ? AND catalogs.id = ?`, [req.session.ID, Number(req.params.id)]);
    if (id_check.length === 0) return res.redirect('/catalog/dashboard/0/none');

    //retrieves the products, models, cubemaps, ambient lights and interest points from the database
    let products = await general_func.retrieve_query(`SELECT products.id, products.ip_color, products.arrows, products.menu, products.model_id, products.cubemap_id, products.name, products.description, products.price, products.item_scale, products.original_scale FROM products INNER JOIN 
        user_products ON user_products.PRODUCT_ID = products.ID WHERE user_products.USER_ID = ?`, [req.session.ID]);
    let models = {};
    let cubemaps = {};
    let ambient_lights = {};
    let interest_points = {};
    let spotlights = {};
    let products_keyed = {};
    let selected_products = await general_func.retrieve_query(`SELECT catalog_products.PRODUCT_ID, products.name FROM catalog_products
         INNER JOIN products ON catalog_products.PRODUCT_ID = products.id WHERE catalog_products.CATALOG_ID = ?`, [Number(req.params.id)]);
    let catalog_data = await general_func.retrieve_query(`SELECT * FROM catalogs WHERE id = ?`, [Number(req.params.id)]);
    for (let product of products) {
        models[product.id] = await general_func.retrieve_query(`SELECT GLB_ID FROM models WHERE ID = ?`, [product.model_id]);
        cubemaps[product.id] = await general_func.retrieve_query('SELECT cubemap_folder FROM cubemaps WHERE id = ?', [product.cubemap_id]);
        ambient_lights[product.id] = await general_func.retrieve_query(`SELECT ambient_lights.intensity, ambient_lights.RGB FROM ambient_lights INNER JOIN product_ambient_lights ON
         product_ambient_lights.AL_ID = ambient_lights.id WHERE product_ambient_lights.PRODUCT_ID = ?`, [product.id]);
        interest_points[product.id] = await general_func.retrieve_query(`SELECT interest_points.XYZ, interest_points.camera_XYZ, interest_points.text, interest_points.header FROM interest_points INNER JOIN product_interest_points ON
         product_interest_points.IP_ID = interest_points.id WHERE product_interest_points.PRODUCT_ID = ?`, [product.id]);
        spotlights[product.id] = await general_func.retrieve_query(`SELECT spotlights.intensity, spotlights.distance, spotlights.RGB, spotlights.XYZ, spotlights.penumbra, spotlights.angle FROM spotlights INNER JOIN product_spotlights ON
         product_spotlights.SPOTLIGHT_ID = spotlights.id WHERE product_spotlights.PRODUCT_ID = ?`, [product.id]);
        products_keyed[product.id] = product;
    }
    let errors = req.session.errors;
    req.session.errors = null;
    res.render('catalog_system/edit_catalog', { title: 'Edit Catalog', products: products, models: models, cubemaps: cubemaps, ambient_lights: ambient_lights, interest_points: interest_points, spotlights: spotlights, keyed_products: products_keyed, errors: errors, selected_products: selected_products, catalog_data: catalog_data[0] });
}
const edit_catalog_post = async (req, res) => {
    let id_check = await general_func.retrieve_query(`SELECT catalogs.id FROM catalogs INNER JOIN user_catalogs ON 
        catalogs.id = user_catalogs.CATALOG_ID WHERE user_catalogs.USER_ID = ? AND catalogs.id = ?`, [req.session.ID, Number(req.params.id)]);
    if (id_check.length === 0) return res.redirect('/catalog/dashboard/0/none');
    try {
        let { error_block, data_block } = await validation_closure_2(req);
        if (error_block.length > 0) {
            req.session.errors = error_block;
            await req.session.save();
            res.redirect('/catalog/create');
        }
        else {
            let r = Math.round((Number(data_block.title.r) + Number.EPSILON) * 1000) / 1000;
            let g = Math.round((Number(data_block.title.g) + Number.EPSILON) * 1000) / 1000;
            let b = Math.round((Number(data_block.title.b) + Number.EPSILON) * 1000) / 1000;

            let RGB = r.toString() + ", " + g.toString() + ", " + b.toString();

            let dark;
            if (data_block.title.juodos_raides == 'true') { dark = "black"; }
            else { dark = "white"; }

            let id = await general_func.insert_query_get_ID(`UPDATE catalogs SET CATALOG_NAME = ?, RGB = ?, HEADER = ?, DARK_LETTERS = ? WHERE id = ?`, [data_block.catalog_name, RGB, data_block.title.antraste, dark, Number(req.params.id)]);
            await general_func.insert_query(`DELETE FROM catalog_products WHERE CATALOG_ID = ?`, [Number(req.params.id)]);
            for (let product_id of data_block.product_input) {
                await general_func.insert_query(`INSERT INTO catalog_products (CATALOG_ID, PRODUCT_ID) VALUES(?,?)`, [Number(req.params.id), Number(product_id)]);
            }

            res.redirect('/catalog/dashboard/0/none');
        }
    }
    catch (err) {
        console.log(err);
    }
}
//redirects to creat product page
const create_product = async (req, res) => {
    let models = await general_func.retrieve_query(`SELECT NAME, GLB_ID FROM models INNER JOIN users_models ON
         models.ID = users_models.MODEL_ID WHERE users_models.USER_ID = ?`, [req.session.ID]);
    let cubemap = await general_func.retrieve_query('SELECT * FROM cubemaps');
    let errors = req.session.errors;
    req.session.errors = null;
    await req.session.save();
    res.render('catalog_system/create_product', { title: 'Create Product', errors: errors, models: models, cubemaps: cubemap });
}

//function to save ambient lights to the database
async function AMBIENT_LIGHTS_INSERT(light, ID) {
    let data = JSON.parse(light);
    data.intensity = Math.round((data.intensity + Number.EPSILON) * 1000) / 1000;
    data.r = Math.floor(data.r);
    data.g = Math.floor(data.g);
    data.b = Math.floor(data.b);
    let RGB = data.r.toString() + ", " + data.g.toString() + ", " + data.b.toString();
    let _id = await general_func.insert_query_get_ID(`INSERT INTO ambient_lights (intensity, RGB) VALUES(?,?)`, [data.intensity, RGB])
    await general_func.insert_query(`INSERT INTO product_ambient_lights (PRODUCT_ID, AL_ID) VALUES(?,?)`, [ID, _id]);
}
//function to save interest_points to the database
async function INTEREST_POINT_INSERT(int_p, ID) {
    let data = JSON.parse(int_p);
    data.x = Math.round((data.x + Number.EPSILON) * 1000) / 1000;
    data.y = Math.round((data.y + Number.EPSILON) * 1000) / 1000;
    data.z = Math.round((data.z + Number.EPSILON) * 1000) / 1000;
    data.camera_x = Math.round((data.camera_x + Number.EPSILON) * 1000) / 1000;
    data.camera_y = Math.round((data.camera_y + Number.EPSILON) * 1000) / 1000;
    data.camera_z = Math.round((data.camera_z + Number.EPSILON) * 1000) / 1000;
    let XYZ = data.x.toString() + ", " + data.y.toString() + ", " + data.z.toString();
    let camera_XYZ = data.camera_x.toString() + ", " + data.camera_y.toString() + ", " + data.camera_z.toString();
    //sanitize input
    data.text = sanitizeHtml(data.text).replace(/[\\\s]/g, ' ').replace(/["]/, `''`);
    data.header = sanitizeHtml(data.header).replace(/[\\\s]/g, ' ').replace(/["]/, `''`);
    let _id = await general_func.insert_query_get_ID(`INSERT INTO interest_points (XYZ, camera_XYZ, text, header) VALUES(?,?,?,?)`, [XYZ, camera_XYZ, data.text, data.header])
    await general_func.insert_query(`INSERT INTO product_interest_points (PRODUCT_ID, IP_ID) VALUES(?,?)`, [ID, _id]);
}
//function to save spotlights to the database
async function SPOTLIGHT_INSERT(spotlight, ID) {
    let data = JSON.parse(spotlight);
    data.intensity = Math.round((data.intensity + Number.EPSILON) * 1000) / 1000;
    data.distance = Math.round((data.distance + Number.EPSILON) * 1000) / 1000;
    data.penumbra = Math.round((data.penumbra + Number.EPSILON) * 1000) / 1000;
    data.angle = Math.round((data.angle + Number.EPSILON) * 1000) / 1000;
    data.r = Math.floor(data.r);
    data.g = Math.floor(data.g);
    data.b = Math.floor(data.b);
    let RGB = data.r.toString() + ", " + data.g.toString() + ", " + data.b.toString();
    data.x = Math.round((data.x + Number.EPSILON) * 1000) / 1000;
    data.y = Math.round((data.y + Number.EPSILON) * 1000) / 1000;
    data.z = Math.round((data.z + Number.EPSILON) * 1000) / 1000;
    let XYZ = data.x.toString() + ", " + data.y.toString() + ", " + data.z.toString();
    let _id = await general_func.insert_query_get_ID(`INSERT INTO spotlights (intensity, distance, RGB, XYZ, penumbra, angle) VALUES(?,?,?,?,?,?)`,
        [data.intensity, data.distance, RGB, XYZ, data.penumbra, data.angle]);
    await general_func.insert_query(`INSERT INTO product_spotlights (PRODUCT_ID, SPOTLIGHT_ID) VALUES(?,?)`, [ID, _id]);
}
//function to write json to the database
async function write_json(data, callback, ID) {
    let data_array = data;
    if (data_array) {
        if (Array.isArray(data_array)) {
            for (let item of data_array) {
                await callback(item, ID);
            }
        }
        else {
            await callback(data_array, ID);
        }
    }
}
//route to save data to the database
const create_product_post = async (req, res) => {
    try {
        let { error_block, data_block } = await validation_closure(req);
        if (error_block.length > 0) {
            req.session.errors = error_block;
            await req.session.save();
            res.redirect('/product/create');
        }
        else {
            let illustration_id = Math.floor(Math.random() * (MAX_PRODUCT_IMG - MIN_PRODUCT_IMG) + MIN_PRODUCT_IMG)
            //assign color based on checkmark
            if (data_block.arrow_color === "") { data_block.arrow_color = "white" }
            else { data_block.arrow_color = "black" }
            if (data_block.ip_color === "") { data_block.ip_color = "white" }
            else { data_block.ip_color = "black" }
            if (data_block.menu_color === "") { data_block.menu_color = "white" }
            else { data_block.menu_color = "black" }
            if (data_block.title_color === "") { data_block.title_color = "white" }
            else { data_block.title_color = "black" }

            //sanitize input
            data_block.name = sanitizeHtml(data_block.name).replace(/[\\\s]/g, ' ').replace(/["]/, `''`);
            data_block.description = sanitizeHtml(data_block.description).replace(/[\\\s]/g, ' ').replace(/["]/, `''`);

            let model_id = await general_func.retrieve_query(`SELECT ID FROM models WHERE GLB_ID = ?`, [data_block.model]);
            let ID = await general_func.insert_query_get_ID(`INSERT INTO products (arrows, ip_color, menu, model_id, cubemap_id, name, description, price, item_scale, original_scale, title_color, ILLUSTRATION) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)`,
                [data_block.arrow_color, data_block.ip_color, data_block.menu_color, model_id[0]["ID"], Number(data_block.background), data_block.name, data_block.description, data_block.price, data_block.scale, Number(data_block.original_scale), data_block.title_color, illustration_id]);
            await write_json(req.body.ambient, AMBIENT_LIGHTS_INSERT, ID);
            await write_json(req.body.interest_point, INTEREST_POINT_INSERT, ID);
            await write_json(req.body.spotlight, SPOTLIGHT_INSERT, ID);
            general_func.insert_query(`INSERT INTO user_products (USER_ID, PRODUCT_ID) VALUES(?,?)`, [req.session.ID, ID])
            res.redirect('/product/dashboard/0/none');
        }
    }
    catch (err) {
        console.log(err);
    }
}
async function remove_old_tweakpanes(product_id) {
    let ambient_lights = await general_func.retrieve_query(`SELECT AL_ID FROM product_ambient_lights WHERE PRODUCT_ID = ?`, [product_id]);
    await general_func.insert_query(`DELETE FROM product_ambient_lights WHERE PRODUCT_ID = ?`, [product_id]);
    for (let al of ambient_lights) {
        await general_func.insert_query(`DELETE FROM ambient_lights WHERE id = ?`, [al.AL_ID]);
    }
    let interest_points = await general_func.retrieve_query(`SELECT IP_ID FROM product_interest_points WHERE PRODUCT_ID = ?`, [product_id]);
    await general_func.insert_query(`DELETE FROM product_interest_points WHERE PRODUCT_ID = ?`, [product_id]);
    for (let ip of interest_points) {
        await general_func.insert_query(`DELETE FROM interest_points WHERE id = ?`, [ip.IP_ID]);
    }
    let spotlights = await general_func.retrieve_query(`SELECT SPOTLIGHT_ID FROM product_spotlights WHERE PRODUCT_ID = ?`, [product_id]);
    await general_func.insert_query(`DELETE FROM product_spotlights WHERE PRODUCT_ID = ?`, [product_id]);
    for (let sp of spotlights) {
        await general_func.insert_query(`DELETE FROM spotlights WHERE id = ?`, [sp.SPOTLIGHT_ID]);
    }
}
//edit a catalog
const edit_product = async (req, res) => {
    let id_check = await general_func.retrieve_query(`SELECT products.id FROM products INNER JOIN user_products ON 
        products.id = user_products.PRODUCT_ID WHERE user_products.USER_ID = ? AND products.id = ?`, [req.session.ID, Number(req.params.id)]);
    if (id_check.length === 0) return res.redirect('/product/dashboard/0/none');

    let models = await general_func.retrieve_query(`SELECT models.ID, NAME, GLB_ID FROM models INNER JOIN users_models ON
         models.ID = users_models.MODEL_ID WHERE users_models.USER_ID = ?`, [req.session.ID]);
    let product = await general_func.retrieve_query(`SELECT * FROM products WHERE ID = ?`, [Number(req.params.id)]);
    let ambient_lights = await general_func.retrieve_query(`SELECT ambient_lights.intensity, ambient_lights.RGB FROM ambient_lights INNER JOIN product_ambient_lights ON
         product_ambient_lights.AL_ID = ambient_lights.id WHERE product_ambient_lights.PRODUCT_ID = ?`, [Number(req.params.id)]);
    let interest_points = await general_func.retrieve_query(`SELECT interest_points.XYZ, interest_points.camera_XYZ, interest_points.text, interest_points.header FROM interest_points INNER JOIN product_interest_points ON
         product_interest_points.IP_ID = interest_points.id WHERE product_interest_points.PRODUCT_ID = ?`, [Number(req.params.id)]);
    let spotlights = await general_func.retrieve_query(`SELECT spotlights.intensity, spotlights.distance, spotlights.RGB, spotlights.XYZ, spotlights.penumbra, spotlights.angle FROM spotlights INNER JOIN product_spotlights ON
         product_spotlights.SPOTLIGHT_ID = spotlights.id WHERE product_spotlights.PRODUCT_ID = ?`, [Number(req.params.id)]);
    let cubemap = await general_func.retrieve_query('SELECT * FROM cubemaps');
    let errors = req.session.errors;
    req.session.errors = null;
    await req.session.save();
    res.render('catalog_system/edit_product', { title: 'Edit Product', errors: errors, models: models, cubemaps: cubemap, product: product[0], ambient_lights: ambient_lights, interest_points: interest_points, spotlights: spotlights });
}
//post edit product
const edit_product_post = async (req, res) => {
    let id_check = await general_func.retrieve_query(`SELECT products.id FROM products INNER JOIN user_products ON 
        products.id = user_products.PRODUCT_ID WHERE user_products.USER_ID = ? AND products.id = ?`, [req.session.ID, Number(req.params.id)]);
    if (id_check.length === 0) return res.redirect('/product/dashboard/0/none');

    try {
        let { error_block, data_block } = await validation_closure(req);
        if (error_block.length > 0) {
            req.session.errors = error_block;
            await req.session.save();
            res.redirect('/product/edit/' + req.params.id);
        }
        else {
            //assign color based on checkmark
            if (data_block.arrow_color === "") { data_block.arrow_color = "white" }
            else { data_block.arrow_color = "black" }
            if (data_block.ip_color === "") { data_block.ip_color = "white" }
            else { data_block.ip_color = "black" }
            if (data_block.menu_color === "") { data_block.menu_color = "white" }
            else { data_block.menu_color = "black" }
            if (data_block.title_color === "") { data_block.title_color = "white" }
            else { data_block.title_color = "black" }

            //sanitize input
            data_block.name = sanitizeHtml(data_block.name).replace(/[\\\s]/g, ' ').replace(/["]/, `''`);
            data_block.description = sanitizeHtml(data_block.description).replace(/[\\\s]/g, ' ').replace(/["]/, `''`);

            let model_id = await general_func.retrieve_query(`SELECT ID FROM models WHERE GLB_ID = ?`, [data_block.model]);
            await general_func.insert_query(`UPDATE products SET arrows = ?, ip_color = ?, menu = ?, model_id = ?, cubemap_id = ?, name = ?, description = ?, price = ?, item_scale = ?, original_scale = ?, title_color = ? WHERE ID = ?`,
                [data_block.arrow_color, data_block.ip_color, data_block.menu_color, model_id[0]["ID"], Number(data_block.background), data_block.name, data_block.description, data_block.price, data_block.scale, Number(data_block.original_scale), data_block.title_color, Number(req.params.id)]);
            //delete old tweakpanes
            await remove_old_tweakpanes(Number(req.params.id));
            //insert new tweakpanes
            await write_json(req.body.ambient, AMBIENT_LIGHTS_INSERT, Number(req.params.id));
            await write_json(req.body.interest_point, INTEREST_POINT_INSERT, Number(req.params.id));
            await write_json(req.body.spotlight, SPOTLIGHT_INSERT, Number(req.params.id));
            res.redirect('/product/dashboard/0/none');
        }
    }
    catch (err) {
        console.log(err);
    }
}
//render the catalog 
const load_catalog = async (req, res) => {
    let products;

    let catalog = await general_func.retrieve_query('SELECT * FROM catalogs WHERE ID = ?', [Number(req.params.id)]);
    products = await general_func.retrieve_query(`SELECT products.id, products.ip_color, products.arrows, products.menu, products.title_color, products.model_id, products.cubemap_id, products.name, products.description, products.price, products.item_scale, products.original_scale FROM products INNER JOIN 
        catalog_products ON catalog_products.PRODUCT_ID = products.ID WHERE catalog_products.CATALOG_ID = ?`, [Number(req.params.id)]);
    for (let product of products) {
        product.model = await general_func.retrieve_query(`SELECT GLB_ID FROM models WHERE ID = ?`, [product.model_id]);
        product.cubemap = await general_func.retrieve_query('SELECT cubemap_folder FROM cubemaps WHERE id = ?', [product.cubemap_id]);
        product.ambient_lights = await general_func.retrieve_query(`SELECT ambient_lights.intensity, ambient_lights.RGB FROM ambient_lights INNER JOIN product_ambient_lights ON
         product_ambient_lights.AL_ID = ambient_lights.id WHERE product_ambient_lights.PRODUCT_ID = ?`, [product.id]);
        product.interest_points = await general_func.retrieve_query(`SELECT interest_points.XYZ, interest_points.camera_XYZ, interest_points.text, interest_points.header FROM interest_points INNER JOIN product_interest_points ON
         product_interest_points.IP_ID = interest_points.id WHERE product_interest_points.PRODUCT_ID = ?`, [product.id]);
        product.spotlights = await general_func.retrieve_query(`SELECT spotlights.intensity, spotlights.distance, spotlights.RGB, spotlights.XYZ, spotlights.penumbra, spotlights.angle FROM spotlights INNER JOIN product_spotlights ON
         product_spotlights.SPOTLIGHT_ID = spotlights.id WHERE product_spotlights.PRODUCT_ID = ?`, [product.id]);
    }
    res.render('catalog_system/view_catalog', { title: catalog.CATALOG_NAME, products: products, catalog: catalog[0] });
}
//function to upload a model
const upload_model = async (req, res) => {
    let errors = req.session.errors;
    req.session.errors = null;
    await req.session.save();
    res.render('catalog_system/upload_model', { title: 'Upload Model', errors: errors });
}
//function to handle filtering 
async function filter(req, ID_FILTER_DESC, ID_FILTER_ASC, NAME_FILTER_ASC, NAME_FILTER_DESC) {
    let ORDER_BY;
    let FILTER;

    if (req.params.filter && req.params.filter !== 'none') {
        req.session.FILTER = req.params.filter;
        ORDER_BY = req.params.filter;
    } else if (req.params.filter === 'none') {
        req.session.FILTER = null;
        ORDER_BY = 'none';
    } else if (req.session.FILTER) {
        ORDER_BY = req.session.FILTER;
    } else {
        ORDER_BY = 'none';
    }
    await req.session.save();

    switch (ORDER_BY) {
        case "newest": FILTER = ID_FILTER_DESC; break;
        case "oldest": FILTER = ID_FILTER_ASC; break;
        case "a-z": FILTER = NAME_FILTER_ASC; break;
        case "z-a": FILTER = NAME_FILTER_DESC; break;
        default: FILTER = ID_FILTER_DESC; break;
    }

    return { "ORDER_BY": ORDER_BY, "FILTER": FILTER };
}
//function to handle pagination
async function pagination(req, length) {
    length = Number(length[0]["row_count"]);
    let page_amount = Math.ceil(length / MODELS_PAGE_ITEMS);
    if (req.params.page > page_amount) { req.params.page = 0 }
    if (req.params.page < 0) { req.params.page = 0 };
    let OFFSET = req.params.page * MODELS_PAGE_ITEMS;

    return { "page_amount": page_amount, "OFFSET": OFFSET }
}
//function to handle the dashboard of models
const model_dashboard = async (req, res) => {
    let length = await general_func.retrieve_query(`SELECT count(*) row_count from models 
        INNER JOIN users_models ON models.ID  = users_models.MODEL_ID where users_models.USER_ID = ? ORDER BY models.ID`, [req.session.ID]);
    let { page_amount, OFFSET } = await pagination(req, length);
    let { ORDER_BY, FILTER } = await filter(req, "models.ID DESC", "models.ID ASC", "models.NAME ASC", "models.NAME DESC");
    let error = req.session.errors;
    req.session.errors = null;
    await req.session.save();
    let user_models = await general_func.retrieve_query(`SELECT models.ID, models.NAME, users.IMAGE_ID, models.ILLUSTRATION from models 
        INNER JOIN users_models ON models.ID  = users_models.MODEL_ID
        INNER JOIN users ON users_models.USER_ID = users.ID where users_models.USER_ID = ? ORDER BY ${FILTER} LIMIT ? OFFSET ?`, [req.session.ID, MODELS_PAGE_ITEMS, OFFSET]);
    res.render('catalog_system/view_models', { title: "Model dashboard", models: user_models, pages: page_amount, applied_filter: ORDER_BY, errors: error });
}
//function to handle the dashboard of products
const product_dashboard = async (req, res) => {
    let length = await general_func.retrieve_query(`SELECT count(*) row_count from products 
        INNER JOIN user_products ON products.id = user_products.PRODUCT_ID where user_products.USER_ID= ? ORDER BY products.id`, [req.session.ID]);
    let { page_amount, OFFSET } = await pagination(req, length);
    let { ORDER_BY, FILTER } = await filter(req, "products.id DESC", "products.id ASC", "products.name ASC", "products.name DESC");
    let error = req.session.errors;
    req.session.errors = null;
    await req.session.save();
    let user_products = await general_func.retrieve_query(`SELECT products.id, products.ILLUSTRATION, users.IMAGE_ID, products.name from products
        INNER JOIN user_products ON products.id = user_products.PRODUCT_ID
        INNER JOIN users ON user_products.USER_ID = users.ID where user_products.USER_ID = ? ORDER BY ${FILTER} LIMIT ? OFFSET ?`, [req.session.ID, PRODUCT_PAGE_ITEMS, OFFSET]);
    res.render('catalog_system/view_products', { title: "Product dashboard", products: user_products, pages: page_amount, applied_filter: ORDER_BY, errors: error });
}
//function to handle the dashboard of products
const catalog_dashboard = async (req, res) => {
    let length = await general_func.retrieve_query(`SELECT count(*) row_count from catalogs 
        INNER JOIN user_catalogs ON catalogs.id = user_catalogs.CATALOG_ID where user_catalogs.USER_ID= ? ORDER BY catalogs.id`, [req.session.ID]);
    let { page_amount, OFFSET } = await pagination(req, length);
    let { ORDER_BY, FILTER } = await filter(req, "catalogs.id DESC", "catalogs.id ASC", "catalogs.CATALOG_NAME ASC", "catalogs.CATALOG_NAME DESC");

    let user_catalogs = await general_func.retrieve_query(`SELECT catalogs.id, catalogs.ILLUSTRATION, users.IMAGE_ID, catalogs.CATALOG_NAME from catalogs
        INNER JOIN user_catalogs ON catalogs.id = user_catalogs.CATALOG_ID 
        INNER JOIN users ON user_catalogs.USER_ID = users.ID where user_catalogs.USER_ID = ? ORDER BY ${FILTER} LIMIT ? OFFSET ?`, [req.session.ID, CATALOG_PAGE_ITEMS, OFFSET]);
    res.render('catalog_system/view_catalogs', { title: "Catalog dashboard", catalogs: user_catalogs, pages: page_amount, applied_filter: ORDER_BY });
}
//function to display latest catalogs on the dashboard
const dashboard = async (req, res) => {
    let catalogs = await general_func.retrieve_query(`SELECT catalogs.id, catalogs.ILLUSTRATION, catalogs.CATALOG_NAME, users.IMAGE_ID from catalogs 
        INNER JOIN user_catalogs ON catalogs.id = user_catalogs.CATALOG_ID 
        INNER JOIN users ON user_catalogs.USER_ID = users.ID ORDER BY catalogs.ID DESC LIMIT ?`, [DASHBOARD_LIMIT]);
    res.render('profile_system/dashboard', { title: "Dashboard", catalogs: catalogs });
}
//function to delete the catalog
const delete_catalog = async (req, res) => {
    try {
        let user_catalog = await general_func.retrieve_query(`SELECT * FROM user_catalogs WHERE USER_ID = ? AND CATALOG_ID = ?`, [req.session.ID, Number(req.params.id)]);
        if (user_catalog.length > 0) {
            await general_func.insert_query(`DELETE FROM user_catalogs WHERE CATALOG_ID = ?`, [Number(req.params.id)]);
            await general_func.insert_query(`DELETE FROM catalog_products WHERE CATALOG_ID = ?`, [Number(req.params.id)]);
            await general_func.insert_query(`DELETE FROM catalogs WHERE ID = ?`, [Number(req.params.id)]);
        }
    }
    catch (err) {
        console.log(err);
    }
    finally {
        res.redirect('/catalog/dashboard/0/none');
    }
}
//function to delete the product
const delete_product = async (req, res) => {
    try {
        let error = "PRODUCT_IN_CATALOG"
        let product_in_catalog = await general_func.retrieve_query(`SELECT * FROM catalog_products WHERE PRODUCT_ID = ?`, [Number(req.params.id)]);
        let user_product = await general_func.retrieve_query(`SELECT * FROM user_products WHERE USER_ID = ? AND PRODUCT_ID = ?`, [req.session.ID, Number(req.params.id)]);
        if (product_in_catalog.length > 0) {
            req.session.errors = [error];
            await req.session.save();
            res.redirect('/product/dashboard/0/none');
            return;
        }
        if (user_product.length > 0) {
            await general_func.insert_query(`DELETE FROM user_products WHERE PRODUCT_ID = ?`, [Number(req.params.id)]);
            await remove_old_tweakpanes(Number(req.params.id));
            await general_func.insert_query(`DELETE FROM products WHERE ID = ?`, [Number(req.params.id)]);
            res.redirect('/product/dashboard/0/none');
            return;
        }
    }
    catch (err) {
        console.log(err);
    }
}
const delete_model = async (req, res) => {
    try {
        let error = "MODEL_IN_PRODUCT"
        let model_in_product = await general_func.retrieve_query(`SELECT * FROM products WHERE model_id = ?`, [Number(req.params.id)]);
        if (model_in_product.length > 0) {
            req.session.errors = [error];
            await req.session.save();
            res.redirect('/model/dashboard/0/none');
            return;
        }
        let user_model = await general_func.retrieve_query(`SELECT * FROM users_models WHERE USER_ID = ? AND MODEL_ID = ?`, [req.session.ID, Number(req.params.id)]);
        if (user_model.length > 0) {
            let model = await general_func.retrieve_query(`SELECT GLB_ID FROM models WHERE ID = ?`, [Number(req.params.id)]);
            await fs.unlink(path.join(__dirname, '../GLB_FILES', model[0].GLB_ID))
            await general_func.insert_query(`DELETE FROM users_models WHERE MODEL_ID = ?`, [Number(req.params.id)]);
            await general_func.insert_query(`DELETE FROM models WHERE ID = ?`, [Number(req.params.id)]);
            res.redirect('/model/dashboard/0/none');
            return;
        }
    }
    catch (err) {
        console.log(err);
    }
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
                let illustration_id = Math.floor(Math.random() * (MAX_MODEL_IMG - MIN_MODEL_IMG) + MIN_MODEL_IMG);
                let GLB_ID = req.file.filename;
                await general_func.insert_query(`INSERT INTO models (NAME, GLB_ID, ILLUSTRATION) VALUES(?,?,?)`, [text, GLB_ID, illustration_id]);
                let GLB = await general_func.retrieve_query(`SELECT ID FROM models WHERE GLB_ID = ?`, [GLB_ID]);
                await general_func.insert_query(`INSERT INTO users_models (USER_ID, MODEL_ID) VALUES(?,?)`, [req.session.ID, GLB[0].ID]);
            }
            catch (err) {
                console.log(err);
            }
            res.redirect('/model/dashboard/0/none');
        }
    });
};

module.exports = { create_catalog, create_product, upload_model, upload_model_post, model_dashboard, create_product_post, create_catalog_post, load_catalog, product_dashboard, catalog_dashboard, dashboard, delete_catalog, delete_product, delete_model, edit_product, edit_product_post, edit_catalog, edit_catalog_post };