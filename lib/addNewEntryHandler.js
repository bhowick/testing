//Adding a new entry to the items database? Here's where it's handled.
//If the server needs to GET /addNewEntry.
aNEGET = function(req,res) {
	var itemAdded = false; //Tells us that an item hasn't been added... yet.
	res.render('pages/addNewEntry', {itemAdded:itemAdded}); //Renders the addNewEntry.ejs page.
};//end aNEGET

//If the server receives a POST request to /addNewEntry.
aNEPOST = function(req,res) {
	var name = req.body.name;
	var desc = req.body.desc;
	var price = req.body.price;
	var color = req.body.color || null;

	//name = req.validator.escape(name); //These lines make sure someone can't screw with page rendering by injecting HTML.
	//desc = req.validator.escape(desc); //For now we're leaving this off. It makes certain characters weird.

	if(!color || !req.validator.isAlphaNumeric(color)) { //If there's no valid color specified, let's make a random one!
		hexColor = Math.floor(Math.random()*16777215).toString(16);
		color = "#" + hexColor;
	}

	var newItem = [name, desc, price, color]; //Turns all the variables into one array. Convenience!

	
	if(!req.validator.isNumeric(price)) { //Makes sure our Price is actually a number.
		console.log('Not an integer.');
		res.redirect('/addNewEntry');
		return; //??????
	}
	/*if(!validator.isHexColor(color)) { //Makes sure our Color is actually a hex color. Not strictly necessary!
		console.log('That is not a color!');
		res.redirect('/addNewEntry');
		return;
	}*/

	req.db.run('INSERT INTO items (name,desc,price,color) VALUES(?,?,?,?)', newItem, function(err) {
		//Error stuff normally goes here.
		if(err) {
			res.send('Database error!');
			return; //Not sure if this is going to work properly, to be quite honest. 
		}
		var itemAdded = true; //Tells our addNewEntry page that an item has been added!
		res.render('pages/addNewEntry', {itemAdded:itemAdded});
	});
	

};//end aNEPOST

module.exports = {
	GET: aNEGET,
	POST: aNEPOST
};
