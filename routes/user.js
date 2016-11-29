var express     = require('express');
var router      = express.Router();
var multer      = require('multer');
var csrf        = require('csurf');
var passport    = require('passport');
var fs          = require('fs');

var Maintenance = require('../models/maintenance');
var Product     = require('../models/product');
var Order       = require('../models/order');
var Cart        = require('../models/cart');

var upload = multer({ dest: 'maintenance/' })
var csrfProtection = csrf();
router.use(csrfProtection);

router.get('/profile', isLoggedIn, function(req, res, next){
	Order.find({user: req.user}, function(err, orders){
		if (err){
			return res.write('Error!');
		}
		var cart;
		orders.forEach(function(order){
			cart = new Cart(order.cart);
			order.items = cart.generateArray();
		});

		res.render('user/profile', {orders: orders});
	});	
});

router.get('/maintenance', isLoggedIn, function(req, res, next){
    Product.find(function (err, products) {
        res.render('user/maintenance', {title: 'Maintenance', csrfToken: req.csrfToken(), products: products});
    });
});

router.post('/maintenance', isLoggedIn, upload.single('imagefile'), function(req, res, next){
	console.log(req.file);
	fs.readFile(req.file.path, function (err, data) {
		var dir = "./maintenance/" + req.user.id
		if (!fs.existsSync(dir)){
			fs.mkdirSync(dir);
		}
		var newPath = dir + "/" + Date.now() + ".jpg";
		fs.writeFile(newPath, data, function (err) {
			if (err){
				console.log(err);
			}
			fs.unlink(req.file.path);
			var maintenance = new Maintenance({
				user     : req.user,
				product  : req.body.product,
				dop      : req.body.dop,
				imagepath: newPath
			});
			maintenance.save(function(err, result){
				req.flash('success', 'Maintenance was submitted!');
				res.redirect('/');
			});
		});
	});


})

router.get('/logout', isLoggedIn, function(req, res, next){
	req.logout();
	res.redirect('/');
});

router.use('/', notLoggedIn, function(req, res, next){
	next();
});

router.get('/signup', function(req, res, next){
	var messages = req.flash('error');
	res.render('user/signup', {csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0});
});

router.post('/signup', passport.authenticate('local.signup', {
	failureRedirect: '/user/signup',
	failureFlash: true
}), function(req, res, next){
	if (req.session.oldUrl){
		var oldUrl = req.session.oldUrl;
		req.session.oldUrl = null;
		res.redirect(oldUrl);
	}
	else{
		res.redirect('/user/profile');
	}
});

router.get('/signin', function(req, res, next){
	var messages = req.flash('error');
	res.render('user/signin', {csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0});
});

router.post('/signin', passport.authenticate('local.signin', {
	failureRedirect: '/user/signin',
	failureFlash: true
}), function(req, res, next){
	if (req.session.oldUrl){
		var oldUrl = req.session.oldUrl;
		req.session.oldUrl = null;
		res.redirect(oldUrl);
	}
	else{
		res.redirect('/user/profile');
	}
});

module.exports = router;

function isLoggedIn(req, res, next){
	if (req.isAuthenticated()){
		return next();
	}
	res.redirect('/');
}

function notLoggedIn(req, res, next){
	if (!req.isAuthenticated()){
		return next();
	}
	res.redirect('/');
}