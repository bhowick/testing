eEHGET = function(req,res) { //If we're getting the page to edit an entry, here's what we do!
	var id = req.query.id || null;
	//We're being told which entry to edit, right?
	if(id) {
		req.db.get('SELECT * FROM items WHERE id = ?', id, function (err,row) {
			if(err){
				res.send('Database Error!');
			}
			else {
				var item = row;
				res.render('pages/editEntry', {item:item});
			}
		});
	}
	//If not, we'll just go to /viewAll instead.
	else {
		res.redirect('/viewAll');
	}
};//end eEHGET

eEHPOST = function(req,res) { //If we're receiving a POST to the editEntry page, here's what we do!
	var id = req.body.id || null;
	var name = req.body.name || null;
	var desc = req.body.desc || null;
	var price = req.body.price || null;
	var color = req.body.color || null;
	var editedItem = [name, desc, price, color, id]; //The item data we're changing!

	if(!color || !req.validator.isAlphanumeric(color)) { //If there's no valid color specified, let's make a random one!
		hexColor = Math.floor(Math.random()*16777215).toString(16);
		color = "#" + hexColor;
	}
	//Now throw the edited stuff into the database.
	req.db.run('UPDATE items SET name=?, desc=?, price=?, color=? WHERE id=?', editedItem, function(err){
		if(err){
			res.send('Database error!');
		}
		else{
			res.redirect('/editEntry'+'?id='+id); //Back to the page we came from, but with updated information!
		}
	});

};//end eEHPOST

module.exports = {
	GET: eEHGET,
	POST: eEHPOST
};
