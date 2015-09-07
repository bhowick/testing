/*=-=-=-=-=-=-=-=-=-=-=-=-=
This code is my first attempt at making something semi-meaningful using NodeJS and
a variety of other helpful code libraries/repositories. I have learned a lot of what's
in here as I've gone along, and as such, it may appear to be slightly incoherent.

I am improving (hopefully!) as I go along, and will continue to test code here as I 
am able to learn more of it. 

Currently Learning:
User Authentication (Specifics)

Learned:
User Authentication (Basic)
Making HTML/CSS Neater
Database interaction (SQLite)
Page handling (GET,POST, etc.)
Parsing variables from a page's body or URL
Externalizing functions into different files (makes this page look neater!)
EJS code alongside HTML

=-=-=-=-=-=-=-=-=-=-=-=-=*/

//THIS IS A COMMENT
/*THIS IS ALSO, HOPEFULLY*/
//NOW IT'S A HAIKU


/*===============================================================
REQUIRED
These things initialize plugins/external code as objects for our 
server to use. 
=================================================================*/

//Plugins (is that the right term?)
var express = require('express'); //Gettin' express code. Express is for NodeJS.
var ejs = require('ejs'); //We're going to use the EJS view engine to render .ejs pages. Neat, <% %>-escaped stuff.
var bodyParser = require('body-parser'); //Parsing variables from document bodies.
var sqlite3 = require('sqlite3').verbose(); //Supposedly .verbose() makes it have more meaningful output to the console.
var validator = require('validator'); //Helps us validate input! Useful for queries.
var cookieParser = require('cookie-parser'); //For cookies.
var passport = require('passport'); //For user authentication.
var session = require('express-session'); //For sessions.
var crypto = require('crypto');
//var morgan = require('morgan'); //For dev output, apparently. 

//Passport (local)
var LocalStrategy = require('passport-local').Strategy;

//SQLite Database
var dbFile = './db/db.sqlite'; //This tells us where our database's file is located.
var db = new sqlite3.Database(dbFile); //Initializes our database as a new object. :)

//My own stuff. Externalized files to handle certain URLs.
var indexHandler = require('./lib/indexHandler.js'); //The "." in front of lib is necessary for this! It's not Terminal!
var addNewEntryHandler = require('./lib/addNewEntryHandler.js'); //For adding new database entries.
var editEntryHandler = require('./lib/editEntryHandler.js'); //For editing database entries.
var registerHandler = require('./lib/registerHandler.js'); //For registering user accounts!
var globalTokens = require('./lib/globalTokens.js'); //For global variables (such as the user's data).

//Express initialization as "app". Kind of important. (Very important!)
var app = express(); //This tells us to use the "app" object for Express calls.


/*===============================================================
MIDDLEWARE
This stuff loads every single time the server receives a request.
=================================================================*/ 
app.set('view engine', 'ejs'); //This is a view engine for Express. It allows us to parse <% %> code.
app.use(session({secret: 'harbfeadtuegwtdlml', resave:true, saveUninitialized:true})); //Not totally sure about these settings.
//app.use(morgan('dev')); //Not sure.
app.use(bodyParser.urlencoded({ extended: false })); //This enables bodyParser. 
app.use(cookieParser('clandestine coin')); //Cookie Parser
app.use(passport.initialize()); //Initializes passport.
app.use(passport.session()); //Initializes passport's session.

//Custom page-loading stuff.
app.use(globalTokens);
app.use(function (req,res,next) {
  req.db = db; //Allows us to externalize database calls.
  req.validator = validator; //Allows us to externalize validator.
  req.crypto = crypto; //Externalizes crypto. Probably not necessary.
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
			//Crypto stuff time.
			var iter = 1000; //Number of hash iterations. Apparently 1000 is recommended. Might also be unnecessary.
			var hashLength = 64; //How long you want the hash to be (bytes).
			var hashType = 'sha256'; //The type of hash to be used.
			var hashedKey = crypto.pbkdf2Sync(password, user.salt, iter, hashLength, hashType); //The actual hashing... thing. Makes raw bytes.
			var hashedPassword = hashedKey.toString('hex');//Takes the bytes and makes a nice string out of them.
			
			if(!user.pass || user.pass != hashedPassword) { //If the user's password is empty or doesn't exist.
				return done(null, false, { message: 'Incorrect password.' });
			}
			var d = new Date();
			var timeStamp = Math.floor(d.getTime()/1000); //We want a workable date in Unix timestamp seconds.
			var newQuery = [timeStamp, user.userID]; //The array to put into the query to update it.

			db.run('UPDATE users SET lastLogin = ? WHERE userID = ?', newQuery, function(err) {
				if(err) {
					return done(err);
				}
				console.log('The user"' + user.name + '" has logged in successfully.');
			});
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

//Telling Express the right directory to use.
app.use(express.static(__dirname + '/views/')); //This tells express to use the /views/ directory.


/*===============================================================
GET
When the server is told to GET something.
=================================================================*/

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
app.get('/register',registerHandler.GET);


/*===============================================================
POST
When the server receives a request to POST somewhere.
=================================================================*/

app.post('/', indexHandler.POST); //Handling data POSTed to the index page.
app.post('/addNewEntry', addNewEntryHandler.POST); //Handling data POSTed to the "add new entry" page.
app.post('/editEntry', editEntryHandler.POST); //Handling data POSTed to the "edit entry" page.
app.post('/login', passport.authenticate('local', {
	successRedirect: '/loginSuccess',
	failureRedirect: '/loginFailure'
})
);
app.post('/register', registerHandler.POST);


/*===============================================================
ALL
Just to show it exists, a way to handle everything (GET,POST)
requested from or sent to a page. 
=================================================================*/
app.all('/deleteEntry', function(req,res) { //Handling database entry deletion and redirecting back to the viewAll page.
	var id = req.body.id || null;
	if(id){
		db.run('DELETE FROM items WHERE id = ?', id, function(err) {
		//Error stuff normally goes here.
		});
	}
	res.redirect('/viewAll');
});


/*===============================================================
LISTENING
On which port is the server going to look for incoming traffic?
=================================================================*/
app.listen(3000); //We are now going to listen on port 3000. Arbitration!
console.log('Listening on Port 3000.'); //To let us know in console when the server is working.
