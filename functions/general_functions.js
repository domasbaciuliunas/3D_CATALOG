const pool = require('../mariadb');
const multer = require('multer')
const path = require('path')
const crypto = require('crypto');

//FUNCTIONS
//asynchronious function to retrieve data from the database
async function retrieve_query(string, params) {
    let conn;
    try {
        conn = await pool.getConnection();
        const data = await conn.query(string, params);
        return data;
    } finally {
        if (conn) conn.release(); //release connection  back to pool
    }
}
//asynchronious function to insert/update/delete data inside the database
async function insert_query(string, params) {
    let conn;
    try {
        conn = await pool.getConnection();
        await conn.query(string, params);
    }
    finally {
        if (conn) conn.release(); //release connection  back to pool
    }
}
// Function to format date to yyyy-MM-dd
function formatDate(date) {
    return new Date(date).toISOString().split('T')[0];
}
//Higher order function to generate a unique ID
async function generate_unique_ID(query, data_type) {
    let ID = data_type();
    let results = await query(ID);
    if (results.length > 0) { return await generate_unique_ID(query, data_type); }
    else { return ID; }
}
//verify the multer file upload profile images
let upload = multer({
    dest: 'images/active_profiles',
    fileFilter: (req, file, cb) => {
        if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
            cb(null, true);
        } else {
            req.fileValidationError = "file_type";
            cb(null, false);
        }
    },
    limits: { fileSize: 1 * 1000 * 1000 },
}).single('file');

//multer configuration for GLTF file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../GLB_files'))
    },
    filename: async function (req, file, cb) {
       cb(null, await generate_unique_ID((ID) => retrieve_query(`SELECT ID FROM models WHERE GLB_ID = ?`, [ID]),
            () => crypto.randomBytes(64).toString('hex') + '.glb'));
    }
});
let glb_upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if ((file.mimetype == "application/octet-stream" && path.extname(file.originalname) == '.glb')) {
            cb(null, true);
        } else {
            cb(null, false);
        }
    },
    limits: { fileSize: 100 * 1024 * 1024, files: 1 }
}).single('GLB');

module.exports = { retrieve_query, insert_query, formatDate, upload, glb_upload, generate_unique_ID };