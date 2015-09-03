eEHGET = function(req,res) { //If we're getting the page to edit an entry, here's what we do!
	var id = req.query.id || null;
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
	else {
		res.redirect('/viewAll');
	}
};

eEHPOST = function(req,res) { //If we're receiving a POST from the editEntry page, here's what we do!
	var id = req.body.id || null;
	var name = req.body.name || null;
	var desc = req.body.desc || null;
	var price = req.body.price || null;
	var color = req.body.color || null;
	var editedItem = [name, desc, price, color, id]; //The item data we're changing!

	req.db.run('UPDATE items SET name=?, desc=?, price=?, color=? WHERE id=?', editedItem, function(err){
		if(err){
			res.send('Database error!');
		}
		else{
			res.redirect('/editEntry'+'?id='+id);
		}
	});

};

module.exports = {
	GET: eEHGET,
	POST: eEHPOST
};