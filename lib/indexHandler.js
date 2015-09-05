module.exports = {
	GET: function (req,res) {
		var user = req.user || null;
	  //Spams console with load messages telling who loads each page. Useful for development!
	  if(user) {
	  	console.log('The user "' + user.name + '" loaded the index page.');
	  } 
	  else{
	  	console.log('The index page was loaded anonymously.');
	  }
		res.render('pages/index', {fakeName: null, user:user});
	},
	POST: function (req,res) {
		var user = req.user || null;
		var fakeName = req.body.fakeName || null;
		res.render('pages/index', {fakeName: fakeName, user:user});
	}
};