const general_func = require('../functions/general_functions'); //retrieves general functions 
const multer = require('multer');
const fs = require('fs').promises;
const path = require('path');

//Constants for validation
const NAME_LENGTH_MIN = 3;
const NAME_LENGTH_MAX = 50;

const DESCRIPTION_LENGTH_MAX = 1000;
const DESCRIPTION_LENGTH_MIN = 3;

const MAX_TWEAKPANES = 15;

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
        products_keyed[product.id].description = products_keyed[product.id].description.replace(/(\r\n|\n)/g, '<br>').replace(/(\t)/g, ' ');
        products_keyed[product.id].name = products_keyed[product.id].name.replace(/(\r\n|\n)/g, ' ').replace(/(\t)/g, ' ');
        interest_points[product.id].forEach(ip => {
            ip.text = ip.text.replace(/(\r\n|\n)/g, '<br>').replace(/(\t)/g, ' ');
            ip.header = ip.text.replace(/(\r\n|\n)/g, ' ').replace(/(\t)/g, ' ');
        });
    }
    res.render('catalog_system/create_catalog', { title: 'Create Catalog', products: products, models: models, cubemaps: cubemaps, ambient_lights: ambient_lights, interest_points: interest_points, spotlights: spotlights, keyed_products: products_keyed });
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
    }
    let error_block = [];
    if (data_block.name === "" || data_block.name.length > NAME_LENGTH_MAX || data_block.name.length < NAME_LENGTH_MIN) {
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
        if (isNaN(Number(data_block.price)) || Number(data_block.price < 0)) {
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
//function to save ambient lights to the database
async function AMBIENT_LIGHTS_INSERT(light, ID) {
    let data = JSON.parse(light);
    data.intensity = Math.round((data.intensity + Number.EPSILON) * 1000) / 1000;
    data.r = Math.round((data.r + Number.EPSILON) * 1000) / 1000;
    data.g = Math.round((data.g + Number.EPSILON) * 1000) / 1000;
    data.b = Math.round((data.b + Number.EPSILON) * 1000) / 1000;
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
    data.r = Math.round((data.r + Number.EPSILON) * 1000) / 1000;
    data.g = Math.round((data.g + Number.EPSILON) * 1000) / 1000;
    data.b = Math.round((data.b + Number.EPSILON) * 1000) / 1000;
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
                callback(item, ID);
            }
        }
        else {
            callback(data_array, ID);
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
            //assign color based on checkmark
            if (data_block.arrow_color === "") { data_block.arrow_color = "white" }
            else { data_block.arrow_color = "black" }
            if (data_block.ip_color === "") { data_block.ip_color = "white" }
            else { data_block.ip_color = "black" }
            if (data_block.menu_color === "") { data_block.menu_color = "white" }
            else { data_block.menu_color = "black" }

            let model_id = await general_func.retrieve_query(`SELECT ID FROM models WHERE GLB_ID = ?`, [data_block.model]);
            let ID = await general_func.insert_query_get_ID(`INSERT INTO products (arrows, ip_color, menu, model_id, cubemap_id, name, description, price, item_scale, original_scale) VALUES(?,?,?,?,?,?,?,?,?,?)`,
                [data_block.arrow_color, data_block.ip_color, data_block.menu_color, model_id[0]["ID"], Number(data_block.background), data_block.name, data_block.description, data_block.price, data_block.scale, Number(data_block.original_scale)]);
            await write_json(req.body.ambient, AMBIENT_LIGHTS_INSERT, ID);
            await write_json(req.body.interest_point, INTEREST_POINT_INSERT, ID);
            await write_json(req.body.spotlight, SPOTLIGHT_INSERT, ID);
            general_func.insert_query(`INSERT INTO user_products (USER_ID, PRODUCT_ID) VALUES(?,?)`, [req.session.ID, ID])
            res.redirect('/product/create');
        }
    }
    catch (err) {
        console.log(err);
    }
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

module.exports = { create_catalog, create_product, upload_model, upload_model_post, model_dashboard, create_product_post };