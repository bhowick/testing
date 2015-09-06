//Variables/objects we'd ideally like to have for every page.
module.exports = function (req,res, next) {
	res.locals.user = req.user || null;
	next();
};
