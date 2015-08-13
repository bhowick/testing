var express = require('express'); //Gettin' express code.
//THIS IS A COMMENT
/*THIS IS ALSO, HOPEFULLY*/
//ALSO IT'S A HAIKU

//Express initialization complete as of the line below.
var app = express();

//"it will make sense IN TIME" - Gamemaster
//uh
app.get('/', function(req,res) {
	res.send('Hello world!');
});

console.log('Listening on Port 3000.');
app.listen(3000); //We are now going to listen on port 3000. Arbitration!
