/*=-=-=-=-=-=-=-=-=-=-=-=-=
This code is my first attempt at making something semi-meaningful using NodeJS and
a variety of other helpful code libraries/repositories. I have learned a lot of what's
in here as I've gone along, and as such, it may appear to be slightly incoherent.

I am improving (hopefully!) as I go along, and will continue to test code here as I 
am able to learn more of it. 

Currently Learning:
User Authentication

Learned:
Database interaction (SQLite)
Page handling (GET,POST, etc.)
Parsing variables from a page's body or URL
Externalizing functions into different files (makes this page look neater!)
EJS code alongside HTML

=-=-=-=-=-=-=-=-=-=-=-=-=*/

//THIS IS A COMMENT
/*THIS IS ALSO, HOPEFULLY*/
//NOW IT'S A HAIKU

//Plugins (is that the right term?)
var express = require('express'); //Gettin' express code. Express is for NodeJS.
var ejs = require('ejs'); //We're going to use the EJS view engine to render .ejs pages. Neat, <% %>-escaped stuff.
var bodyParser = require('body-parser'); //Parsing variables from document bodies.
var sqlite3 = require('sqlite3').verbose(); //Supposedly .verbose() makes it have more meaningful output to the console.

var validator = require('validator'); //Helps us validate input! Useful for queries.
var cookieParser = require('cookie-parser'); //For cookies.
var passport = require('passport'); //For user authentication.
var session = require('express-session'); //For sessions.
//var morgan = require('morgan'); //For dev output, apparently. 


//Passport (local)
var LocalStrategy = require('passport-local').Strategy;


//SQLite Database
var dbFile = './db/db.sqlite'; //This tells us where our database's file is located.
var db = new sqlite3.Database(dbFile); //Initializes our database as a new object. :)


//Externalized files to handle certain URLs. Library directory!
var indexHandler = require('./lib/indexHandler.js'); //The "." in front of lib is necessary for this! It's not Terminal!
var addNewEntryHandler = require('./lib/addNewEntryHandler.js'); //For adding new database entries.
var editEntryHandler = require('./lib/editEntryHandler.js'); //For editing database entries.


//Express initialization as "app".
var app = express(); //This tells us to use the "app" object for Express calls.


//BELOW THIS LINE IS WHERE WE DECLARE MIDDLEWARE. It runs every single time before the page loads. 
app.set('view engine', 'ejs'); //This is a view engine for Express. It allows us to parse <% %> code.
app.use(session({secret: 'harbfeadtuegwtdlml', resave:true, saveUninitialized:true})); //Not totally sure about these settings.
//app.use(morgan('dev')); //Not sure.
app.use(bodyParser.urlencoded({ extended: false })); //This enables bodyParser. 
app.use(cookieParser('clandestine coin')); //Cookie Parser
app.use(passport.initialize()); //Initializes passport.
app.use(passport.session()); //Initializes passport's session.

//Custom page-loading stuff.
app.use(function (req,res,next) {
  req.db = db; //Allows us to externalize database calls.
  req.validator = validator; //Allows us to externalize validator.
  next();
});

//Local Passport Strategy
passport.use(new LocalStrategy(
	function(username, password, done) {
		db.get('SELECT * FROM users WHERE name = ?', username, function(err,user) { //"user" is the row itself.
			if(err) { //If the query errors out.
				return done(err);
			}
			if(!user) { //If the user doesn't exist.
				return done(null, false, { message: 'Username not found.' });
			}
			if(!user.pass || user.pass != password) { //If the user's password is empty or doesn't exist.
				return done(null, false, { message: 'Incorrect password.' });
			}
			return done(null, user); //Returns the user as an object if everything checks out.
		});

	}
));

//More Passport Stuff
passport.serializeUser(function (user,done) {
	done(null,user);
});
passport.deserializeUser(function (user,done) {
	done(null,user);
});


app.use(express.static(__dirname + '/views/')); //This tells express to use the /views/ directory.

//[app.get] - This is used if the server is told to get a URL.
app.get('/', indexHandler.GET); //Rendering the index page!
app.get('/viewAll', function(req,res) { //Rendering the database onto a nice little output page!
	db.all('SELECT * FROM items', function (err,rows) {
		//If the database messes up...
		if(err) {
			res.send('Database Error!');
		}
		else {
			var items = rows;

			res.render('pages/viewAll', {items:items}); //The lack of a "/" before "pages" is needed. Otherwise it errors!
		}
	});
	
});
app.get('/addNewEntry', addNewEntryHandler.GET); //Loading the "add new entry" form page.
app.get('/editEntry', editEntryHandler.GET); //Loading the "edit entry" form page.
app.get('/confirmDelete', function(req,res) { //Loading the confirmation page for deleting an entry.
	var id = req.query.id || null;
	if(id) {
		db.get('SELECT * FROM items WHERE id = ?', id, function(err,row){
			if(err) {
				res.send('Database Error!');
			}
			else {
				var item = row;
				res.render('pages/confirmDelete', {item:item});
			}
		});
	}
	else {
		res.redirect('/viewAll');
	}
});
app.get('/login', function (req,res) {
	res.render('pages/login');
});
app.get('/loginFailure', function(req,res) {
	console.log('Failed to authenticate user.');
	res.redirect('/login');
});
app.get('/loginSuccess', function(req,res) {
	console.log('Successfully authenticated user.');
	res.redirect('/');
});
app.get('/logout', function (req,res) {
	req.logout();
	res.redirect('/');
});

//[app.post] - This is used if the server receives a post request! 
app.post('/', indexHandler.POST); //Handling data POSTed to the index page.
app.post('/addNewEntry', addNewEntryHandler.POST); //Handling data POSTed to the "add new entry" page.
app.post('/editEntry', editEntryHandler.POST); //Handling data POSTed to the "edit entry" page.
app.post('/login', passport.authenticate('local', {
	successRedirect: '/loginSuccess',
	failureRedirect: '/loginFailure'
})
);


//[app.all] - For handling pages that are only really loaded one way!
app.all('/deleteEntry', function(req,res) { //Handling database entry deletion and redirecting back to the viewAll page.
	var id = req.body.id || null;
	if(id){
		db.run('DELETE FROM items WHERE id = ?', id, function(err) {
		//Error stuff normally goes here.
		});
	}
	res.redirect('/viewAll');
});

console.log('Listening on Port 3000.'); //To let us know in console when the server is working.
app.listen(3000); //We are now going to listen on port 3000. Arbitration!
