var express = require('express'); //Gettin' express code. Express is for NodeJS.
//THIS IS A COMMENT
/*THIS IS ALSO, HOPEFULLY*/
//ALSO IT'S A HAIKU
var ejs = require('ejs'); //We're going to use the EJS view engine. Whatever that means! This is new to me.
var bodyParser = require('body-parser');

//Express initialization complete as of the line below.
var app = express();
//BELOW THIS LINE IS WHERE WE DECLARE MIDDLEWARE. It runs every single time before the page loads. 
app.set('view engine', 'ejs'); //This is a view engine for Express. 
app.use(express.static(__dirname + '/views/')); //This tells express to use the /views/ directory.
app.use(bodyParser.urlencoded({ extended: false })); //This enables bodyParser. I am not totally sure at this time what it does.


//"it will make sense IN TIME" - Gamemaster
//uh
app.get('/', function(req,res) {
	//res.send('Hello world!'); //This has become too easy for us now. We are advancing. LET THE RENDERING BEGIN!
	res.render('pages/index', {username: null});
});

//This is used if the server receives a post request! 
app.post('/', function (req,res) {
	var name = req.body.name || null; //Requests the variable 'name' from the body. Thanks, BodyParser!
	res.render('pages/index', {username: name});
});

console.log('Listening on Port 3000.');
app.listen(3000); //We are now going to listen on port 3000. Arbitration!
