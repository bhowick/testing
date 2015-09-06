rHGET = function (req,res) {
	var regStatus = req.regStatus || null;
	res.render('pages/register', {regStatus:regStatus});
};

rHPOST = function (req,res) {
	var username = req.body.username || null;
	var password = req.body.password || null;
	var passConfirm = req.body.passConfirm || null;

	var userCheck = req.validator.isAlphanumeric(username);
	//Testing to make sure our registration goes properly.
	if(!username || !userCheck) {
		var regStatus = 'You must enter a valid username. (Alphanumeric, please!)';
		res.render('pages/register', {regStatus:regStatus});
		return;
	}
	else if(!password) {
		var regStatus = 'You must enter a password.';
		res.render('pages/register', {regStatus:regStatus});
		return;
	}
	else if(password !== passConfirm) {
		var regStatus = 'Passwords do not match one another.';
		res.render('pages/register', {regStatus:regStatus});
		return;
	}
	else {
		req.db.get('SELECT userID FROM users WHERE name = ?', username, function(err,row){
			if(err){
				var regStatus = 'A database error has occurred.';
				res.render('pages/register', {regStatus:regStatus});
				return;
			}
			else {
				var item = row;
				if(item){
					var regStatus = 'That username is already in use.';
					res.render('pages/register', {regStatus:regStatus});
					return;
				}
				else {
					var d = new Date();
					var timeCreated = Math.floor(d.getTime()/1000);
					var balance = 2500; //Gotta give a new user SOME currency, right?

					//Now throw it all into the database!
					var toDB = [username, password, timeCreated, timeCreated, balance];
					req.db.run('INSERT INTO users (name, pass, timeCreated, lastLogin, balance) VALUES (?, ?, ?, ?, ?)', toDB, function (err) {
						if(err) {
							console.log('A database error has occurred while registering an account.');
							var regStatus = 'Database error. Perhaps that username is already in use?';
							res.render('pages/register', {regStatus:regStatus});
							return;
						}
					});
					console.log('Successfully registered user "' + username + '" into the database.');
					res.render('pages/regThanks');
				}
			}
		});
	}
};

module.exports = {
	GET: rHGET,
	POST: rHPOST
};