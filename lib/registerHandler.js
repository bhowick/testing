//If the server GETs /register
rHGET = function (req,res) {
	//Do we have an error of some kind? If not, regStatus doesn't exist. Tell the page that.
	var regStatus = req.regStatus || null;
	res.render('pages/register', {regStatus:regStatus});
};//end rHGET

//If the server POSTs to /register
rHPOST = function (req,res) {
	var username = req.body.username || null;
	var password = req.body.password || null;
	var passConfirm = req.body.passConfirm || null;

	//Gotta keep those usernames alphanumeric. Because I say so.
	var userCheck = req.validator.isAlphanumeric(username);

	//Testing to make sure our registration goes properly.
	if(!username || !userCheck) {
		//If the user hasn't entered a valid username...
		var regStatus = 'You must enter a valid username. (Alphanumeric, please!)';
		res.render('pages/register', {regStatus:regStatus});
		return;
	}
	else if(!password) {
		//If the user hasn't entered a valid password...
		var regStatus = 'You must enter a password.';
		res.render('pages/register', {regStatus:regStatus});
		return;
	}
	else if(password !== passConfirm) {
		//If the user failed to confirm that password...
		var regStatus = 'Passwords do not match one another.';
		res.render('pages/register', {regStatus:regStatus});
		return;
	}

	//Looks like the user entered valid username/password data. Let's proceed. 
	else {
		//We are now going to see if the username has already been registered. 
		req.db.get('SELECT userID FROM users WHERE name = ?', username, function(err,row){
			if(err){
				var regStatus = 'A database error has occurred.';
				res.render('pages/register', {regStatus:regStatus});
				return;
			}
			//Let's see...
			else {
				var item = row;
				//Is that username already in use? 
				if(item){
					//Yes? Sorry, you have to pick another name.
					var regStatus = 'That username is already in use.';
					res.render('pages/register', {regStatus:regStatus});
					return;
				}
				else {
					//The username isn't in use yet? Cool! Let's add you to the database.
					var d = new Date();
					var timeCreated = Math.floor(d.getTime()/1000);
					var balance = 2500; //Gotta give a new user SOME currency, right?

					//Crypto time? Crypto time.
					var saltBytes = req.crypto.randomBytes(32); //Generates random bytes.
					var salt = saltBytes.toString('hex'); //Salt (random)
					var iter = 1000; //Number of hash iterations. Apparently 1000 is recommended. Might also be unnecessary.
					var hashLength = 64; //How long you want the hash to be (bytes).
					var hashType = 'sha256'; //The type of hash to be used.
					var hashedKey = req.crypto.pbkdf2Sync(password, salt, iter, hashLength, hashType); //The actual hashing... thing. Makes raw bytes.
					var hashedPassword = hashedKey.toString('hex');//Takes the bytes and makes a nice string out of them.

					//Now throw it all into the database!
					//We are using the time the account was created to fill both the timeCreated and lastLogin fields.
					var toDB = [username, hashedPassword, timeCreated, timeCreated, balance, salt];
					req.db.run('INSERT INTO users (name, pass, timeCreated, lastLogin, balance, salt) VALUES (?, ?, ?, ?, ?, ?)', toDB, function (err) {
						if(err) {
							console.log('A database error has occurred while registering an account.');
							var regStatus = 'Database error. Perhaps that username is already in use?';
							res.render('pages/register', {regStatus:regStatus});
							return;
						}
					});//end INSERT
					//Let's tell the console that we've registered someone.
					console.log('Successfully registered user "' + username + '" into the database.');
					//Now send them on their way!
					res.render('pages/regThanks');
				}
			}
		});//end SELECT ("Wait, what?": Evidently this is how I structured it to work.)
	}
};//end rHPOST

module.exports = {
	GET: rHGET,
	POST: rHPOST
};
