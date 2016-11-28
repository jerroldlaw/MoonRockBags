var Product = require('../models/product');

var mongoose = require('mongoose');
mongoose.connect('localhost:27017/shopping');

var products = [
	new Product({
		imagePath: 'images/1.jpg',
		title: 'Blue Bag',
		description: 'Nice Blue Bag',
		price: 12
	}),

	new Product({
		imagePath: 'images/6.jpg',
		title: 'Red Bag',
		description: 'Nice Red Bag',
		price: 12
	})
];

var done = 0;
for (var i = 0; i < products.length; i++){
	products[i].save(function(err, result){
		done++;
		if (done === products.length){
			exit();
		}
	});
}

function exit(){
	mongoose.disconnect();
}
