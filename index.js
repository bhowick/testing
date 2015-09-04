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

var express = require('express'); //Gettin' express code. Express is for NodeJS.
var ejs = require('ejs'); //We're going to use the EJS view engine to render .ejs pages. Neat, <% %>-escaped stuff.
var bodyParser = require('body-parser');
var sqlite3 = require('sqlite3')/*.verbose()*/; //Supposedly .verbose() makes it have more meaningful output to the console.
var dbFile = './db/db.sqlite'; //This tells us where our database's file is located.
var db = new sqlite3.Database(dbFile); //Initializes our database as a new object. :)
var validator = require('validator'); //Helps us validate input! Useful for queries.

//Below this are required modules that we're using, not for node/express. Library directory!
var indexHandler = require('./lib/indexHandler.js'); //The "." in front of lib is necessary for this! It's not Terminal!
var addNewEntryHandler = require('./lib/addNewEntryHandler.js'); //For adding new database entries.
var editEntryHandler = require('./lib/editEntryHandler.js'); //For editing database entries.

//Express initialization complete as of the line below.
var app = express(); //This tells us to use the "app" object for Express calls.

//BELOW THIS LINE IS WHERE WE DECLARE MIDDLEWARE. It runs every single time before the page loads. 
app.set('view engine', 'ejs'); //This is a view engine for Express. It allows us to parse <% %> code.

app.use(express.static(__dirname + '/views/')); //This tells express to use the /views/ directory.
app.use(bodyParser.urlencoded({ extended: false })); //This enables bodyParser. I am not totally sure at this time what it does.
app.use(function (req,res,next) { //Enables us to make database calls and validate stuff from other pages.
  req.db = db;
  req.validator = validator;
  next();
});

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


//[app.post] - This is used if the server receives a post request! 
app.post('/', indexHandler.POST); //Handling data POSTed to the index page.
app.post('/addNewEntry', addNewEntryHandler.POST); //Handling data POSTed to the "add new entry" page.
app.post('/editEntry', editEntryHandler.POST); //Handling data POSTed to the "edit entry" page.

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
