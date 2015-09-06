//Adding a new entry to the items database? Here's where it's handled.
aNEGET = function(req,res) {
	var user = req.user || null; //Might be temporary until this is globalized.
	var itemAdded = false;
	res.render('pages/addNewEntry', {itemAdded:itemAdded, user:user}); //Renders the addNewEntry.ejs page.
};

aNEPOST = function(req,res) {
	var user = req.user || null; //Might be temporary until this is globalized.
	var name = req.body.name;
	var desc = req.body.desc;
	var price = req.body.price;
	var color = req.body.color;

	name = req.validator.escape(name); //These three lines make sure someone can't screw with page rendering by injecting HTML.
	desc = req.validator.escape(desc);

	if(!color) {
		hexColor = Math.floor(Math.random()*16777215).toString(16);
		color = "#" + hexColor;
	}
	else{
		color = req.validator.escape(color);
	}

	var newItem = [name, desc, price, color]; //Turns all the variables into one array. Convenience!

	
	if(!req.validator.isNumeric(price)) { //Makes sure our Price is actually a number.
		console.log('Not an integer.');
		res.redirect('/addNewEntry');
		return;
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
			return;
		}
		var itemAdded = true;
		res.render('pages/addNewEntry', {itemAdded:itemAdded, user:user});
	});
	

};
module.exports = {
	GET: aNEGET,
	POST: aNEPOST
};