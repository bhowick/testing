var express = require('express'); //Gettin' express code. Express is for NodeJS.
//THIS IS A COMMENT
/*THIS IS ALSO, HOPEFULLY*/
//ALSO IT'S A HAIKU
var ejs = require('ejs'); //We're going to use the EJS view engine. Whatever that means! This is new to me.
var bodyParser = require('body-parser');
var sqlite3 = require('sqlite3')/*.verbose()*/; //Supposedly .verbose() makes it have more meaningful output to the console.
var dbFile = './db/db.sqlite';
var db = new sqlite3.Database(dbFile); //Initializes our database as a new object. :)

//Below this are required modules that we're using, not for node/express. Library directory!
var indexHandler = require('./lib/indexHandler.js'); //The "." in front of lib is necessary for this! It's not Terminal!

//Express initialization complete as of the line below.
var app = express();
//BELOW THIS LINE IS WHERE WE DECLARE MIDDLEWARE. It runs every single time before the page loads. 
app.set('view engine', 'ejs'); //This is a view engine for Express. 
app.use(express.static(__dirname + '/views/')); //This tells express to use the /views/ directory.
app.use(bodyParser.urlencoded({ extended: false })); //This enables bodyParser. I am not totally sure at this time what it does.


//"it will make sense IN TIME" - Gamemaster
//uh
app.get('/', indexHandler.GET);
app.get('/viewAll', function(req,res) {
	db.all("SELECT * FROM items", function (err,rows) {
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
app.get('/addNewEntry', function(req,res) {
	res.render('pages/addNewEntry');

});


//This is used if the server receives a post request! 
app.post('/', indexHandler.POST);
app.post('/addNewEntry', function(req,res) { //We're getting all of the entered data from the form here.
	var name = req.body.name;
	var desc = req.body.desc;
	var price = req.body.price;
	var color = req.body.color;

	var newItem = [name, desc, price, color]; //Turns all the variables into one array. Convenience!
	db.run('INSERT INTO items (name,desc,price,color) VALUES(?,?,?,?)', newItem, function(err) {

	});
	res.render('pages/addNewEntry');

});

console.log('Listening on Port 3000.'); //To let us know in console when the server is working.
app.listen(3000); //We are now going to listen on port 3000. Arbitration!
