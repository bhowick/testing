module.exports = {
	//If the server GETs the index page.
	GET: function (req,res) {
	  //Spams console with load messages telling who loads each page. Useful for development!
	  if(req.user) {
	  	console.log('The user "' + req.user.name + '" loaded the index page.');
	  } 
	  else{
	  	console.log('The index page was loaded anonymously.');
	  }
		//Render the index page.
		res.render('pages/index');
	},
	POST: function (req,res) {
		//If the server POSTs to the index page. Just in case!
		res.render('pages/index');
	}
};
