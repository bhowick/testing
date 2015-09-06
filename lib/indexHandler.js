module.exports = {
	GET: function (req,res) {
	  //Spams console with load messages telling who loads each page. Useful for development!
	  if(req.user) {
	  	console.log('The user "' + req.user.name + '" loaded the index page.');
	  } 
	  else{
	  	console.log('The index page was loaded anonymously.');
	  }
		res.render('pages/index', {fakeName: null});
	},
	POST: function (req,res) {
		var fakeName = req.body.fakeName || null;
		res.render('pages/index', {fakeName: fakeName});
	}
};