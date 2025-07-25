//requires
const express = require('express');
const routes = require('./routes/router');
const Restricted_routes = require('./routes/Restricted_routes');
var session = require('express-session');
const bodyParser = require('body-parser');
const crypto = require('node:crypto');
const MySQLStore = require('express-mysql-session')(session);
const methodOverride = require('method-override');

//expressjs configuration
const app = express();
const port = 3000;

app.listen(port)
app.use(express.static('public'));
app.use('/images', express.static('images'));
app.use('/GLB_FILES', express.static('GLB_FILES'));
//Links the bootstrap CSS and JS files to the public directory
app.use('/scripts', express.static(__dirname + '/node_modules/bootstrap/dist/'));
//Links to the node_modules directory to access other libraries
app.use('/tweakpane', express.static(__dirname + '/node_modules/tweakpane/dist/'));
app.use('/masonry', express.static(__dirname + '/node_modules/masonry-layout/dist/'));
//Parse the request bodies to json using body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//set the view engine to ejs and the views directory to views
app.set('view engine', 'ejs');
app.set('views', 'views');

//session storage option
const options = {
	host: 'localhost',
	port: 3306,
	user: 'root',
	password: '1234',
	database: '3d_catalog'
};

//store to MARIADB
const sessionStore = new MySQLStore(options);

//start the session
app.use(session({
   secret: crypto.randomBytes(16).toString('hex'), //generates a secure secret using node:crypto
   resave: false,
   saveUninitialized: false,
   store: sessionStore,
   cookie: {
      maxAge: 60000 * 60,
      secure: false,  //when secure true, session cookie only works for HTTPS
   }
}));

//use the routes from the router.js file
app.use(routes)
//middleware to monitor user access from restricted/non-restricted
app.use((req, res, next) => {
   if (req.session.authorized) { next(); return; }
   else { res.redirect('/'); }
});
//method override middleware, which allows for delete and put requests to be placed in forms
app.use(methodOverride('_method'));
//use the routes from the Restricted_routes.js file
app.use(Restricted_routes);
//if we don't find a route, we render the 404 page
app.use((req, res) => {
   res.status(404).render('./Errors/404', { title: '404' });
});

module.exports = {app};