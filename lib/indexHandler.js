module.exports = {
	GET: function (req,res) {
		res.render('pages/index', {username: null});
	},
	POST: function (req,res) {
		var name = req.body.name || null;
		res.render('pages/index', {username: name});
	}
};