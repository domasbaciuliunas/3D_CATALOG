var mariadb = require('mariadb');
const pool = mariadb.createPool(
    {
        host: 'localhost', //needs to be changed later
        user: 'pondleaf_connection', //needs to be changed later
        password: '1234', //needs to be changed later
        database: '3d_catalog', 
        connectionLimit: 5, //needs to be changed later
        collation: 'utf8mb4_unicode_ci',
        charset : 'utf8mb4'
    });

module.exports = pool;