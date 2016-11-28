var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
	user: {type: Schema.Types.ObjectId, ref: 'User'},
	product: {type: Schema.Types.ObjectId, ref: 'Product'},
	dop: {type: String, required: true},
	imagepath: {type: String, required: true}
});

module.exports = mongoose.model('Maintenance', schema);